
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { register, isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');

    // Validate password
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    await register(name, email, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">IES RFA</h1>
          <p className="text-xl font-medium">Sistema de Evaluación</p>
        </div>
        
        <div className="bg-background rounded-lg shadow-lg p-6 border">
          <div className="w-full space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Crear una cuenta</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Complete el formulario para registrarse en el sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico institucional</Label>
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
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                aria-label="Registrarse"
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Registrando...
                  </>
                ) : 'Registrarse'}
              </Button>

              <p className="text-center text-sm">
                ¿Ya tiene una cuenta?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:underline focus:outline-none focus:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
