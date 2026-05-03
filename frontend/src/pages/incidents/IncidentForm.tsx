import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { incidentService } from '../../services/incidentService';
import { catalogService } from '../../services/catalogService';
import type { IncidentFormData, EventType, District } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Combobox } from '../../components/common/Combobox';
import { PageSpinner } from '../../components/common/Spinner';
import { VoiceTextarea } from '../../components/common/VoiceTextarea';
import { MapPicker } from '../../components/common/MapPicker';

// Status options — duplicates (CERRADO / EN_SEGUIMIENTO) removed per refinement notes.
// Status is only shown when editing; on create it defaults to OPEN automatically.
const STATUS_OPTIONS = [
  { value: 'OPEN',          label: 'Abierto'       },
  { value: 'IN_PROGRESS',   label: 'En Proceso'    },
  { value: 'EN_EVALUACION', label: 'En Evaluación' },
  { value: 'APROBADO',      label: 'Aprobado'      },
  { value: 'ATENDIDO',      label: 'Atendido'      },
  { value: 'FOLLOW_UP',     label: 'En Seguimiento'},
  { value: 'CLOSED',        label: 'Cerrado'       },
];

const AFFECTATION_OPTIONS = [
  { value: 'LEVE',     label: 'Leve'     },
  { value: 'MODERADO', label: 'Moderado' },
  { value: 'SEVERO',   label: 'Severo'   },
];

const SOCIAL_RISK_OPTIONS = [
  { value: 'BAJO',    label: 'Bajo'    },
  { value: 'MEDIO',   label: 'Medio'   },
  { value: 'ALTO',    label: 'Alto'    },
  { value: 'CRITICO', label: 'Crítico' },
];

const today = new Date().toISOString().split('T')[0];

