import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, RefreshCw, AlertTriangle, Clock, CheckCircle, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { incidentService } from '../../services/incidentService';
import { catalogService } from '../../services/catalogService';
import { reportService } from '../../services/reportService';
import type { Incident, IncidentFilters, EventType, District } from '../../types';
import { IncidentStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Table';
import { PageSpinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { usePermissions } from '../../hooks/usePermissions';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'OPEN', label: 'Abierto' },
  { value: 'IN_PROGRESS', label: 'En Proceso' },
  { value: 'CLOSED', label: 'Cerrado' },
  { value: 'FOLLOW_UP', label: 'Seguimiento' },
];

const MIN_FILTER_DATE = '1900-01-01';

function isValidFilterDate(value?: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (value < MIN_FILTER_DATE) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
}

export function IncidentList() {
  const navigate = useNavigate();
  const { canCreateIncident, canEditIncident, canDeleteIncident } = usePermissions();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [statusCounts, setStatusCounts] = useState({ open: 0, inProgress: 0, closed: 0, followUp: 0 });

  useEffect(() => {
    reportService.getDashboard()
      .then((d) => setStatusCounts({
        open:       d.openIncidents       ?? 0,
        inProgress: d.inProgressIncidents ?? 0,
        closed:     d.closedIncidents     ?? 0,
        followUp:   d.followUpIncidents   ?? 0,
      }))
      .catch(() => {});
  }, []);

  const [filters, setFilters] = useState<IncidentFilters>({
    page: 0,
    size: 10,
    status: '',
    eventTypeId: undefined,
    districtId: undefined,
    dateFrom: '',
    dateTo: '',
  });

  const load = useCallback(async () => {
    if (!isValidFilterDate(filters.dateFrom) || !isValidFilterDate(filters.dateTo)) {
      toast.error('Rango de fecha inválido. Usa fechas desde 1900-01-01.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await incidentService.getAll(filters);
      setIncidents(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Error al cargar las incidencias');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [et, dist] = await Promise.all([
          catalogService.getEventTypes(),
          catalogService.getDistricts(),
        ]);
        setEventTypes(et);
        setDistricts(dist);
      } catch {
        // Catalogs not critical
      }
    };
    loadCatalogs();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Está seguro de eliminar esta incidencia?')) return;
    try {
      await incidentService.delete(id);
      toast.success('Incidencia eliminada');
      load();
    } catch {
      toast.error('Error al eliminar la incidencia');
    }
  };

  const updateFilter = (key: keyof IncidentFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  const clearFilters = () => {
    setFilters({ page: 0, size: 10, status: '', eventTypeId: undefined, districtId: undefined, dateFrom: '', dateTo: '' });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Riesgo de Desastres</h1>
          <p className="text-sm text-gray-500">Registro y seguimiento de incidencias y emergencias</p>
        </div>
        {canCreateIncident && (
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/incidents/new')}
          >
            Registrar Incidente
          </Button>
        )}
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Abiertos',    value: statusCounts.open,       icon: <AlertTriangle className="h-5 w-5" />, bg: 'bg-amber-50',  iconBg: 'bg-amber-100',  text: 'text-amber-600',  filter: 'OPEN'        },
          { label: 'En Proceso',  value: statusCounts.inProgress, icon: <Clock         className="h-5 w-5" />, bg: 'bg-blue-50',   iconBg: 'bg-blue-100',   text: 'text-blue-600',   filter: 'IN_PROGRESS' },
          { label: 'Seguimiento', value: statusCounts.followUp,   icon: <BookOpen      className="h-5 w-5" />, bg: 'bg-purple-50', iconBg: 'bg-purple-100', text: 'text-purple-600', filter: 'FOLLOW_UP'   },
          { label: 'Cerrados',    value: statusCounts.closed,     icon: <CheckCircle   className="h-5 w-5" />, bg: 'bg-green-50',  iconBg: 'bg-green-100',  text: 'text-green-600',  filter: 'CLOSED'      },
        ].map((s) => (
          <button
            key={s.filter}
            onClick={() => updateFilter('status', filters.status === s.filter ? '' : s.filter)}
            className={`${s.bg} rounded-xl p-4 flex items-center gap-3 border-2 transition-all text-left ${
              filters.status === s.filter ? 'border-current opacity-100' : 'border-transparent opacity-90 hover:opacity-100'
            } ${s.text}`}
          >
            <div className={`${s.iconBg} ${s.text} rounded-lg p-2 flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          <button
            onClick={clearFilters}
            className="ml-auto text-xs text-[#009850] hover:underline flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Limpiar filtros
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Event type */}
          <select
            value={filters.eventTypeId ?? ''}
            onChange={(e) => updateFilter('eventTypeId', e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
          >
            <option value="">Todos los tipos</option>
            {eventTypes.map((et) => (
              <option key={et.id} value={et.id}>{et.name}</option>
            ))}
          </select>

          {/* District */}
          <select
            value={filters.districtId ?? ''}
            onChange={(e) => updateFilter('districtId', e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
          >
            <option value="">Todos los distritos</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Date from */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            min={MIN_FILTER_DATE}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
            placeholder="Fecha desde"
          />

          {/* Date to */}
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            min={MIN_FILTER_DATE}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
            placeholder="Fecha hasta"
          />

          {/* Search button */}
          <Button
            variant="outline"
            icon={<Search className="h-4 w-4" />}
            onClick={load}
            fullWidth
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <PageSpinner />
        ) : incidents.length === 0 ? (
          <EmptyState
            title="No hay incidencias"
            description="No se encontraron incidencias con los filtros seleccionados."
            action={
              canCreateIncident ? (
                <Button
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => navigate('/incidents/new')}
                >
                  Registrar Incidente
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Tipo', 'Descripción', 'Distrito', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {incidents.map((inc) => (
                    <tr
                      key={inc.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-[#009850] font-semibold whitespace-nowrap">
                        GRD-{String(inc.id).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                          {inc.eventType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {inc.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {inc.district}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {inc.incidentDate
                          ? format(new Date(inc.incidentDate), 'dd/MM/yyyy')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <IncidentStatusBadge status={inc.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => navigate(`/incidents/${inc.id}`)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {canEditIncident && (
                            <button
                              onClick={() => navigate(`/incidents/${inc.id}/edit`)}
                              className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {canDeleteIncident && (
                            <button
                              onClick={(e) => handleDelete(inc.id, e)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 border-t border-gray-100">
              <Pagination
                page={filters.page}
                totalPages={totalPages}
                totalElements={totalElements}
                size={filters.size}
                onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
