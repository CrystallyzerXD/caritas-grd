import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { trainingService } from '../../services/trainingService';
import { catalogService } from '../../services/catalogService';
import { userService } from '../../services/userService';
import type { TrainingFormData, Parish, User } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PageSpinner } from '../../components/common/Spinner';
import { VoiceTextarea } from '../../components/common/VoiceTextarea';

const MODALITY_OPTIONS = [
  { value: 'SINCRONICA', label: 'Sincrónica' },
  { value: 'ASINCRONICA', label: 'Asincrónica' },
  { value: 'MIXTA', label: 'Mixta' },
];

const STATUS_OPTIONS = [
  { value: 'PROGRAMADO', label: 'Programado' },
  { value: 'EN_CURSO', label: 'En Curso' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export function TrainingForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const [parishes, setParishes] = useState<Parish[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TrainingFormData>({
    defaultValues: {
      status: 'PROGRAMADO',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    Promise.all([
      catalogService.getParishes(),
      userService.getAll(),
    ]).then(([p, u]) => {
      setParishes(p);
      setUsers(u.filter((user) => ['ADMIN', 'GRD_SPECIALIST', 'JEFA_OGP'].includes(user.role)));
    }).catch(() => toast.error('Error al cargar datos'));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const t = await trainingService.getById(Number(id));
        reset({
          name: t.name,
          modality: t.modality,
          startDate: t.startDate?.split('T')[0] ?? '',
          endDate: t.endDate?.split('T')[0] ?? '',
          parishId: t.parishId,
          responsibleId: t.responsibleId,
          status: t.status,
          description: t.description,
        });
      } catch {
        toast.error('Error al cargar la capacitación');
        navigate('/training');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data: TrainingFormData) => {
    const payload = {
      ...data,
      parishId: data.parishId ? Number(data.parishId) : undefined,
      responsibleId: data.responsibleId ? Number(data.responsibleId) : undefined,
    };
    try {
      if (isEdit) {
        await trainingService.update(Number(id), payload);
        toast.success('Capacitación actualizada correctamente');
        navigate(`/training/${id}`);
      } else {
        const created = await trainingService.create(payload);
        toast.success('Capacitación registrada correctamente');
        navigate(`/training/${created.id}`);
      }
    } catch {
      toast.error(isEdit ? 'Error al actualizar' : 'Error al crear la capacitación');
    }
  };

  if (loading) return <PageSpinner />;

  const parishOptions = parishes.map((p) => ({ value: p.id, label: p.name }));
  const userOptions = users.map((u) => ({ value: u.id, label: u.fullName }));

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isEdit ? `/training/${id}` : '/training')}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Capacitación' : 'Nueva Capacitación'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit ? 'Modifique los datos de la capacitación' : 'Complete el formulario para registrar'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Información principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Información de la Capacitación
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nombre del Curso"
                required
                placeholder="Ej: Primeros Auxilios para Brigadistas..."
                error={errors.name?.message}
                {...register('name', { required: 'El nombre es obligatorio' })}
              />
            </div>
            <Select
              label="Modalidad"
              required
              options={MODALITY_OPTIONS}
              placeholder="Seleccionar modalidad..."
              error={errors.modality?.message}
              {...register('modality', { required: 'Seleccione la modalidad' })}
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
            <Select
              label="Parroquia"
              options={parishOptions}
              placeholder="Seleccionar parroquia..."
              {...register('parishId')}
            />
            <Select
              label="Responsable OGP"
              options={userOptions}
              placeholder="Seleccionar responsable..."
              {...register('responsibleId')}
            />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <VoiceTextarea
                    {...field}
                    rows={3}
                    placeholder="Descripción de la capacitación, objetivos, contenidos..."
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting} icon={<Save className="h-4 w-4" />}>
            {isEdit ? 'Guardar cambios' : 'Registrar capacitación'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(isEdit ? `/training/${id}` : '/training')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
