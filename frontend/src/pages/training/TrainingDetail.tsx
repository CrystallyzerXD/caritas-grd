import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, GraduationCap, Calendar, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { trainingService } from '../../services/trainingService';
import type { Training, TrainingParticipant, TrainingParticipantFormData } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { PageSpinner } from '../../components/common/Spinner';
import { usePermissions } from '../../hooks/usePermissions';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

const ATTENDANCE_OPTIONS = [
  { value: 'PRESENTE', label: 'Presente' },
  { value: 'AUSENTE', label: 'Ausente' },
  { value: 'TARDANZA', label: 'Tardanza' },
  { value: 'JUSTIFICADO', label: 'Justificado' },
];

const CERT_OPTIONS = [
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'NO_APROBADO', label: 'No Aprobado' },
  { value: 'PENDIENTE', label: 'Pendiente' },
];

function AttendanceBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' }> = {
    PRESENTE: { label: 'Presente', variant: 'success' },
    AUSENTE: { label: 'Ausente', variant: 'danger' },
    TARDANZA: { label: 'Tardanza', variant: 'warning' },
    JUSTIFICADO: { label: 'Justificado', variant: 'info' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'info' };
  return <Badge variant={variant}>{label}</Badge>;
}

function CertBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'danger' | 'gray' }> = {
    APROBADO: { label: 'Aprobado', variant: 'success' },
    NO_APROBADO: { label: 'No Aprobado', variant: 'danger' },
    PENDIENTE: { label: 'Pendiente', variant: 'gray' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' };
  return <Badge variant={variant}>{label}</Badge>;
}

export function TrainingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isSpecialist } = usePermissions();
  const canEdit = isAdmin || isSpecialist;

  const [training, setTraining] = useState<Training | null>(null);
  const [participants, setParticipants] = useState<TrainingParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<TrainingParticipant | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrainingParticipantFormData>({
    defaultValues: { attendance: 'PRESENTE', certificationStatus: 'PENDIENTE' },
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [t, parts] = await Promise.all([
          trainingService.getById(Number(id)),
          trainingService.getParticipants(Number(id)).catch(() => []),
        ]);
        setTraining(t);
        setParticipants(parts);
      } catch {
        toast.error('Error al cargar la capacitación');
        navigate('/training');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const openAdd = () => {
    setEditingParticipant(null);
    reset({ attendance: 'PRESENTE', certificationStatus: 'PENDIENTE' });
    setShowModal(true);
  };

  const openEdit = (p: TrainingParticipant) => {
    setEditingParticipant(p);
    reset({
      dni: p.dni,
      fullName: p.fullName,
      age: p.age,
      phone: p.phone,
      email: p.email,
      pastoralRole: p.pastoralRole,
      attendance: p.attendance,
      initialScore: p.initialScore,
      finalScore: p.finalScore,
      certificationStatus: p.certificationStatus,
      observations: p.observations,
    });
    setShowModal(true);
  };

  const onSubmitParticipant = async (data: TrainingParticipantFormData) => {
    try {
      if (editingParticipant) {
        const updated = await trainingService.updateParticipant(editingParticipant.id, data);
        setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success('Participante actualizado');
      } else {
        const created = await trainingService.addParticipant(Number(id), data);
        setParticipants((prev) => [...prev, created]);
        toast.success('Participante agregado');
      }
      setShowModal(false);
    } catch {
      toast.error('Error al guardar el participante');
    }
  };

  const deleteParticipant = async (participantId: number) => {
    if (!confirm('¿Eliminar participante?')) return;
    try {
      await trainingService.deleteParticipant(participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      toast.success('Participante eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <PageSpinner />;
  if (!training) return null;

  const totalPresentes = participants.filter((p) => p.attendance === 'PRESENTE').length;
  const totalAprobados = participants.filter((p) => p.certificationStatus === 'APROBADO').length;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/training')} className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{training.name}</h1>
            <Badge variant="info">{training.trainingCode}</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Registrada el {format(new Date(training.createdAt), "d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => navigate(`/training/${id}/edit`)}
          >
            Editar
          </Button>
        )}
      </div>

      {/* Info cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="px-5 py-4 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-[#009850]" />
          <h2 className="font-semibold text-gray-800">Información de la Capacitación</h2>
        </div>
        <div className="px-5 py-2">
          <dl className="divide-y divide-gray-50">
            <InfoRow label="Modalidad" value={
              training.modality === 'SINCRONICA' ? 'Sincrónica'
              : training.modality === 'ASINCRONICA' ? 'Asincrónica'
              : training.modality === 'MIXTA' ? 'Mixta' : training.modality
            } />
            <InfoRow label="Parroquia" value={training.parish} />
            <InfoRow label="Responsable OGP" value={training.responsible} />
            <InfoRow label="Descripción" value={training.description} />
          </dl>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="px-5 py-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#009850]" />
          <h2 className="font-semibold text-gray-800">Fechas</h2>
        </div>
        <div className="px-5 py-2">
          <dl className="divide-y divide-gray-50">
            <InfoRow
              label="Fecha de Inicio"
              value={training.startDate ? format(new Date(training.startDate), "d 'de' MMMM yyyy", { locale: es }) : undefined}
            />
            <InfoRow
              label="Fecha de Fin"
              value={training.endDate ? format(new Date(training.endDate), "d 'de' MMMM yyyy", { locale: es }) : undefined}
            />
          </dl>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: participants.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Presentes', value: totalPresentes, color: 'bg-green-50 text-green-700' },
          { label: 'Ausentes', value: participants.length - totalPresentes, color: 'bg-red-50 text-red-700' },
          { label: 'Aprobados', value: totalAprobados, color: 'bg-purple-50 text-purple-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Participants */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#009850]" />
            <h2 className="font-semibold text-gray-800">
              Participantes
              <span className="ml-2 text-sm font-normal text-gray-500">({participants.length})</span>
            </h2>
          </div>
          <Button size="sm" variant="outline" icon={<Plus className="h-4 w-4" />} onClick={openAdd}>
            Agregar participante
          </Button>
        </div>
        {participants.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No hay participantes registrados aún
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['DNI', 'Nombre', 'Rol Pastoral', 'Asistencia', 'Nota Inicial', 'Nota Final', 'Certificación', ''].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {participants.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-sm text-gray-600">{p.dni ?? '—'}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-800">{p.fullName}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{p.pastoralRole ?? '—'}</td>
                    <td className="px-4 py-2"><AttendanceBadge status={p.attendance} /></td>
                    <td className="px-4 py-2 text-sm text-gray-600">{p.initialScore ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{p.finalScore ?? '—'}</td>
                    <td className="px-4 py-2"><CertBadge status={p.certificationStatus} /></td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <>
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteParticipant(p.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingParticipant(null); reset(); }}
        title={editingParticipant ? 'Editar Participante' : 'Agregar Participante'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmitParticipant)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="DNI" placeholder="12345678" maxLength={8} {...register('dni')} />
            <Input
              label="Nombre completo"
              required
              placeholder="Juan Pérez García"
              error={errors.fullName?.message}
              {...register('fullName', { required: 'El nombre es obligatorio' })}
            />
            <Input label="Edad" type="number" placeholder="30" {...register('age', { valueAsNumber: true })} />
            <Input label="Teléfono" placeholder="987654321" {...register('phone')} />
            <Input label="Email" type="email" placeholder="juan@ejemplo.com" {...register('email')} />
            <Input label="Rol pastoral" placeholder="Brigadista, Coordinador..." {...register('pastoralRole')} />
            <Select label="Asistencia" options={ATTENDANCE_OPTIONS} {...register('attendance')} />
            <Select label="Estado de certificación" options={CERT_OPTIONS} {...register('certificationStatus')} />
            <Input label="Nota inicial" type="number" step="0.1" placeholder="0 - 20" {...register('initialScore', { valueAsNumber: true })} />
            <Input label="Nota final" type="number" step="0.1" placeholder="0 - 20" {...register('finalScore', { valueAsNumber: true })} />
          </div>
          <Input label="Observaciones" placeholder="Notas adicionales..." {...register('observations')} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting} fullWidth>
              {editingParticipant ? 'Actualizar' : 'Registrar participante'}
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={() => { setShowModal(false); setEditingParticipant(null); reset(); }}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
