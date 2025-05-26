
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
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyToken: () => Promise<boolean>;
  revokeAllTokens: () => Promise<void>;
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

// Token management utilities
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getStoredUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  if (userData && userData !== 'null' && userData !== 'undefined') {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem(USER_KEY);
    }
  }
  return null;
};

const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const removeStoredUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
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

  // Verificar token con el servidor
  const verifyToken = async (): Promise<boolean> => {
    const storedToken = getStoredToken();
    
    if (!storedToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: storedToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const mappedUser = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          role: mapRole(data.user.role),
          colaboradorId: data.user.colaboradorId,
          colaboradorName: data.user.colaboradorName
        };

        setUser(mappedUser);
        setToken(storedToken);
        setStoredUser(mappedUser);
        console.log('Token verification successful for user:', mappedUser.name);
        return true;
      } else {
        // Token inválido, limpiar almacenamiento
        removeStoredToken();
        removeStoredUser();
        console.log('Token verification failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      
      // Verificar si hay un token almacenado
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      
      if (storedToken && storedUser) {
        console.log('Found stored token and user, verifying...');
        const isValid = await verifyToken();
        
        if (!isValid) {
          console.log('Stored token is invalid, clearing session');
          setUser(null);
          setToken(null);
        }
      } else {
        console.log('No stored authentication found');
      }
      
      setIsLoading(false);
    };

    initializeAuth();
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
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok) {
        toast.error(data.message || 'Credenciales incorrectas');
        setIsLoading(false);
        return;
      }
      
      if (data.success && data.user && data.token) {
        const mappedUser = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          role: mapRole(data.user.role),
          colaboradorId: data.user.colaboradorId,
          colaboradorName: data.user.colaboradorName
        };
        
        setUser(mappedUser);
        setToken(data.token);
        
        // Almacenar token y usuario
        setStoredToken(data.token);
        setStoredUser(mappedUser);
        
        console.log('Login successful, token and user saved');
        console.log('Token:', data.token.substring(0, 16) + '...');
        
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

  const revokeAllTokens = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/revoke-all-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Todos los tokens han sido revocados');
        logout(); // Cerrar sesión actual también
      } else {
        toast.error('Error al revocar tokens');
      }
    } catch (error) {
      console.error('Error revoking tokens:', error);
      toast.error('Error al revocar tokens');
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout del servidor
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setToken(null);
    removeStoredToken();
    removeStoredUser();
    
    console.log('User logged out, session and token cleared');
    toast.info('Sesión cerrada');
    navigate('/login');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    register,
    verifyToken,
    revokeAllTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
