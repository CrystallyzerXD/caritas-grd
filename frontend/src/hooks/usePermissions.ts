import { useAuth } from './useAuth';
import type { UserRole } from '../types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 5,
  GRD_SPECIALIST: 4,
  JEFA_OGP: 3,
  BRIGADISTA: 2,
  COMITE_DONACIONES: 2,
  AUTHORIZED_USER: 1,
  ALMACEN: 1,
};

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role];
  };

  const isAdmin = user?.role === 'ADMIN';
  const isSpecialist = user?.role === 'GRD_SPECIALIST' || user?.role === 'JEFA_OGP' || isAdmin;
  const isBrigadista = user?.role === 'BRIGADISTA' || isSpecialist;
  const isComiteDonaciones = user?.role === 'COMITE_DONACIONES';
  const isAuthorized = !!user;

  const canCreateIncident = isBrigadista;
  const canEditIncident = isSpecialist;
  const canDeleteIncident = isAdmin;
  const canManageBrigadistas = isSpecialist;
  const canViewReports = isAuthorized;
  const canManageUsers = isAdmin;
  const canManageCatalogs = isAdmin;
  const canUploadEvidence = isBrigadista;
  const canApproveDonations = isComiteDonaciones || isAdmin;

  return {
    hasRole,
    isAdmin,
    isSpecialist,
    isBrigadista,
    isComiteDonaciones,
    isAuthorized,
    canCreateIncident,
    canEditIncident,
    canDeleteIncident,
    canManageBrigadistas,
    canViewReports,
    canManageUsers,
    canManageCatalogs,
    canUploadEvidence,
    canApproveDonations,
  };
}
