import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  AlertTriangle, CheckCircle, Clock, Plus,
  TrendingUp, TrendingDown, Users, ShieldCheck, GraduationCap, ArrowRight, Pencil, Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { reportService } from '../services/reportService';
import { incidentService } from '../services/incidentService';
import type { DashboardStats, Incident } from '../types';
import { Button } from '../components/common/Button';
import { PageSpinner } from '../components/common/Spinner';
import { IncidentStatusBadge } from '../components/common/Badge';
import { usePermissions } from '../hooks/usePermissions';
import { useCountUp } from '../hooks/useCountUp';
import toast from 'react-hot-toast';

/* ── Constants ─────────────────────────────────────────────────────────────── */

const PIE_COLORS = ['#009850', '#f59e0b', '#10b981', '#6b7280'];

const EMPTY_STATS: DashboardStats = {
  totalIncidents: 0, openIncidents: 0, inProgressIncidents: 0,
  closedIncidents: 0, followUpIncidents: 0, totalAffectedPersons: 0,
  totalEvidences: 0, totalTrainings: 0, totalParticipants: 0,
  certifiedParticipants: 0, totalBrigadistas: 0, activeBrigadistas: 0,
  incidentsByEventType: {}, incidentsByDistrict: {},
};

const WIDGET_IDS = ['stat-cards', 'charts', 'recent', 'brigadistas-summary'] as const;
type WidgetId = typeof WIDGET_IDS[number];
const LAYOUT_KEY = 'caritas-dashboard-layout';

function loadLayout(): WidgetId[] {
  try {
    const s = localStorage.getItem(LAYOUT_KEY);
    if (s) {
      const parsed = JSON.parse(s) as WidgetId[];
      if (WIDGET_IDS.length === parsed.length && WIDGET_IDS.every(id => parsed.includes(id)))
        return parsed;
    }
  } catch { /* ignore */ }
  return [...WIDGET_IDS];
}

function pct(num: number, den: number) {
  return den ? Math.round((num / den) * 100) : 0;
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return <span className={className}>{useCountUp(value).toLocaleString()}</span>;
}