export function IncidentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [districts,  setDistricts]  = useState<District[]>([]);
  const [loading,    setLoading]    = useState(isEdit);
  const [showMap,    setShowMap]    = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IncidentFormData>({
    defaultValues: {
      status:       'OPEN',
      incidentDate: today,
      // reportDate auto-filled with today on create; brigadista fills details later
      reportDate:   today,
    },
  });

  // Load catalogs
  useEffect(() => {
    (async () => {
      try {
        const [et, dist] = await Promise.all([
          catalogService.getEventTypes(),
          catalogService.getDistricts(),
        ]);
        setEventTypes(et);
        setDistricts(dist);
      } catch {
        toast.error('Error al cargar los catálogos');
      }
    })();
  }, []);

  // Load existing incident when editing
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const inc = await incidentService.getById(Number(id));
        reset({
          eventTypeId:           inc.eventTypeId,
          description:           inc.description,
          cause:                 inc.cause,
          losses:                inc.losses,
          status:                inc.status,
          incidentDate:          inc.incidentDate?.split('T')[0] ?? '',
          latitude:              inc.latitude,
          longitude:             inc.longitude,
          address:               inc.address,
          districtId:            inc.districtId,
          reportDate:            inc.reportDate?.split('T')[0] ?? '',
          alertSource:           inc.alertSource,
          affectationLevel:      inc.affectationLevel,
          affectedFamilies:      inc.affectedFamilies,
          urgentNeeds:           inc.urgentNeeds,
          socialRiskAssessment:  inc.socialRiskAssessment,
        });
      } catch {
        toast.error('Error al cargar la incidencia');
        navigate('/incidents');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data: IncidentFormData) => {
    const payload: IncidentFormData = {
      ...data,
      eventTypeId: Number(data.eventTypeId),
      districtId:  Number(data.districtId),
      latitude:    data.latitude  ? Number(data.latitude)  : undefined,
      longitude:   data.longitude ? Number(data.longitude) : undefined,
      // On create, status is always OPEN regardless of form value
      status:      isEdit ? data.status : 'OPEN',
    };

    try {
      if (isEdit) {
        await incidentService.update(Number(id), payload);
        toast.success('Incidencia actualizada correctamente');
        navigate(`/incidents/${id}`);
      } else {
        const created = await incidentService.create(payload);
        toast.success('Incidencia registrada correctamente');
        navigate(`/incidents/${created.id}`);
      }
    } catch {
      toast.error(isEdit ? 'Error al actualizar la incidencia' : 'Error al crear la incidencia');
    }
  };

  if (loading) return <PageSpinner />;

  const eventTypeOptions = eventTypes.map((et) => ({ value: et.id, label: et.name }));
  const districtOptions  = districts.map((d)  => ({ value: d.id,  label: d.name  }));

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isEdit ? `/incidents/${id}` : '/incidents')}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Incidencia' : 'Registrar Incidente'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit
              ? 'Modifique los datos de la incidencia'
              : 'Complete los datos iniciales. El brigadista complementará la información en campo.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Información General ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Información General
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Tipo de evento — combobox (autocomplete + dropdown) */}
            <Controller
              name="eventTypeId"
              control={control}
              rules={{ required: 'Seleccione el tipo de evento' }}
              render={({ field }) => (
                <Combobox
                  label="Tipo de Evento"
                  required
                  options={eventTypeOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  placeholder="Buscar tipo de evento..."
                  error={errors.eventTypeId?.message}
                />
              )}
            />

            {/* Fecha del evento — no future dates */}
            <Input
              label="Fecha del Evento"
              type="date"
              required
              max={today}
              error={errors.incidentDate?.message}
              {...register('incidentDate', { required: 'La fecha es obligatoria' })}
            />

            {/* Status — only shown when editing */}
            {isEdit && (
              <Select
                label="Estado"
                required
                options={STATUS_OPTIONS}
                error={errors.status?.message}
                {...register('status', { required: 'Seleccione el estado' })}
              />
            )}

          </div>
        </div>

        {/* ── Descripción y Causa ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Descripción y Causa</h2>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
              </svg>
              Puedes dictar por voz
            </span>
          </div>

          <div className="space-y-4">
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-[#009850]">*</span>
              </label>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'La descripción es obligatoria' }}
                render={({ field }) => (
                  <VoiceTextarea
                    {...field}
                    rows={3}
                    placeholder="Ej: Incendio en vivienda de material noble afectó dos habitaciones…"
                    error={!!errors.description}
                  />
                )}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Causa probable (renombrado) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Causa probable
                <span className="ml-1.5 text-xs font-normal text-gray-400">(opcional)</span>
              </label>
              <Controller
                name="cause"
                control={control}
                render={({ field }) => (
                  <VoiceTextarea
                    {...field}
                    rows={2}
                    placeholder="Ej: Cortocircuito eléctrico en la cocina del segundo piso…"
                  />
                )}
              />
            </div>

            {/* Pérdidas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pérdidas
                <span className="ml-1.5 text-xs font-normal text-gray-400">(opcional)</span>
              </label>
              <Controller
                name="losses"
                control={control}
                render={({ field }) => (
                  <VoiceTextarea
                    {...field}
                    rows={2}
                    placeholder="Ej: Pérdida total de dos colchones, ropa y enseres de cocina…"
                  />
                )}
              />
            </div>

            {/* Acciones tomadas eliminado del formulario de registro.
                Se completan en el informe final tras recibir data del brigadista. */}
          </div>
        </div>

        {/* ── Evaluación del Caso ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Evaluación del Caso
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Fecha en que Cáritas tomó conocimiento — auto-filled, readonly on create */}
            <Input
              label="Fecha en que Cáritas tomó conocimiento"
              type="date"
              readOnly={!isEdit}
              className={!isEdit ? 'bg-gray-50 text-gray-500 cursor-default' : ''}
              {...register('reportDate')}
            />

            <Input
              label="Fuente de alerta"
              placeholder="Ej: Parroquia, INDECI, Municipio..."
              {...register('alertSource')}
            />

            {/* Nivel de afectación → renombrado a "Evaluación del caso preliminar" */}
            <Select
              label="Evaluación del caso preliminar"
              options={AFFECTATION_OPTIONS}
              placeholder="Seleccionar nivel..."
              {...register('affectationLevel')}
            />

            <Input
              label="N° familias afectadas"
              type="number"
              placeholder="0"
              min={0}
              {...register('affectedFamilies', { valueAsNumber: true, min: { value: 0, message: 'No se permiten valores negativos' } })}
              error={errors.affectedFamilies?.message}
            />

            {/* Evaluación de riesgo social — con ayuda contextual */}
            <Select
              label="Evaluación de riesgo social"
              options={SOCIAL_RISK_OPTIONS}
              placeholder="Seleccionar..."
              hint="Clasifica el nivel de vulnerabilidad y riesgo de la familia afectada según condiciones socioeconómicas, entorno y capacidad de respuesta."
              {...register('socialRiskAssessment')}
            />

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Necesidades urgentes
              </label>
              <Controller
                name="urgentNeeds"
                control={control}
                render={({ field }) => (
                  <VoiceTextarea
                    {...field}
                    rows={2}
                    placeholder="Ej: Alimentación, Abrigo, Salud..."
                  />
                )}
              />
            </div>

            {/* "Grupos vulnerables" e "Instituciones articuladas" eliminados.
                Grupos vulnerables es variable de catálogo del sistema.
                Instituciones articuladas eliminada per notas de refinamiento. */}

          </div>
        </div>

        {/* ── Ubicación ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Ubicación</h2>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#009850] hover:text-[#007a40] bg-[#009850]/10 hover:bg-[#009850]/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              Seleccionar en mapa
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Distrito — combobox (autocomplete + dropdown) */}
            <Controller
              name="districtId"
              control={control}
              rules={{ required: 'Seleccione el distrito' }}
              render={({ field }) => (
                <Combobox
                  label="Distrito"
                  required
                  options={districtOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  placeholder="Buscar distrito..."
                  error={errors.districtId?.message}
                />
              )}
            />
            <Input
              label="Dirección"
              placeholder="Ej: Av. Principal 123"
              {...register('address')}
            />
            <Input
              label="Latitud"
              type="number"
              step="any"
              placeholder="-12.046374"
              {...register('latitude')}
            />
            <Input
              label="Longitud"
              type="number"
              step="any"
              placeholder="-77.042793"
              {...register('longitude')}
            />
          </div>

          {/* Mini preview when coordinates are set */}
          {watch('latitude') && watch('longitude') && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <MapPin className="h-3.5 w-3.5 text-[#009850] flex-shrink-0" />
              <span>
                Coordenadas:{' '}
                <strong className="text-gray-700">{Number(watch('latitude')).toFixed(6)}</strong>,{' '}
                <strong className="text-gray-700">{Number(watch('longitude')).toFixed(6)}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="ml-auto text-[#009850] hover:underline"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>

        {/* ── Map picker modal ── */}
        {showMap && (
          <MapPicker
            initialLat={watch('latitude') ? Number(watch('latitude')) : undefined}
            initialLng={watch('longitude') ? Number(watch('longitude')) : undefined}
            onClose={() => setShowMap(false)}
            onConfirm={(loc) => {
              setValue('latitude',  loc.lat as unknown as number, { shouldValidate: true });
              setValue('longitude', loc.lng as unknown as number, { shouldValidate: true });
              if (loc.address) setValue('address', loc.address);

              // Auto-select district: fuzzy match Nominatim name vs catalog
              if (loc.districtName && districts.length > 0) {
                const normalize = (s: string) =>
                  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
                const needle = normalize(loc.districtName);
                const match = districts.find((d) => {
                  const hay = normalize(d.name);
                  return hay === needle || hay.includes(needle) || needle.includes(hay);
                });
                if (match) setValue('districtId', match.id, { shouldValidate: true });
              }

              setShowMap(false);
            }}
          />
        )}

        {/* ── Acciones ── */}
        <div className="flex gap-3">
          <Button
            type="submit"
            loading={isSubmitting}
            icon={<Save className="h-4 w-4" />}
          >
            {isEdit ? 'Guardar cambios' : 'Registrar incidencia'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(isEdit ? `/incidents/${id}` : '/incidents')}
          >
            Cancelar
          </Button>
        </div>

      </form>
    </div>
  );
}
