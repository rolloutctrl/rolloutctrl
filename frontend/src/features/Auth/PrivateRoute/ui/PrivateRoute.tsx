import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { FullscreenLoader } from '@/shared/ui';
import { navigationRoutes } from '@/shared/routes/navigationRoutes';

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  if (isLoading) {
    return <FullscreenLoader />;
  }

  return isAuthenticated ? children : <Navigate to={navigationRoutes.login} replace />;
};