interface ModernCardProps {
  title: string; value: number; icon: React.ReactNode;
  iconBg: string; iconColor: string;
  trendValue: number; trendLabel: string; trendGood: boolean;
}
function ModernCard({ title, value, icon, iconBg, iconColor, trendValue, trendLabel, trendGood }: ModernCardProps) {
  const animated = useCountUp(value);
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${trendGood ? 'text-green-600' : 'text-red-500'}`}>
          {trendGood ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trendValue}%
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{animated.toLocaleString()}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{trendLabel}</p>
    </div>
  );
}

/* ── SortableWidget ─────────────────────────────────────────────────────────── */

function SortableWidget({ id, editMode, entering, dragging, children }: {
  id: WidgetId; editMode: boolean; entering: boolean; dragging: boolean; children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !editMode });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? undefined
      : transition ?? 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
    zIndex: isDragging ? 50 : undefined,
  };

  // entering → one-shot nudge; dragging another widget → subtle loop; neither → still
  const animClass = !isDragging && entering
    ? 'animate-jiggle-enter'
    : !isDragging && dragging
    ? 'animate-jiggle-hold'
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'relative select-none',
        animClass,
        editMode && !isDragging ? 'cursor-grab' : '',
        isDragging ? 'cursor-grabbing scale-[1.02] opacity-95 drop-shadow-2xl' : '',
      ].filter(Boolean).join(' ')}
      {...(editMode ? { ...attributes, ...listeners } : {})}
    >
      {editMode && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-violet-400/60 ring-offset-2 pointer-events-none z-10 transition-all" />
      )}
      {children}
    </div>
  );
}

/* ── Chromatic aberration SVG filter ────────────────────────────────────────── */

function ChromaFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
      <defs>
        <filter id="chroma-aberration" x="-3%" width="106%" y="0%" height="100%"
          colorInterpolationFilters="sRGB">
          {/* Red channel — shift left */}
          <feColorMatrix type="matrix" in="SourceGraphic" result="r-only"
            values="1 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 1 0" />
          <feOffset in="r-only" dx="-3" dy="0" result="r-shifted" />
          {/* Green channel — no shift */}
          <feColorMatrix type="matrix" in="SourceGraphic" result="g-only"
            values="0 0 0 0 0   0 1 0 0 0   0 0 0 0 0   0 0 0 1 0" />
          {/* Blue channel — shift right */}
          <feColorMatrix type="matrix" in="SourceGraphic" result="b-only"
            values="0 0 0 0 0   0 0 0 0 0   0 0 1 0 0   0 0 0 1 0" />
          <feOffset in="b-only" dx="3" dy="0" result="b-shifted" />
          {/* Add channels together */}
          <feComposite in="r-shifted" in2="g-only"
            operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="rg" />
          <feComposite in="rg" in2="b-shifted"
            operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>
      </defs>
    </svg>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────────────────── */

export function Dashboard() {
  const [stats, setStats]         = useState<DashboardStats | null>(null);
  const [recentInc, setRecentInc] = useState<Incident[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editMode, setEditMode]     = useState(false);
  const [entering, setEntering]     = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(loadLayout);
  const [dragging, setDragging]     = useState(false);

  const navigate = useNavigate();
  const { canCreateIncident, canManageBrigadistas } = usePermissions();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [data, incPage] = await Promise.all([
          reportService.getDashboard(),
          incidentService.getAll({ page: 0, size: 4 }).catch(() => null),
        ]);
        setStats(data);
        if (incPage) setRecentInc(incPage.content);
      } catch {
        setStats(EMPTY_STATS);
        toast.error('No se pudo cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageSpinner />;
  if (!stats)  return null;

  const byEventType = Object.entries(stats.incidentsByEventType ?? {}).map(([name, value]) => ({ name, value }));
  const byStatus = [
    { name: 'Abierta',     value: stats.openIncidents       ?? 0 },
    { name: 'En atención', value: stats.inProgressIncidents ?? 0 },
    { name: 'Cerrada',     value: stats.closedIncidents     ?? 0 },
    { name: 'Seguimiento', value: stats.followUpIncidents   ?? 0 },
  ];

  const openRate    = pct(stats.openIncidents,   stats.totalIncidents);
  const closedRate  = pct(stats.closedIncidents, stats.totalIncidents);
  const avgAffected = stats.totalIncidents
    ? Math.round(stats.totalAffectedPersons / stats.totalIncidents) : 0;
  const brigadistaActiveRate = pct(stats.activeBrigadistas, stats.totalBrigadistas);

  /* ── Widget content map ── */
  const widgets: Record<WidgetId, React.ReactNode> = {

    'stat-cards': (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <ModernCard title="Total Incidencias" value={stats.totalIncidents ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />} iconBg="bg-green-50" iconColor="text-[#009850]"
          trendValue={openRate} trendLabel={`${stats.openIncidents} abiertas actualmente`} trendGood={openRate < 40} />
        <ModernCard title="Incidencias Abiertas" value={stats.openIncidents ?? 0}
          icon={<Clock className="h-5 w-5" />} iconBg="bg-amber-50" iconColor="text-amber-600"
          trendValue={pct(stats.inProgressIncidents, stats.openIncidents + stats.inProgressIncidents)}
          trendLabel={`${stats.inProgressIncidents} en atención activa`} trendGood={true} />
        <ModernCard title="Incidencias Cerradas" value={stats.closedIncidents ?? 0}
          icon={<CheckCircle className="h-5 w-5" />} iconBg="bg-green-50" iconColor="text-green-600"
          trendValue={closedRate} trendLabel="Tasa de resolución" trendGood={closedRate > 40} />
        <ModernCard title="Personas Afectadas" value={stats.totalAffectedPersons ?? 0}
          icon={<Users className="h-5 w-5" />} iconBg="bg-blue-50" iconColor="text-blue-600"
          trendValue={avgAffected} trendLabel="Promedio por incidencia" trendGood={avgAffected < 10} />
      </div>
    ),

    'charts': (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">Incidencias por Tipo de Evento</h2>
              <p className="text-xs text-gray-500">Distribución histórica</p>
            </div>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byEventType} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Bar dataKey="value" fill="#009850" radius={[4, 4, 0, 0]} name="Incidencias" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-800">Estado de Incidencias</h2>
            <p className="text-xs text-gray-500">Distribución actual</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),

    'recent': (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Incidencias Recientes</h2>
            <p className="text-xs text-gray-500">Últimas incidencias registradas</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {recentInc.map((inc) => (
            <div key={`inc-${inc.id}`}
              className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => !editMode && navigate(`/incidents/${inc.id}`)}>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 flex-shrink-0 w-16 justify-center">GRD</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{inc.eventType} — {inc.district}</p>
                <p className="text-xs text-gray-400 truncate">{inc.description}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {inc.incidentDate && (
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {format(new Date(inc.incidentDate), 'd MMM yyyy', { locale: es })}
                  </span>
                )}
                <IncidentStatusBadge status={inc.status} />
              </div>
            </div>
          ))}
          {recentInc.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No hay actividades recientes</p>
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-50 flex gap-4">
          <button onClick={() => navigate('/incidents')}
            className="text-xs text-[#009850] hover:underline flex items-center gap-1">
            Ver todas las incidencias <ArrowRight className="h-3 w-3" />
          </button>
          <button onClick={() => navigate('/training')}
            className="text-xs text-[#009850] hover:underline flex items-center gap-1">
            Ver capacitaciones <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    ),

    'brigadistas-summary': (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-[#009850] transition-colors"
          onClick={() => !editMode && navigate('/brigadistas')}>
          <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-[#009850]" />
          </div>
          <div>
            <AnimatedNumber value={stats.totalBrigadistas ?? 0} className="text-2xl font-bold text-gray-900" />
            <p className="text-xs text-gray-500 mt-0.5">Brigadistas parroquiales</p>
          </div>
          <span className="ml-auto text-xs font-semibold text-green-600 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />{brigadistaActiveRate}%
          </span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
          <AnimatedNumber value={stats.activeBrigadistas ?? 0} className="text-2xl font-bold text-[#009850]" />
          <p className="text-xs text-gray-500 mt-1">Disponibles</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => !editMode && navigate('/training')}>
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <AnimatedNumber value={stats.totalTrainings ?? 0} className="text-2xl font-bold text-gray-900" />
            <p className="text-xs text-gray-500 mt-0.5">Capacitaciones</p>
          </div>
          <span className="ml-auto text-xs font-semibold text-blue-600 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />{stats.certifiedParticipants ?? 0}
          </span>
        </div>
      </div>
    ),
  };

  /* ── Drag handlers ── */
  const handleDragStart = (_e: DragStartEvent) => setDragging(true);
  const handleDragEnd   = (e: DragEndEvent) => {
    setDragging(false);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setWidgetOrder(prev => {
      const next = arrayMove(prev, prev.indexOf(active.id as WidgetId), prev.indexOf(over.id as WidgetId));
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
      return next;
    });
  };

  /* ── Render ── */
  return (
    <div
      className="space-y-6"
      style={dragging ? { filter: 'url(#chroma-aberration)', willChange: 'filter' } : undefined}
    >
      <ChromaFilter />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Resumen general del sistema GRD ·{' '}
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {canCreateIncident && !editMode && (
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/incidents/new')} size="sm">
              Registrar Incidente
            </Button>
          )}
          {canManageBrigadistas && !editMode && (
            <Button variant="outline" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => navigate('/brigadistas')} size="sm">
              Brigadistas
            </Button>
          )}

          {/* Edit / Done toggle */}
          <button
            onClick={() => {
              if (!editMode) {
                setEditMode(true);
                setEntering(true);
                setTimeout(() => setEntering(false), 600);
              } else {
                setEditMode(false);
              }
            }}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              editMode
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ].join(' ')}
          >
            {editMode
              ? <><Check className="h-4 w-4" /> Listo</>
              : <><Pencil className="h-3.5 w-3.5" /> Editar</>
            }
          </button>
        </div>
      </div>

      {/* Edit mode hint */}
      {editMode && (
        <p className="text-xs text-violet-500 font-medium animate-pulse text-center -mt-2">
          Arrastra los bloques para reorganizar el dashboard
        </p>
      )}

      {/* Sortable widgets */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {widgetOrder.map(id => (
              <SortableWidget key={id} id={id} editMode={editMode} entering={entering} dragging={dragging}>
                {widgets[id]}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
