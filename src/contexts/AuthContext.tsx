
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { loginWithSession, logoutWithSession, checkSession } from '@/utils/sessionUtils';

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

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar la aplicación
    const checkAuthStatus = async () => {
      try {
        console.log('Checking session status...');
        const sessionData = await checkSession();
        
        if (sessionData.success && sessionData.user) {
          const mappedUser = {
            id: sessionData.user.id.toString(),
            name: sessionData.user.name,
            email: sessionData.user.email,
            role: mapRole(sessionData.user.role),
            colaboradorId: sessionData.user.colaboradorId,
            colaboradorName: sessionData.user.colaboradorName
          };
          
          setUser(mappedUser);
          console.log('Session restored for user:', mappedUser.name);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting session login for:', email);
      const loginData = await loginWithSession(email, password);
      
      if (loginData.success && loginData.user) {
        const mappedUser = {
          id: loginData.user.id.toString(),
          name: loginData.user.name,
          email: loginData.user.email,
          role: mapRole(loginData.user.role),
          colaboradorId: loginData.user.colaboradorId,
          colaboradorName: loginData.user.colaboradorName
        };
        
        setUser(mappedUser);
        console.log('User session created successfully');
        
        // Mostrar nombre del colaborador si está disponible
        const displayName = mappedUser.colaboradorName || mappedUser.name;
        toast.success(`Bienvenido, ${displayName}`);
        navigate('/dashboard');
      } else {
        toast.error('Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al conectar con el servidor');
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
      await logoutWithSession();
      setUser(null);
      console.log('User logged out, session cleared');
      toast.info('Sesión cerrada');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Aún así limpiamos la sesión local
      setUser(null);
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
