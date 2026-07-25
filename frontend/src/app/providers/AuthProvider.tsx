import {
  createContext,
  useState,
  useEffect,
  type FC,
  type PropsWithChildren,
  useContext,
  useCallback,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Nullable } from '@/shared/types/types';
import { tokenManager } from '@/shared/api/tokenManager';
import { navigationRoutes } from '@/shared/routes/navigationRoutes';

type UserTokenPayload = {
  sub: string;
  sessionId: string;
  iat: number;
  exp: number;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: Nullable<string>) => void;
  setIsAuthenticated: (value: boolean) => void;
  navigateAfterAuth: () => void;
};

const authContextDefault: AuthContextType = {
  isAuthenticated: false,
  isLoading: true,
  setToken: () => {},
  setIsAuthenticated: () => {},
  navigateAfterAuth: () => {},
};

const AuthContext = createContext<AuthContextType>(authContextDefault);

export const AuthProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<Nullable<string>>(() =>
    tokenManager.getAccessToken(),
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentToken = tokenManager.getAccessToken();
    if (
      currentToken &&
      location.pathname !== navigationRoutes.login &&
      !sessionStorage.getItem('redirectPath')
    ) {
      sessionStorage.setItem('redirectPath', location.pathname + location.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateAfterAuth = useCallback(() => {
    const savedPath = sessionStorage.getItem('redirectPath');
    if (savedPath && savedPath !== navigationRoutes.login) {
      sessionStorage.removeItem('redirectPath');
      navigate(savedPath);
    } else {
      navigate(navigationRoutes.home);
    }
  }, [navigate]);

  const handleToken = useCallback(
    (currentToken: string | null) => {
      if (currentToken) {
        try {
          const decodedToken: UserTokenPayload = jwtDecode(currentToken);
          if (decodedToken) {
            setIsAuthenticated(true);
            setIsLoading(false);

            if (location.pathname === navigationRoutes.login) {
              navigateAfterAuth();
            }
            return;
          }
        } catch {
          // ignore invalid token
        }
      } else {
        setIsAuthenticated(false);
        if (
          location.pathname !== navigationRoutes.login &&
          location.pathname !== navigationRoutes.signup &&
          location.pathname !== navigationRoutes.githubSuccess &&
          location.pathname !== navigationRoutes.confirmEmail &&
          !sessionStorage.getItem('redirectPath')
        ) {
          sessionStorage.setItem('redirectPath', location.pathname + location.search);
        }
        if (
          location.pathname !== navigationRoutes.signup &&
          location.pathname !== navigationRoutes.githubSuccess &&
          location.pathname !== navigationRoutes.confirmEmail
        ) {
          navigate(navigationRoutes.login);
        }
      }
      setIsLoading(false);
    },
    [location.pathname, location.search, navigate, navigateAfterAuth],
  );

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      handleToken(token);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [handleToken, token]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        setToken,
        setIsAuthenticated,
        navigateAfterAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext);
