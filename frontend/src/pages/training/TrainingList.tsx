import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GraduationCap, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { trainingService } from '../../services/trainingService';
import { catalogService } from '../../services/catalogService';
import type { Training, TrainingStatus, Parish } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Table';
import { PageSpinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { usePermissions } from '../../hooks/usePermissions';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PROGRAMADO', label: 'Programado' },
  { value: 'EN_CURSO', label: 'En Curso' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

function TrainingStatusBadge({ status }: { status: TrainingStatus }) {
  const map: Record<TrainingStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'danger' }> = {
    PROGRAMADO: { label: 'Programado', variant: 'info' },
    EN_CURSO: { label: 'En Curso', variant: 'warning' },
    FINALIZADO: { label: 'Finalizado', variant: 'success' },
    CANCELADO: { label: 'Cancelado', variant: 'danger' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'info' };
  return <Badge variant={variant}>{label}</Badge>;
}

function ModalityBadge({ modality }: { modality: string }) {
  const map: Record<string, { label: string; variant: 'purple' | 'warning' | 'cian' }> = {
    SINCRONICA: { label: 'Sincrónica', variant: 'purple' },
    ASINCRONICA: { label: 'Asincrónica', variant: 'warning' },
    MIXTA: { label: 'Mixta', variant: 'cian' },
  };
  const { label, variant } = map[modality] ?? { label: modality, variant: 'cian' };
  return <Badge variant={variant}>{label}</Badge>;
}

export function TrainingList() {
  const navigate = useNavigate();
  const { isAdmin, isSpecialist } = usePermissions();
  const canCreate = isAdmin || isSpecialist;

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [parishFilter, setParishFilter] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const size = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainingService.getAll({
        status: statusFilter || undefined,
        parishId: parishFilter,
        page,
        size,
      });
      setTrainings(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Error al cargar las capacitaciones');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, parishFilter, page, size]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    catalogService.getParishes().then(setParishes).catch(() => {});
  }, []);

  const clearFilters = () => {
    setStatusFilter('');
    setParishFilter(undefined);
    setPage(0);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacitación de Brigadistas</h1>
          <p className="text-sm text-gray-500">Gestión de capacitaciones y formación pastoral</p>
        </div>
        {canCreate && (
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/training/new')}
          >
            Nueva Capacitación
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          <button
            onClick={clearFilters}
            className="ml-auto text-xs text-[#009850] hover:underline flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Limpiar
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={parishFilter ?? ''}
            onChange={(e) => { setParishFilter(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
          >
            <option value="">Todas las parroquias</option>
            {parishes.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button variant="outline" onClick={load} fullWidth>
            Buscar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <PageSpinner />
        ) : trainings.length === 0 ? (
          <EmptyState
            title="No hay capacitaciones"
            description="No se encontraron capacitaciones con los filtros seleccionados."
            action={
              canCreate ? (
                <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/training/new')}>
                  Nueva Capacitación
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
                    {['Código', 'Nombre', 'Modalidad', 'Fecha Inicio', 'Parroquia', 'Estado', 'Participantes', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {trainings.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/training/${t.id}`)}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-[#009850] font-semibold whitespace-nowrap">
                        {t.trainingCode}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 max-w-xs truncate">
                        {t.name}
                      </td>
                      <td className="px-4 py-3">
                        <ModalityBadge modality={t.modality} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {t.startDate ? format(new Date(t.startDate), 'dd/MM/yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.parish ?? '-'}</td>
                      <td className="px-4 py-3">
                        <TrainingStatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="h-4 w-4 text-[#009850]" />
                          {t.participantCount}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/training/${t.id}`)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 border-t border-gray-100">
              <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                size={size}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
