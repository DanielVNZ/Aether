import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { embyApi } from '../services/embyApi';
import type { StoredAuth, LoginCredentials } from '../types/emby.types';

export function useAuth() {
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuth = authService.getAuth();
    if (storedAuth) {
      setAuth(storedAuth);
      embyApi.setCredentials(storedAuth);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await embyApi.authenticateByName(
        credentials.serverUrl,
        credentials.username,
        credentials.password
      );

      const authData: StoredAuth = {
        serverUrl: credentials.serverUrl,
        username: credentials.username,
        password: credentials.password,
        userId: response.User.Id,
        accessToken: response.AccessToken,
        deviceId: localStorage.getItem('emby_device_id') || '',
      };

      authService.saveAuth(authData);
      embyApi.setCredentials(authData);
      setAuth(authData);
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await embyApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.clearAuth();
      setAuth(null);
      navigate('/login');
    }
  };

  return {
    auth,
    isAuthenticated: !!auth,
    isLoading,
    login,
    logout,
  };
}
