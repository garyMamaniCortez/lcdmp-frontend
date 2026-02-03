import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, roles, requiredRoles }: ProtectedRouteProps) {
  const effectiveRoles = roles || (requiredRoles as UserRole[] | undefined);
  const { user, isLoading, hasAnyRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (effectiveRoles && !hasAnyRole(effectiveRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
