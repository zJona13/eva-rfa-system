import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

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
const API_URL = 'http://localhost:3309/api';

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
    return localStorage.getItem('iesrfa_token');
  };

  // Función para guardar el token
  const saveToken = (token: string) => {
    localStorage.setItem('iesrfa_token', token);
    console.log('🔑 Token guardado en localStorage');
  };

  // Función para eliminar el token
  const removeToken = () => {
    localStorage.removeItem('iesrfa_token');
    localStorage.removeItem('current_user');
    console.log('🗑️ Token y usuario eliminados del localStorage');
  };

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyStoredToken = async () => {
      const token = getStoredToken();
      
      if (!token) {
        console.log('⚠️ No se encontró token almacenado');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando token almacenado...');
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            const mappedUser = {
              id: data.user.id.toString(),
              name: data.user.name,
              email: data.user.email,
              role: mapRole(data.user.role),
              colaboradorId: data.user.colaboradorId,
              colaboradorName: data.user.colaboradorName
            };
            
            setUser(mappedUser);
            localStorage.setItem('current_user', JSON.stringify(mappedUser));
            console.log('✅ Sesión restaurada para:', mappedUser.name);
          }
        } else {
          console.log('❌ Token inválido o expirado, eliminando...');
          removeToken();
        }
      } catch (error) {
        console.error('❌ Error verificando token:', error);
        removeToken();
      }
      
      setIsLoading(false);
    };

    verifyStoredToken();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Intentando login para:', email);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📨 Respuesta del servidor:', data);
      
      if (!response.ok) {
        toast.error(data.message || 'Credenciales incorrectas');
        setIsLoading(false);
        // Throw error to trigger failed attempt handling
        throw new Error(data.message || 'Credenciales incorrectas');
      }
      
      if (data.success && data.user && data.token) {
        // Guardar el token JWT
        saveToken(data.token);
        
        const mappedUser = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          role: mapRole(data.user.role),
          colaboradorId: data.user.colaboradorId,
          colaboradorName: data.user.colaboradorName
        };
        
        setUser(mappedUser);
        localStorage.setItem('current_user', JSON.stringify(mappedUser));
        console.log('✅ Login exitoso, usuario y token guardados');
        
        // Mostrar nombre del colaborador si está disponible
        const displayName = mappedUser.colaboradorName || mappedUser.name;
        toast.success(`Bienvenido, ${displayName}`);
        navigate('/dashboard');
      } else {
        toast.error('Error al iniciar sesión');
        throw new Error('Error al iniciar sesión');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      if (error instanceof Error && error.message !== 'Error al conectar con el servidor') {
        // Re-throw the error so LoginForm can handle failed attempts
        throw error;
      } else {
        toast.error('Error al conectar con el servidor');
        throw new Error('Error al conectar con el servidor');
      }
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
      console.error('❌ Error en registro:', error);
      toast.error('Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = getStoredToken();
      
      if (token) {
        // Notificar al servidor para invalidar el token
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('❌ Error en logout del servidor:', error);
    } finally {
      // Limpiar estado local
      setUser(null);
      removeToken();
      console.log('🔓 Logout completado, redirigiendo a login');
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
