
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
    
    // Obtener token del localStorage si no está disponible en el contexto
    const authToken = token || localStorage.getItem('auth_token');
    
    if (!authToken) {
      console.error('No hay token de autenticación disponible');
      toast.error('No hay sesión activa');
      logout();
      throw new Error('No hay token de autenticación');
    }

    console.log('Realizando petición a:', endpoint, 'con token:', authToken.substring(0, 16) + '...');

    try {
      const response = await fetch(`http://localhost:3306/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          ...headers,
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log('Respuesta de API:', response.status, response.statusText);

      // Si el token es inválido, hacer logout automático
      if (response.status === 401) {
        console.log('Token inválido, haciendo logout automático');
        toast.error('Sesión expirada, por favor inicia sesión nuevamente');
        logout();
        throw new Error('Token expirado');
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error(`Error en API call ${endpoint}:`, error);
      
      // Si es un error de red, no hacer logout automático
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Error de conexión con el servidor');
      }
      
      throw error;
    }
  };

  return { apiCall };
};
