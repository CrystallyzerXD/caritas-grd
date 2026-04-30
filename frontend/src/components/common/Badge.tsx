import React from 'react';
import type { IncidentStatus, EnvironmentalStatus, UserRole } from '../../types';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple' | 'cian' | 'lima' | 'naranja' | 'amarillo';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-800',
  gray:    'bg-gray-100 text-gray-700',
  purple:  'bg-purple-100 text-purple-800',
  // Cáritas UI Kit semantic badge colors
  cian:     'bg-teal-100 text-teal-700',
  lima:     'bg-lime-100 text-lime-700',
  naranja:  'bg-orange-100 text-orange-700',
  amarillo: 'bg-amber-100 text-amber-700',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

// Incident status badge
export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const map: Record<IncidentStatus, { label: string; variant: BadgeVariant }> = {
    OPEN:        { label: 'Abierto',     variant: 'cian'     },
    IN_PROGRESS: { label: 'En Proceso',  variant: 'naranja'  },
    CLOSED:      { label: 'Cerrado',     variant: 'lima'     },
    FOLLOW_UP:   { label: 'Seguimiento', variant: 'amarillo' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' };
  return <Badge variant={variant}>{label}</Badge>;
}

// Environmental status badge
export function EnvironmentalStatusBadge({ status }: { status: EnvironmentalStatus }) {
  const map: Record<EnvironmentalStatus, { label: string; variant: BadgeVariant }> = {
    PLANNED: { label: 'Planificado', variant: 'info' },
    IN_PROGRESS: { label: 'En Ejecucion', variant: 'warning' },
    COMPLETED: { label: 'Completado', variant: 'success' },
    CANCELLED: { label: 'Cancelado', variant: 'danger'  },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' };
  return <Badge variant={variant}>{label}</Badge>;
}

// Role badge
export function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, { label: string; variant: BadgeVariant }> = {
    ADMIN: { label: 'Administrador', variant: 'danger' },
    GRD_SPECIALIST: { label: 'Especialista GRD', variant: 'purple' },
    BRIGADISTA: { label: 'Brigadista', variant: 'warning' },
    AUTHORIZED_USER: { label: 'Usuario Autorizado', variant: 'info' },
  };
  const { label, variant } = map[role] ?? { label: role, variant: 'gray' };
  return <Badge variant={variant}>{label}</Badge>;
}
