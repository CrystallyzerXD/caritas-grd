import { useEffect, useState } from 'react';
import { Plus, Edit, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { catalogService } from '../../services/catalogService';
import type { EventType, District, Parish } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { PageSpinner } from '../../components/common/Spinner';

type Tab = 'eventTypes' | 'districts' | 'parishes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'eventTypes', label: 'Tipos de Evento' },
  { key: 'districts', label: 'Distritos' },
  { key: 'parishes', label: 'Parroquias' },
];

// Generic catalog item form
interface CatalogFormData {
  name: string;
  description?: string;
  province?: string;
  districtId?: number;
  active: boolean;
}

export function Catalogs() {
  const [activeTab, setActiveTab] = useState<Tab>('eventTypes');
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EventType | District | Parish | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CatalogFormData>({ defaultValues: { active: true } });

  const load = async () => {
    setLoading(true);
    try {
      const [et, dist, par] = await Promise.all([
        catalogService.getEventTypes(),
        catalogService.getDistricts(),
        catalogService.getParishes(),
      ]);
      setEventTypes(et);
      setDistricts(dist);
      setParishes(par);
    } catch {
      toast.error('Error al cargar los catálogos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditItem(null);
    reset({ active: true });
    setModalOpen(true);
  };

  const openEdit = (item: EventType | District | Parish) => {
    setEditItem(item);
    reset({
      name: item.name,
      description: (item as EventType).description,
      province: (item as District).province,
      active: item.active,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: CatalogFormData) => {
    try {
      if (activeTab === 'eventTypes') {
        if (editItem) {
          const u = await catalogService.updateEventType(editItem.id, data);
          setEventTypes((prev) => prev.map((e) => (e.id === u.id ? u : e)));
        } else {
          const c = await catalogService.createEventType(data);
          setEventTypes((prev) => [...prev, c]);
        }
      } else if (activeTab === 'districts') {
        if (editItem) {
          const u = await catalogService.updateDistrict(editItem.id, data);
          setDistricts((prev) => prev.map((d) => (d.id === u.id ? u : d)));
        } else {
          const c = await catalogService.createDistrict(data);
          setDistricts((prev) => [...prev, c]);
        }
      } else {
        if (editItem) {
          const u = await catalogService.updateParish(editItem.id, data);
          setParishes((prev) => prev.map((p) => (p.id === u.id ? u : p)));
        } else {
          const c = await catalogService.createParish(data);
          setParishes((prev) => [...prev, c]);
        }
      }
      toast.success(editItem ? 'Registro actualizado' : 'Registro creado');
      setModalOpen(false);
    } catch {
      toast.error('Error al guardar el registro');
    }
  };

  const getTabLabel = () => {
    if (activeTab === 'eventTypes') return 'Tipo de Evento';
    if (activeTab === 'districts') return 'Distrito';
    return 'Parroquia';
  };

  const renderTable = () => {
    if (loading) return <PageSpinner />;

    const items =
      activeTab === 'eventTypes'
        ? eventTypes
        : activeTab === 'districts'
        ? districts
        : parishes;

    if (items.length === 0) {
      return (
        <div className="py-10 text-center text-sm text-gray-400">
          No hay registros. Agregue el primero.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
              {activeTab === 'eventTypes' && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descripción</th>
              )}
              {activeTab === 'districts' && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Provincia</th>
              )}
              {activeTab === 'parishes' && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Distrito</th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-gray-500">{item.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                {activeTab === 'eventTypes' && (
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {(item as EventType).description ?? '—'}
                  </td>
                )}
                {activeTab === 'districts' && (
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {(item as District).province ?? '—'}
                  </td>
                )}
                {activeTab === 'parishes' && (
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {(item as Parish).district ?? '—'}
                  </td>
                )}
                <td className="px-4 py-3">
                  {item.active ? (
                    <Badge variant="success">
                      <Check className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="gray">
                      <X className="h-3 w-3 mr-1" />
                      Inactivo
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogos</h1>
          <p className="text-sm text-gray-500">Administre los datos maestros del sistema</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Nuevo {getTabLabel()}
        </Button>
      </div>

      {/* Tabs + Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-4 pt-3">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-[#009850] text-[#009850] bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div>{renderTable()}</div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editItem ? 'Editar' : 'Nuevo'} ${getTabLabel()}`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            required
            placeholder="Nombre del registro..."
            error={errors.name?.message}
            {...register('name', { required: 'El nombre es obligatorio' })}
          />

          {activeTab === 'eventTypes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                rows={2}
                placeholder="Descripción opcional..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850] resize-none"
                {...register('description')}
              />
            </div>
          )}

          {activeTab === 'districts' && (
            <Input
              label="Provincia"
              placeholder="Lima, Callao..."
              {...register('province')}
            />
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active-catalog"
              className="h-4 w-4 rounded border-gray-300 text-[#009850] focus:ring-[#009850]"
              {...register('active')}
            />
            <label htmlFor="active-catalog" className="text-sm font-medium text-gray-700">
              Activo
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting} fullWidth>
              {editItem ? 'Guardar cambios' : 'Crear registro'}
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
