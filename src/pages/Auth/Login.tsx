import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/Auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check if theme preference exists in local storage
    return localStorage.getItem('iesrfa-theme') === 'dark' ? 'dark' : 'light';
  });
  
  // Effect to handle theme changes
  useEffect(() => {
    // Update the document class when theme changes
    document.documentElement.classList.toggle('dark', theme === 'dark');
    // Store theme preference in localStorage
    localStorage.setItem('iesrfa-theme', theme);
  }, [theme]);

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">IES RFA</h1>
          <p className="text-xl font-medium">Sistema de Evaluación</p>
        </div>
        
        <div className="bg-background rounded-lg shadow-lg p-6 border">
          <LoginForm />
        </div>
        
        {/* Theme Toggle Button */}
        <div className="mt-4 text-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="focus-ring rounded-full"
            aria-label={theme === 'light' ? "Activar modo oscuro" : "Activar modo claro"}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
