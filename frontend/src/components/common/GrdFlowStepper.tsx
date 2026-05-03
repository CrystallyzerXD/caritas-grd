import {
  ClipboardList,
  UserCheck,
  ScanSearch,
  BarChart2,
  ShieldCheck,
  Eye,
  Info,
} from 'lucide-react';
import type { IncidentStatus } from '../../types';

/* ── Step definitions ───────────────────────────────────────────────── */
const STEPS = [
  {
    key: 'registro',
    label: 'Registro',
    sub: 'Brigadista',
    Icon: ClipboardList,
  },
  {
    key: 'asignacion',
    label: 'Asignación',
    sub: 'Esp. GRD',
    Icon: UserCheck,
  },
  {
    key: 'campo',
    label: 'Campo',
    sub: 'Brigadista',
    Icon: ScanSearch,
  },
  {
    key: 'evaluacion',
    label: 'Evaluación',
    sub: 'Esp. GRD',
    Icon: BarChart2,
  },
  {
    key: 'decision',
    label: 'Decisión',
    sub: 'Comité',
    Icon: ShieldCheck,
  },
  {
    key: 'seguimiento',
    label: 'Seguimiento',
    sub: 'Esp. GRD',
    Icon: Eye,
  },
] as const;

/* ── Status → active step index ────────────────────────────────────── */
function statusToStep(status: IncidentStatus): number {
  switch (status) {
    case 'OPEN':          return 0;
    case 'IN_PROGRESS':   return 1;
    // EN_CAMPO would be step 2; map it here when added
    case 'EN_EVALUACION': return 3;
    case 'APROBADO':      return 4;
    case 'FOLLOW_UP':
    case 'ATENDIDO':      return 5;
    case 'CLOSED':        return 6; // all completed
    default:              return 0;
  }
}

/* ── Status messages ────────────────────────────────────────────────── */
const STATUS_MESSAGES: Partial<Record<IncidentStatus, string>> = {
  OPEN:          'Incidencia registrada. El Especialista GRD debe verificar y asignar un brigadista.',
  IN_PROGRESS:   'Brigadista asignado. Esperando visita al campo.',
  EN_EVALUACION: 'Información de campo recibida. En evaluación por el Especialista GRD.',
  APROBADO:      'Evaluación aprobada. Pendiente de decisión por el Comité de Donaciones.',
  ATENDIDO:      'Donación entregada. Se realizará seguimiento a las familias atendidas.',
  FOLLOW_UP:     'En seguimiento. Verificar situación de las familias atendidas.',
  CLOSED:        'Incidencia cerrada y archivada correctamente.',
};

interface Props {
  status: IncidentStatus;
}

export function GrdFlowStepper({ status }: Props) {
  const activeStep = statusToStep(status);
  const message    = STATUS_MESSAGES[status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 pt-5 pb-4">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-4">
        Flujo de Atención GRD
      </p>

      {/* Stepper row */}
      <div className="flex items-start">
        {STEPS.map((step, idx) => {
          const done    = idx < activeStep;
          const current = idx === activeStep;
          const pending = idx > activeStep;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {/* Connector line (left side) */}
              {idx > 0 && (
                <div
                  className={`absolute left-0 top-5 h-0.5 w-1/2 -translate-y-1/2 ${
                    done || current ? 'bg-[#009850]' : 'bg-gray-200'
                  }`}
                />
              )}
              {/* Connector line (right side) */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`absolute right-0 top-5 h-0.5 w-1/2 -translate-y-1/2 ${
                    done ? 'bg-[#009850]' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Icon circle */}
              <div
                className={[
                  'relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all',
                  done    ? 'bg-[#009850] text-white shadow-sm'           : '',
                  current ? 'bg-amber-400 text-white shadow-md ring-4 ring-amber-100' : '',
                  pending ? 'bg-gray-100 text-gray-400'                    : '',
                ].join(' ')}
              >
                <step.Icon className="h-4 w-4" />
              </div>

              {/* Labels */}
              <span
                className={`mt-2 text-xs font-semibold text-center leading-tight ${
                  current ? 'text-amber-600' : done ? 'text-[#009850]' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-gray-400 text-center">{step.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      {message && status !== 'CLOSED' && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
          <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">{message}</p>
        </div>
      )}
      {status === 'CLOSED' && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#009850]/10 border border-[#009850]/30 px-3 py-2.5">
          <Info className="h-4 w-4 text-[#009850] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#009850]">{message}</p>
        </div>
      )}
    </div>
  );
}
