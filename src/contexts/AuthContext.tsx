
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

  useEffect(() => {
    // Verificar si hay una sesión activa guardada
    const savedUser = localStorage.getItem('current_user');
    console.log('Checking saved user session:', savedUser ? 'exists' : 'not found');
    
    if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('User session restored:', userData.name);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('current_user');
      }
    } else {
      console.log('No valid user session found');
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok) {
        toast.error(data.message || 'Credenciales incorrectas');
        setIsLoading(false);
        return;
      }
      
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
        // Guardar sesión sin token
        localStorage.setItem('current_user', JSON.stringify(mappedUser));
        console.log('User session saved successfully');
        
        // Mostrar nombre del colaborador si está disponible
        const displayName = mappedUser.colaboradorName || mappedUser.name;
        toast.success(`Bienvenido, ${displayName}`);
        navigate('/dashboard');
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    console.log('User logged out, session cleared');
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
