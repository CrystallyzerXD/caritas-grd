import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MapPin,
  ExternalLink,
  ImageIcon,
  Upload,
  Plus,
  Calendar,
  AlertTriangle,
  FileText,
  ClipboardList,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { incidentService } from '../../services/incidentService';
import { incidentReportService } from '../../services/incidentReportService';
import type { Incident, AffectedPerson, AffectedFamily, Evidence, IncidentReport } from '../../types';
import { IncidentStatusBadge, Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageSpinner } from '../../components/common/Spinner';
import { usePermissions } from '../../hooks/usePermissions';
import { GrdFlowStepper } from '../../components/common/GrdFlowStepper';
import { MiniMap } from '../../components/common/MiniMap';
import { AffectedSection } from '../../components/incidents/AffectedSection';

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
  const [families, setFamilies] = useState<AffectedFamily[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const handleCopyCoords = () => {
    if (!incident?.latitude || !incident?.longitude) return;
    const text = `${incident.latitude}, ${incident.longitude}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    });
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [inc, pers, fams, evid, reps] = await Promise.all([
          incidentService.getById(Number(id)),
          incidentService.getAffectedPersons(Number(id)).catch(() => []),
          incidentService.getFamilies(Number(id)).catch(() => []),
          incidentService.getEvidences(Number(id)).catch(() => []),
          incidentReportService.getByIncident(Number(id)).catch(() => []),
        ]);
        setIncident(inc);
        setPersons(pers);
        setFamilies(fams);
        setEvidences(evid);
        setReports(reps);
      } catch {
        toast.error('Error al cargar la incidencia');
        navigate('/incidents');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

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

      {/* ── Flujo de Atención GRD ── */}
      <GrdFlowStepper status={incident.status} />

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
        <div className="px-5 py-4">
          <div className={incident.latitude && incident.longitude ? 'flex gap-5' : ''}>
            {/* Info rows */}
            <dl className="flex-1 divide-y divide-gray-50">
              <InfoRow label="Distrito" value={incident.district} />
              <InfoRow label="Dirección" value={incident.address} />
              {incident.latitude && incident.longitude && (
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Coordenadas GPS</dt>
                  <dd className="mt-1 sm:mt-0 sm:col-span-2 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono text-gray-700">
                      {incident.latitude}, {incident.longitude}
                    </span>

                    {/* Copy to clipboard — paste in Uber / taxi */}
                    <button
                      type="button"
                      onClick={handleCopyCoords}
                      title="Copiar coordenadas (para Uber, taxi, etc.)"
                      className={[
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                        copiedCoords
                          ? 'bg-[#009850]/10 text-[#009850]'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                      ].join(' ')}
                    >
                      {copiedCoords
                        ? <><Check className="h-3 w-3" /> Copiado</>
                        : <><Copy className="h-3 w-3" /> Copiar ubicación</>
                      }
                    </button>

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

            {/* Mini map — only when coordinates exist */}
            {incident.latitude && incident.longitude && (
              <div className="w-64 flex-shrink-0 self-stretch min-h-[160px]">
                <MiniMap
                  lat={incident.latitude}
                  lng={incident.longitude}
                  height={200}
                />
              </div>
            )}
          </div>
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

      {/* Evaluation */}
      {(incident.caseCode || incident.affectationLevel || incident.affectedFamilies || incident.socialRiskAssessment) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          <div className="px-5 py-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#009850]" />
            <h2 className="font-semibold text-gray-800">Evaluación del Caso</h2>
          </div>
          <div className="px-5 py-2">
            <dl className="divide-y divide-gray-50">
              {incident.caseCode && <InfoRow label="Código de caso" value={incident.caseCode} />}
              {incident.affectationLevel && (
                <InfoRow
                  label="Evaluación del caso preliminar"
                  value={incident.affectationLevel === 'LEVE' ? 'Leve' : incident.affectationLevel === 'MODERADO' ? 'Moderado' : 'Severo'}
                />
              )}
              {incident.affectedFamilies != null && <InfoRow label="Familias afectadas" value={String(incident.affectedFamilies)} />}
              {incident.vulnerableGroups && <InfoRow label="Grupos vulnerables" value={incident.vulnerableGroups} />}
              {incident.urgentNeeds && <InfoRow label="Necesidades urgentes" value={incident.urgentNeeds} />}
              {incident.socialRiskAssessment && (
                <InfoRow
                  label="Riesgo social"
                  value={incident.socialRiskAssessment === 'BAJO' ? 'Bajo' : incident.socialRiskAssessment === 'MEDIO' ? 'Medio' : incident.socialRiskAssessment === 'ALTO' ? 'Alto' : 'Crítico'}
                />
              )}
              {incident.alertSource && <InfoRow label="Fuente de alerta" value={incident.alertSource} />}
              {incident.articulatedInstitutions && <InfoRow label="Instituciones articuladas" value={incident.articulatedInstitutions} />}
              {incident.reportDate && <InfoRow label="Fecha de reporte a Cáritas" value={incident.reportDate} />}
            </dl>
          </div>
        </div>
      )}

      {/* Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#009850]" />
            <h2 className="font-semibold text-gray-800">
              Informes
              <span className="ml-2 text-sm font-normal text-gray-500">({reports.length})</span>
            </h2>
          </div>
          {canEditIncident && (
            <Button
              size="sm"
              variant="outline"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate(`/incidents/${id}/reports/new`)}
            >
              Nuevo informe
            </Button>
          )}
        </div>
        {reports.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No hay informes registrados aún
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reports.map((r) => {
              const reportTypeLabel: Record<string, string> = {
                PRIMERA_VISITA: 'Primera Visita',
                ENTREGA_DONACION: 'Entrega de Donación',
                SEGUIMIENTO: 'Seguimiento',
              };
              const reportTypeVariant: Record<string, 'info' | 'success' | 'purple'> = {
                PRIMERA_VISITA: 'info',
                ENTREGA_DONACION: 'success',
                SEGUIMIENTO: 'purple',
              };
              return (
                <div key={r.id} className="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/incidents/${id}/reports/${r.id}`)}>
                  <div className="flex items-center gap-3">
                    <Badge variant={reportTypeVariant[r.reportType] ?? 'gray'}>
                      {reportTypeLabel[r.reportType] ?? r.reportType}
                    </Badge>
                    {r.deliveryCode && (
                      <span className="text-xs font-mono text-[#009850]">{r.deliveryCode}</span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {r.createdByName && `Por ${r.createdByName} — `}
                      {format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  {r.observations && (
                    <p className="mt-1 text-sm text-gray-600 truncate">{r.observations}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Affected persons & families */}
      <AffectedSection
        incidentId={Number(id)}
        initialPersons={persons}
        initialFamilies={families}
        canEdit={canEditIncident}
      />

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

    </div>
  );
}
