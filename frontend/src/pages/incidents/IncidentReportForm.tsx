import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { incidentReportService } from '../../services/incidentReportService';
import type { IncidentReportFormData, ReportType } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { VoiceTextarea } from '../../components/common/VoiceTextarea';

const REPORT_TYPE_OPTIONS = [
  { value: 'PRIMERA_VISITA', label: 'Primera Visita' },
  { value: 'ENTREGA_DONACION', label: 'Entrega de Donación' },
  { value: 'SEGUIMIENTO', label: 'Seguimiento' },
];

const VULNERABILITY_OPTIONS = [
  { value: 'BAJO', label: 'Bajo' },
  { value: 'MEDIO', label: 'Medio' },
  { value: 'ALTO', label: 'Alto' },
  { value: 'CRITICO', label: 'Crítico' },
];

const FOLLOW_UP_MEDIUM_OPTIONS = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'TELEFONICO', label: 'Telefónico' },
  { value: 'PARROQUIAL', label: 'Parroquial' },
  { value: 'MUNICIPAL', label: 'Municipal' },
];

const CURRENT_SITUATION_OPTIONS = [
  { value: 'MEJORO', label: 'Mejoró' },
  { value: 'IGUAL', label: 'Igual' },
  { value: 'EMPEORO', label: 'Empeoró' },
];

const FINAL_STATUS_OPTIONS = [
  { value: 'ABIERTO', label: 'Abierto' },
  { value: 'EN_SEGUIMIENTO', label: 'En Seguimiento' },
  { value: 'CERRADO', label: 'Cerrado' },
];

export function IncidentReportForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<ReportType | ''>('');

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<IncidentReportFormData>({
    defaultValues: { reportType: undefined },
  });

  const onSubmit = async (data: IncidentReportFormData) => {
    try {
      await incidentReportService.create(Number(id), data);
      toast.success('Informe creado correctamente');
      navigate(`/incidents/${id}`);
    } catch {
      toast.error('Error al crear el informe');
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/incidents/${id}`)}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Informe</h1>
          <p className="text-sm text-gray-500">Incidente #{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Tipo de informe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Tipo de Informe</h2>
          <Select
            label="Tipo de Informe"
            required
            options={REPORT_TYPE_OPTIONS}
            placeholder="Seleccionar tipo..."
            {...register('reportType', {
              required: 'Seleccione el tipo de informe',
              onChange: (e) => setReportType(e.target.value as ReportType),
            })}
          />
        </div>

        {/* PRIMERA_VISITA */}
        {reportType === 'PRIMERA_VISITA' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Primera Visita</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la Visita</label>
                <Controller name="visitMotivo" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Motivo por el cual se realizó la visita..." />
                )} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos</label>
                <Controller name="visitObjectives" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Objetivos de la visita..." />
                )} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Evento</label>
                <Controller name="eventDescription" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={3} placeholder="Descripción detallada del evento..." />
                )} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones de Habitabilidad</label>
                <Controller name="habitabilityConditions" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Estado de la vivienda y condiciones..." />
                )} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Composición Familiar</label>
                <Controller name="familyComposition" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Ej: Padre (45), Madre (40), 2 hijos menores..." />
                )} />
              </div>
              <Select
                label="Nivel de Vulnerabilidad"
                options={VULNERABILITY_OPTIONS}
                placeholder="Seleccionar nivel..."
                {...register('vulnerabilityLevel')}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Necesidades Prioritarias</label>
                <Controller name="priorityNeeds" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Alimentación, abrigo, salud..." />
                )} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recomendación Inicial</label>
                <Controller name="initialRecommendation" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Recomendaciones iniciales del equipo..." />
                )} />
              </div>
            </div>
          </div>
        )}

        {/* ENTREGA_DONACION */}
        {reportType === 'ENTREGA_DONACION' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Entrega de Donación</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Fecha de Entrega" type="date" {...register('deliveryDate')} />
              <Input label="Lugar de Entrega" placeholder="Dirección donde se entregó..." {...register('deliveryPlace')} />
              <Input label="Nombre del Beneficiario" placeholder="Nombre completo" {...register('beneficiaryName')} />
              <Input label="DNI del Beneficiario" placeholder="12345678" maxLength={8} {...register('beneficiaryDni')} />
              <Input label="Responsable de Entrega" placeholder="Nombre del responsable" {...register('deliveryResponsible')} />
              <Input label="Actor Parroquial" placeholder="Nombre o rol del actor parroquial" {...register('parroquialActor')} />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ayuda</label>
                <Controller name="aidType" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Ej: Kit de alimentos, Kit de higiene..." />
                )} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Composición del Kit</label>
                <Controller name="kitComposition" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={3} placeholder="Detalle de items incluidos en el kit..." />
                )} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidencia de Entrega</label>
                <Controller name="deliveryEvidence" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Descripción de evidencias (fotos, firmas, etc.)..." />
                )} />
              </div>
            </div>
          </div>
        )}

        {/* SEGUIMIENTO */}
        {reportType === 'SEGUIMIENTO' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Seguimiento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Fecha de Seguimiento" type="date" {...register('followUpDate')} />
              <Select
                label="Medio de Seguimiento"
                options={FOLLOW_UP_MEDIUM_OPTIONS}
                placeholder="Seleccionar..."
                {...register('followUpMedium')}
              />
              <Select
                label="Situación Actual"
                options={CURRENT_SITUATION_OPTIONS}
                placeholder="Seleccionar..."
                {...register('currentSituation')}
              />
              <Select
                label="Estado Final"
                options={FINAL_STATUS_OPTIONS}
                placeholder="Seleccionar..."
                {...register('finalStatus')}
              />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Uso de la Ayuda Brindada</label>
                <Controller name="aidUsage" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Cómo fue utilizada la ayuda previamente entregada..." />
                )} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Necesidades Persistentes</label>
                <Controller name="persistentNeeds" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Necesidades que aún persisten..." />
                )} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Derivaciones Realizadas</label>
                <Controller name="referralsMade" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Instituciones a las que fue derivado..." />
                )} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recomendación Técnica</label>
                <Controller name="technicalRecommendation" control={control} render={({ field }) => (
                  <VoiceTextarea {...field} rows={2} placeholder="Recomendaciones técnicas del equipo..." />
                )} />
              </div>
            </div>
          </div>
        )}

        {/* Observaciones generales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Observaciones Generales</h2>
          <Controller name="observations" control={control} render={({ field }) => (
            <VoiceTextarea {...field} rows={3} placeholder="Observaciones adicionales sobre el informe..." />
          )} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting} icon={<Save className="h-4 w-4" />}>
            Guardar informe
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(`/incidents/${id}`)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
