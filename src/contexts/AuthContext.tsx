
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

  // Eliminar verificación de token al cargar la app
  useEffect(() => {
    // Ya no se verifica token, solo limpiar loading
    setIsLoading(false);
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
        throw new Error(data.message || 'Credenciales incorrectas');
      }
      
      if (data.success && data.user) {
        // Solo guardar el usuario en el estado
        const mappedUser = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          role: mapRole(data.user.role),
          colaboradorId: data.user.colaboradorId,
          colaboradorName: data.user.colaboradorName
        };
        setUser(mappedUser);
        toast.success(`Bienvenido, ${mappedUser.colaboradorName || mappedUser.name}`);
        navigate('/dashboard');
      } else {
        toast.error('Error al iniciar sesión');
        throw new Error('Error al iniciar sesión');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      if (error instanceof Error && error.message !== 'Error al conectar con el servidor') {
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
    // Limpiar usuario del estado y redirigir
    setUser(null);
    toast.info('Sesión cerrada');
    navigate('/login');
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
