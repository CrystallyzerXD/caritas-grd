import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Eye, Edit, Trash2, RefreshCw, Leaf, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { environmentalService } from '../../services/environmentalService';
import type { Environmental } from '../../types';
import { EnvironmentalStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageSpinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { usePermissions } from '../../hooks/usePermissions';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PLANNED', label: 'Planificado' },
  { value: 'IN_PROGRESS', label: 'En Ejecucion' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'REFORESTACION', label: 'Reforestación' },
  { value: 'LIMPIEZA', label: 'Limpieza ambiental' },
  { value: 'EDUCACION', label: 'Educación ambiental' },
  { value: 'MONITOREO', label: 'Monitoreo' },
  { value: 'RECICLAJE', label: 'Reciclaje' },
  { value: 'OTRO', label: 'Otro' },
];

const CATEGORY_COLORS: Record<string, string> = {
  REFORESTACION: 'bg-green-100 text-green-700',
  LIMPIEZA:      'bg-blue-100 text-blue-700',
  EDUCACION:     'bg-purple-100 text-purple-700',
  MONITOREO:     'bg-amber-100 text-amber-700',
  RECICLAJE:     'bg-teal-100 text-teal-700',
  OTRO:          'bg-gray-100 text-gray-600',
};

const CATEGORY_LABELS: Record<string, string> = {
  REFORESTACION: 'Reforestación',
  LIMPIEZA:      'Limpieza',
  EDUCACION:     'Educación',
  MONITOREO:     'Monitoreo',
  RECICLAJE:     'Reciclaje',
  OTRO:          'Otro',
};

interface EnvStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export function EnvironmentalList() {
  const navigate = useNavigate();
  const { canManageEnvironmental } = usePermissions();

  const [initiatives, setInitiatives] = useState<Environmental[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stats, setStats] = useState<EnvStats | null>(null);

  useEffect(() => {
    environmentalService.getStatistics()
      .then((data) => setStats(data as unknown as EnvStats))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const data = await environmentalService.getAll(params);
      setInitiatives(data.content);
    } catch {
      toast.error('Error al cargar las iniciativas ambientales');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Está seguro de eliminar esta iniciativa?')) return;
    try {
      await environmentalService.delete(id);
      toast.success('Iniciativa eliminada');
      load();
    } catch {
      toast.error('Error al eliminar la iniciativa');
    }
  };

  const toggleStatus = (value: string) =>
    setStatusFilter((prev) => (prev === value ? '' : value));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Iniciativas Ambientales</h1>
          <p className="text-sm text-gray-500">Gestión de proyectos e iniciativas ambientales</p>
        </div>
        {canManageEnvironmental && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/environmental/new')}>
            Nueva Iniciativa
          </Button>
        )}
      </div>

      {/* Stats — clickeables como filtro */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total — no filtra */}
          <div className="bg-[#f0faf0] rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-[#009850]">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total iniciativas</p>
          </div>

          {/* Planificadas */}
          <button
            onClick={() => toggleStatus('PLANNED')}
            className={`rounded-xl p-4 shadow-sm border-2 flex items-center gap-3 transition-all text-left
              ${statusFilter === 'PLANNED'
                ? 'bg-blue-100 border-blue-400'
                : 'bg-blue-50 border-transparent hover:border-blue-300'}`}
          >
            <div className="bg-blue-100 rounded-lg p-1.5 flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.planned}</p>
              <p className="text-xs text-blue-600 font-medium">Planificadas</p>
            </div>
          </button>

          {/* En ejecución */}
          <button
            onClick={() => toggleStatus('IN_PROGRESS')}
            className={`rounded-xl p-4 shadow-sm border-2 flex items-center gap-3 transition-all text-left
              ${statusFilter === 'IN_PROGRESS'
                ? 'bg-amber-100 border-amber-400'
                : 'bg-amber-50 border-transparent hover:border-amber-300'}`}
          >
            <div className="bg-amber-100 rounded-lg p-1.5 flex-shrink-0">
              <Leaf className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-xs text-amber-600 font-medium">En ejecución</p>
            </div>
          </button>

          {/* Completadas */}
          <button
            onClick={() => toggleStatus('COMPLETED')}
            className={`rounded-xl p-4 shadow-sm border-2 flex items-center gap-3 transition-all text-left
              ${statusFilter === 'COMPLETED'
                ? 'bg-green-100 border-green-400'
                : 'bg-green-50 border-transparent hover:border-green-300'}`}
          >
            <div className="bg-green-100 rounded-lg p-1.5 flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-green-600 font-medium">Completadas</p>
            </div>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          <button
            onClick={() => { setStatusFilter(''); setCategoryFilter(''); }}
            className="ml-auto text-xs text-[#009850] hover:underline flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Limpiar
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <PageSpinner />
        ) : initiatives.length === 0 ? (
          <EmptyState
            title="No hay iniciativas"
            description="No se encontraron iniciativas ambientales con los filtros seleccionados."
            icon={<Leaf className="h-16 w-16" />}
            action={
              canManageEnvironmental ? (
                <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/environmental/new')}>
                  Nueva Iniciativa
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Título', 'Categoría', 'Responsable', 'Distrito', 'Inicio', 'Fin', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {initiatives.map((ini) => (
                  <tr
                    key={ini.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/environmental/${ini.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 max-w-xs truncate">
                      {ini.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {ini.category ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${CATEGORY_COLORS[ini.category] ?? 'bg-gray-100 text-gray-600'}`}>
                          {CATEGORY_LABELS[ini.category] ?? ini.category}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {ini.responsible ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {ini.district}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {ini.startDate ? format(new Date(ini.startDate), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {ini.endDate ? format(new Date(ini.endDate), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <EnvironmentalStatusBadge status={ini.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/environmental/${ini.id}`)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canManageEnvironmental && (
                          <>
                            <button
                              onClick={() => navigate(`/environmental/${ini.id}/edit`)}
                              className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(ini.id, e)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
