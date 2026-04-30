import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MapPin,
  ExternalLink,
  Users,
  ImageIcon,
  Upload,
  Plus,
  Calendar,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { incidentService } from '../../services/incidentService';
import type { Incident, AffectedPerson, Evidence, AffectedPersonFormData } from '../../types';
import { IncidentStatusBadge } from '../../components/common/Badge';
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

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEditIncident, canUploadEvidence } = usePermissions();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [persons, setPersons] = useState<AffectedPerson[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AffectedPersonFormData>();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [inc, pers, evid] = await Promise.all([
          incidentService.getById(Number(id)),
          incidentService.getAffectedPersons(Number(id)).catch(() => []),
          incidentService.getEvidences(Number(id)).catch(() => []),
        ]);
        setIncident(inc);
        setPersons(pers);
        setEvidences(evid);
      } catch {
        toast.error('Error al cargar la incidencia');
        navigate('/incidents');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const addPerson = async (data: AffectedPersonFormData) => {
    try {
      const person = await incidentService.addAffectedPerson(Number(id), data);
      setPersons((prev) => [...prev, person]);
      toast.success('Persona afectada registrada');
      reset();
      setShowPersonModal(false);
    } catch {
      toast.error('Error al registrar la persona');
    }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const evidence = await incidentService.uploadEvidence(Number(id), formData);
      setEvidences((prev) => [...prev, evidence]);
      toast.success('Evidencia subida correctamente');
    } catch {
      toast.error('Error al subir la evidencia');
    } finally {
      setUploadingEvidence(false);
      e.target.value = '';
    }
  };

  const changeStatus = async (newStatus: string) => {
    if (!incident) return;
    try {
      const updated = await incidentService.update(incident.id, {
        status: newStatus as Incident['status'],
      });
      setIncident(updated);
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  if (loading) return <PageSpinner />;
  if (!incident) return null;

  const mapsUrl =
    incident.latitude && incident.longitude
      ? `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`
      : null;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/incidents')}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">
              Incidencia #{incident.id}
            </h1>
            <IncidentStatusBadge status={incident.status} />
          </div>
          <p className="text-sm text-gray-500">
            Registrada el{' '}
            {format(new Date(incident.createdAt), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
          </p>
        </div>
        {canEditIncident && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Edit className="h-4 w-4" />}
              onClick={() => navigate(`/incidents/${id}/edit`)}
            >
              Editar
            </Button>
            {incident.status !== 'CLOSED' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => changeStatus('CLOSED')}
              >
                Cerrar incidencia
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="px-5 py-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#009850]" />
          <h2 className="font-semibold text-gray-800">Información General</h2>
        </div>
        <div className="px-5 py-2">
          <dl className="divide-y divide-gray-50">
            <InfoRow label="Tipo de Evento" value={incident.eventType} />
            <InfoRow label="Descripción" value={incident.description} />
            <InfoRow label="Causa" value={incident.cause} />
            <InfoRow label="Pérdidas" value={incident.losses} />
            <InfoRow label="Acciones Tomadas" value={incident.actionsTaken} />
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Estado</dt>
              <dd className="mt-1 sm:mt-0 sm:col-span-2">
                <IncidentStatusBadge status={incident.status} />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="px-5 py-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#009850]" />
          <h2 className="font-semibold text-gray-800">Ubicación</h2>
        </div>
        <div className="px-5 py-2">
          <dl className="divide-y divide-gray-50">
            <InfoRow label="Distrito" value={incident.district} />
            <InfoRow label="Dirección" value={incident.address} />
            {incident.latitude && incident.longitude && (
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Coordenadas GPS</dt>
                <dd className="mt-1 sm:mt-0 sm:col-span-2 flex items-center gap-3">
                  <span className="text-sm text-gray-900">
                    {incident.latitude}, {incident.longitude}
                  </span>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver en Google Maps
                    </a>
                  )}
                </dd>
              </div>
            )}
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
              label="Fecha del Evento"
              value={incident.incidentDate
                ? format(new Date(incident.incidentDate), "d 'de' MMMM yyyy", { locale: es })
                : undefined}
            />
            <InfoRow
              label="Reportado Por"
              value={incident.reportedBy}
            />
          </dl>
        </div>
      </div>

      {/* Affected persons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#009850]" />
            <h2 className="font-semibold text-gray-800">
              Personas Afectadas
              <span className="ml-2 text-sm font-normal text-gray-500">({persons.length})</span>
            </h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowPersonModal(true)}
          >
            Agregar
          </Button>
        </div>
        {persons.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No hay personas afectadas registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Nombre', 'DNI', 'F. Nacimiento', 'Género', 'Teléfono', 'Tipo de Afectación'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {persons.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-sm text-gray-800">{p.fullName}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{p.dni ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{p.birthDate ? format(new Date(p.birthDate), 'dd/MM/yyyy') : '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{p.gender ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{p.phone ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{p.affectationType ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Evidence */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#009850]" />
            <h2 className="font-semibold text-gray-800">
              Evidencias
              <span className="ml-2 text-sm font-normal text-gray-500">({evidences.length})</span>
            </h2>
          </div>
          {canUploadEvidence && (
            <label className="cursor-pointer">
              <Button
                size="sm"
                variant="outline"
                icon={uploadingEvidence ? undefined : <Upload className="h-4 w-4" />}
                loading={uploadingEvidence}
                onClick={() => document.getElementById('evidence-upload')?.click()}
              >
                Subir evidencia
              </Button>
              <input
                id="evidence-upload"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleEvidenceUpload}
              />
            </label>
          )}
        </div>
        {evidences.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No hay evidencias subidas aún
          </div>
        ) : (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {evidences.map((ev) => (
              <a
                key={ev.id}
                href={ev.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square border border-gray-200 hover:border-[#009850] transition-colors"
              >
                {ev.fileType?.startsWith('image') ? (
                  <img
                    src={ev.fileUrl}
                    alt={ev.fileName}
                    className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <span className="text-xs text-gray-500 text-center px-2 truncate w-full">{ev.fileName}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Add person modal */}
      <Modal
        isOpen={showPersonModal}
        onClose={() => { setShowPersonModal(false); reset(); }}
        title="Agregar Persona Afectada"
        size="lg"
      >
        <form onSubmit={handleSubmit(addPerson)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              required
              placeholder="Juan Pérez García"
              error={errors.fullName?.message}
              {...register('fullName', { required: 'El nombre es obligatorio' })}
            />
            <Input
              label="DNI"
              placeholder="12345678"
              maxLength={8}
              {...register('dni')}
            />
            <Input
              label="Fecha de Nacimiento"
              type="date"
              {...register('birthDate')}
            />
            <Select
              label="Género"
              options={[
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Femenino' },
                { value: 'OTRO', label: 'Otro' },
              ]}
              placeholder="Seleccionar"
              {...register('gender')}
            />
            <Input
              label="Teléfono"
              placeholder="987654321"
              {...register('phone')}
            />
            <Input
              label="Tipo de afectación"
              placeholder="Damnificado, afectado..."
              {...register('affectationType')}
            />
          </div>
          <Input
            label="Dirección"
            placeholder="Av. Lima 123, Lima"
            {...register('address')}
          />
          <Input
            label="Observaciones"
            placeholder="Notas adicionales..."
            {...register('observations')}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting} fullWidth>
              Registrar persona
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => { setShowPersonModal(false); reset(); }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
