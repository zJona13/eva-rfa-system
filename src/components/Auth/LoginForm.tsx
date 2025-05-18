
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(email, password);
  };

  // Pre-fill demo credentials for ease of testing
  const fillDemoCredentials = (role: 'admin' | 'evaluated' | 'student') => {
    switch(role) {
      case 'admin':
        setEmail('admin@iesrfa.edu');
        setPassword('password');
        break;
      case 'evaluated':
        setEmail('docente@iesrfa.edu');
        setPassword('password');
        break;
      case 'student':
        setEmail('estudiante@iesrfa.edu');
        setPassword('password');
        break;
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Ingrese sus credenciales para acceder al sistema
        </p>
      </div>

      <div className="flex flex-col gap-2 text-center text-sm">
        <p className="text-muted-foreground">Credenciales de demostración:</p>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => fillDemoCredentials('admin')}
            className="text-xs"
          >
            Admin
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => fillDemoCredentials('evaluated')}
            className="text-xs"
          >
            Docente
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => fillDemoCredentials('student')}
            className="text-xs"
          >
            Estudiante
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@iesrfa.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <a 
              href="#" 
              className="text-sm text-primary hover:underline focus:outline-none focus:underline"
            >
              ¿Olvidó su contraseña?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          aria-label="Iniciar sesión"
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
              Iniciando sesión...
            </>
          ) : 'Iniciar sesión'}
        </Button>

        <p className="text-center text-sm">
          ¿No tiene una cuenta?{' '}
          <Link 
            to="/register" 
            className="text-primary hover:underline focus:outline-none focus:underline"
          >
            Registrarse
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
