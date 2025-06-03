
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3306/api';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const useApiWithToken = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('iesrfa_token');
    
    if (!token) {
      console.log('⚠️ No se encontró token para la petición');
      return {};
    }

    console.log('🔑 Usando token para petición API:', token.substring(0, 20) + '...');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const apiRequest = useCallback(async <T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      const { method = 'GET', body, headers = {} } = options;
      
      const authHeaders = getAuthHeaders();
      
      if (!authHeaders.Authorization) {
        console.log('❌ No se puede hacer petición sin token de autorización');
        toast.error('Sesión expirada, por favor inicia sesión nuevamente');
        logout();
        return { success: false, error: 'NO_TOKEN' };
      }
      
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      };

      console.log(`🌐 ${method} ${endpoint}`);
      console.log('🔍 Headers enviados:', {
        'Content-Type': requestHeaders['Content-Type'],
        'Authorization': requestHeaders['Authorization'] ? 'Bearer [TOKEN]' : 'NO_AUTH'
      });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log(`📊 Respuesta del servidor: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);

      // Manejar errores de autenticación
      if (response.status === 401) {
        console.log('❌ Token inválido o expirado, cerrando sesión');
        toast.error('Sesión expirada, por favor inicia sesión nuevamente');
        logout();
        return { success: false, error: 'TOKEN_EXPIRED' };
      }

      if (!response.ok) {
        const errorMessage = data.message || `Error HTTP ${response.status}`;
        console.log(`❌ Error en petición ${method} ${endpoint}:`, errorMessage);
        console.log('❌ Detalles del error:', data);
        setError(errorMessage);
        return { success: false, error: errorMessage, message: data.message };
      }

      console.log(`✅ Petición ${method} ${endpoint} exitosa`);
      return { success: true, data };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      console.error(`❌ Error en petición a ${endpoint}:`, error);
      setError(errorMessage);
      toast.error('Error de conexión con el servidor');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, logout]);

  return {
    apiRequest,
    isLoading,
    error,
  };
};

export default useApiWithToken;
