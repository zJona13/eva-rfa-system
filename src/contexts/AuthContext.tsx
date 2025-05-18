
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

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Usuario',
    email: 'admin@iesrfa.edu',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Docente Evaluado',
    email: 'docente@iesrfa.edu',
    role: 'evaluated',
  },
  {
    id: '3',
    name: 'Estudiante',
    email: 'estudiante@iesrfa.edu',
    role: 'student',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage (simulating persistence)
    const storedUser = localStorage.getItem('iesrfa_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('iesrfa_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching email (in a real app, this would be an API request)
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser) {
        // In a real app, you'd validate the password here too
        setUser(foundUser);
        localStorage.setItem('iesrfa_user', JSON.stringify(foundUser));
        toast.success(`Bienvenido, ${foundUser.name}`);
        navigate('/dashboard');
      } else {
        toast.error('Credenciales incorrectas. Por favor intente nuevamente.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists (in a real app, this would be an API request)
      if (mockUsers.some(u => u.email === email)) {
        toast.error('Este correo electrónico ya está registrado.');
        return;
      }
      
      // In a real app, this would create a new user in the database
      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        name,
        email,
        role: 'evaluated', // Default role
      };
      
      // This would be saved to the database in a real app
      mockUsers.push(newUser);
      
      toast.success('Usuario registrado exitosamente. Por favor inicie sesión.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Error al registrar usuario. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('iesrfa_user');
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
