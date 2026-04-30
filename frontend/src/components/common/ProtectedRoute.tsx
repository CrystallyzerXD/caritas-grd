import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { PageSpinner } from './Spinner';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  requireSpecialist?: boolean;
  requireBrigadista?: boolean;
}

export function ProtectedRoute({
  requireAdmin = false,
  requireSpecialist = false,
  requireBrigadista = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin, isSpecialist, isBrigadista } = usePermissions();

  if (isLoading) return <PageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireSpecialist && !isSpecialist) {
    return <Navigate to="/" replace />;
  }

  if (requireBrigadista && !isBrigadista) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
