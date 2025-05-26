
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export const useApiWithToken = () => {
  const { token, logout } = useAuth();
  
  const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
    const { method = 'GET', body, headers = {} } = options;
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    try {
      const response = await fetch(`http://localhost:3306/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...headers,
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });

      // Si el token es inválido, hacer logout automático
      if (response.status === 401) {
        toast.error('Sesión expirada, por favor inicia sesión nuevamente');
        logout();
        throw new Error('Token expirado');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error(`Error en API call ${endpoint}:`, error);
      throw error;
    }
  };

  return { apiCall };
};
