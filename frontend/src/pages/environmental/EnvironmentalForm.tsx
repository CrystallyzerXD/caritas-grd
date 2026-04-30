import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { environmentalService } from '../../services/environmentalService';
import { catalogService } from '../../services/catalogService';
import type { EnvironmentalFormData, District } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PageSpinner } from '../../components/common/Spinner';

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planificado' },
  { value: 'IN_PROGRESS', label: 'En Ejecucion' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const CATEGORY_OPTIONS = [
  { value: 'REFORESTACION', label: 'Reforestación' },
  { value: 'LIMPIEZA', label: 'Limpieza ambiental' },
  { value: 'EDUCACION', label: 'Educación ambiental' },
  { value: 'MONITOREO', label: 'Monitoreo' },
  { value: 'OTRO', label: 'Otro' },
];

export function EnvironmentalForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnvironmentalFormData>({
    defaultValues: {
      status: 'PLANNED',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    catalogService.getDistricts()
      .then(setDistricts)
      .catch(() => toast.error('Error al cargar distritos'));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const ini = await environmentalService.getById(Number(id));
        reset({
          title: ini.title,
          description: ini.description,
          responsible: ini.responsible,
          location: ini.location,
          districtId: ini.districtId,
          startDate: ini.startDate?.split('T')[0] ?? '',
          endDate: ini.endDate?.split('T')[0] ?? '',
          status: ini.status,
          category: ini.category,
        });
      } catch {
        toast.error('Error al cargar la iniciativa');
        navigate('/environmental');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data: EnvironmentalFormData) => {
    const payload = { ...data, districtId: Number(data.districtId) };
    try {
      if (isEdit) {
        await environmentalService.update(Number(id), payload);
        toast.success('Iniciativa actualizada correctamente');
        navigate(`/environmental/${id}`);
      } else {
        const created = await environmentalService.create(payload);
        toast.success('Iniciativa registrada correctamente');
        navigate(`/environmental/${created.id}`);
      }
    } catch {
      toast.error(isEdit ? 'Error al actualizar la iniciativa' : 'Error al crear la iniciativa');
    }
  };

  if (loading) return <PageSpinner />;

  const districtOptions = districts.map((d) => ({ value: d.id, label: d.name }));

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isEdit ? `/environmental/${id}` : '/environmental')}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Iniciativa' : 'Nueva Iniciativa Ambiental'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit ? 'Modifique los datos de la iniciativa' : 'Complete el formulario'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Main info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Información de la Iniciativa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Título"
                required
                placeholder="Nombre de la iniciativa..."
                error={errors.title?.message}
                {...register('title', { required: 'El título es obligatorio' })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                rows={3}
                placeholder="Descripción detallada de la iniciativa..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850] resize-none"
                {...register('description')}
              />
            </div>
            <Input
              label="Responsable"
              placeholder="Nombre del responsable"
              {...register('responsible')}
            />
            <Select
              label="Categoría"
              options={CATEGORY_OPTIONS}
              placeholder="Seleccionar categoría..."
              {...register('category')}
            />
            <Select
              label="Estado"
              required
              options={STATUS_OPTIONS}
              error={errors.status?.message}
              {...register('status', { required: 'Seleccione el estado' })}
            />
            <Input
              label="Fecha de Inicio"
              type="date"
              required
              error={errors.startDate?.message}
              {...register('startDate', { required: 'La fecha de inicio es obligatoria' })}
            />
            <Input
              label="Fecha de Fin"
              type="date"
              {...register('endDate')}
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Ubicación
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Distrito"
              required
              options={districtOptions}
              placeholder="Seleccionar distrito..."
              error={errors.districtId?.message}
              {...register('districtId', { required: 'Seleccione el distrito' })}
            />
            <Input
              label="Ubicación específica"
              placeholder="Parque, comunidad, zona..."
              {...register('location')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            loading={isSubmitting}
            icon={<Save className="h-4 w-4" />}
          >
            {isEdit ? 'Guardar cambios' : 'Registrar iniciativa'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(isEdit ? `/environmental/${id}` : '/environmental')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
