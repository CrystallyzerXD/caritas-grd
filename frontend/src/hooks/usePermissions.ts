import { useAuth } from './useAuth';
import type { UserRole } from '../types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 4,
  GRD_SPECIALIST: 3,
  BRIGADISTA: 2,
  AUTHORIZED_USER: 1,
};

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role];
  };

  const isAdmin = user?.role === 'ADMIN';
  const isSpecialist = user?.role === 'GRD_SPECIALIST' || isAdmin;
  const isBrigadista = user?.role === 'BRIGADISTA' || isSpecialist;
  const isAuthorized = !!user;

  const canCreateIncident = isBrigadista;
  const canEditIncident = isSpecialist;
  const canDeleteIncident = isAdmin;
  const canManageEnvironmental = isSpecialist;
  const canViewReports = isAuthorized;
  const canManageUsers = isAdmin;
  const canManageCatalogs = isAdmin;
  const canUploadEvidence = isBrigadista;

  return {
    hasRole,
    isAdmin,
    isSpecialist,
    isBrigadista,
    isAuthorized,
    canCreateIncident,
    canEditIncident,
    canDeleteIncident,
    canManageEnvironmental,
    canViewReports,
    canManageUsers,
    canManageCatalogs,
    canUploadEvidence,
  };
}
