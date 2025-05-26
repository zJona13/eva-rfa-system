
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { authenticatedFetch } from '@/utils/oauthUtils';

// These would normally come from your API
export type UserRole = 'admin' | 'evaluator' | 'evaluated' | 'student' | 'validator' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  colaboradorId?: number | null;
  colaboradorName?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API URL
const API_URL = 'http://localhost:3306/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Función para mapear roles de la API a tipos UserRole
  const mapRole = (role: string): UserRole => {
    switch(role) {
      case 'Administrador':
        return 'admin';
      case 'Evaluador':
        return 'evaluator';
      case 'Evaluado':
        return 'evaluated';
      case 'Estudiante':
        return 'student';
      case 'Validador':
        return 'validator';
      default:
        return 'guest';
    }
  };

  // Función para obtener el token almacenado
  const getStoredToken = () => {
    return localStorage.getItem('oauth_access_token');
  };

  // Función para almacenar el token
  const storeToken = (tokenData: any) => {
    localStorage.setItem('oauth_access_token', tokenData.access_token);
    localStorage.setItem('oauth_refresh_token', tokenData.refresh_token);
    localStorage.setItem('oauth_expires_at', (Date.now() + (tokenData.expires_in * 1000)).toString());
  };

  // Función para limpiar tokens
  const clearTokens = () => {
    localStorage.removeItem('oauth_access_token');
    localStorage.removeItem('oauth_refresh_token');
    localStorage.removeItem('oauth_expires_at');
    localStorage.removeItem('current_user');
  };

  // Función para verificar si el token ha expirado
  const isTokenExpired = () => {
    const expiresAt = localStorage.getItem('oauth_expires_at');
    if (!expiresAt) return true;
    return Date.now() > parseInt(expiresAt);
  };

  // Función para refrescar el token
  const refreshToken = async () => {
    const refresh_token = localStorage.getItem('oauth_refresh_token');
    if (!refresh_token) return false;

    try {
      const response = await fetch(`${API_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.access_token) {
        storeToken(data);
        return true;
      } else {
        console.error('Error refreshing token:', data);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  useEffect(() => {
    // Verificar si hay una sesión activa guardada
    const savedUser = localStorage.getItem('current_user');
    const token = getStoredToken();
    
    console.log('Checking saved session:', { user: savedUser ? 'exists' : 'not found', token: token ? 'exists' : 'not found' });
    
    if (savedUser && token && savedUser !== 'null' && savedUser !== 'undefined') {
      try {
        // Verificar si el token sigue siendo válido
        if (isTokenExpired()) {
          console.log('Token expired, attempting refresh...');
          refreshToken().then((refreshed) => {
            if (refreshed) {
              const userData = JSON.parse(savedUser);
              setUser(userData);
              console.log('User session restored with refreshed token:', userData.name);
            } else {
              console.log('Failed to refresh token, clearing session');
              clearTokens();
            }
            setIsLoading(false);
          });
        } else {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log('User session restored:', userData.name);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        clearTokens();
        setIsLoading(false);
      }
    } else {
      console.log('No valid user session found');
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting OAuth login for:', email);
      const response = await fetch(`${API_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'password',
          username: email,
          password: password
        }),
      });

      const data = await response.json();
      console.log('OAuth login response:', data);
      
      if (!response.ok) {
        toast.error(data.error_description || 'Credenciales incorrectas');
        setIsLoading(false);
        return;
      }
      
      if (data.access_token) {
        // Almacenar tokens
        storeToken(data);
        
        // Obtener información del usuario usando authenticatedFetch
        const userInfo = await authenticatedFetch(`${API_URL}/oauth/me`);
        
        if (userInfo.success && userInfo.user) {
          const mappedUser = {
            id: userInfo.user.id.toString(),
            name: userInfo.user.name,
            email: userInfo.user.email,
            role: mapRole(userInfo.user.role),
            colaboradorId: userInfo.user.colaboradorId,
            colaboradorName: userInfo.user.colaboradorName
          };
          
          setUser(mappedUser);
          localStorage.setItem('current_user', JSON.stringify(mappedUser));
          console.log('User session saved successfully');
          
          // Mostrar nombre del colaborador si está disponible
          const displayName = mappedUser.colaboradorName || mappedUser.name;
          toast.success(`Bienvenido, ${displayName}`);
          navigate('/dashboard');
        } else {
          toast.error('Error al obtener información del usuario');
        }
      } else {
        toast.error('Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      toast.info('Funcionalidad de registro no implementada en la API actual');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        // Intentar revocar el token en el servidor
        await fetch(`${API_URL}/oauth/revoke`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        }).catch(err => console.log('Error revoking token:', err));
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      clearTokens();
      console.log('User logged out, session cleared');
      toast.info('Sesión cerrada');
      navigate('/login');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
