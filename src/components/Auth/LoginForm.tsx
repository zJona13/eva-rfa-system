import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import ForgotPasswordForm from './ForgotPasswordForm';

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 60000; // 1 minute in milliseconds

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, isLoading } = useAuth();

  // Check for existing block on component mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('login_attempts');
    const storedBlockTime = localStorage.getItem('login_block_time');
    
    if (storedAttempts) {
      setFailedAttempts(parseInt(storedAttempts));
    }
    
    if (storedBlockTime) {
      const blockTime = parseInt(storedBlockTime);
      const now = Date.now();
      
      if (now < blockTime) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil((blockTime - now) / 1000));
      } else {
        // Block time has expired, clear stored data
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('login_block_time');
      }
    }
  }, []);

  // Countdown timer for block duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setFailedAttempts(0);
            localStorage.removeItem('login_attempts');
            localStorage.removeItem('login_block_time');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isBlocked, blockTimeRemaining]);

  const handleFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    localStorage.setItem('login_attempts', newAttempts.toString());

    if (newAttempts >= MAX_ATTEMPTS) {
      const blockUntil = Date.now() + BLOCK_DURATION;
      setIsBlocked(true);
      setBlockTimeRemaining(60);
      localStorage.setItem('login_block_time', blockUntil.toString());
    }
  };

  const handleSuccessfulLogin = () => {
    setFailedAttempts(0);
    setIsBlocked(false);
    localStorage.removeItem('login_attempts');
    localStorage.removeItem('login_block_time');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isBlocked) {
      return;
    }

    try {
      await login(email, password);
      handleSuccessfulLogin();
    } catch (error) {
      handleFailedAttempt();
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

  const isButtonDisabled = isLoading || isBlocked;

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Ingrese sus credenciales para acceder al sistema
        </p>
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
            disabled={isBlocked}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <button 
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:underline focus:outline-none focus:underline"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={isBlocked}
          />
        </div>
        
        {isBlocked && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            Usted ha intentado iniciar sesión muchas veces, este botón estará bloqueado por {blockTimeRemaining} segundos
          </div>
        )}
        
        {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && !isBlocked && (
          <div className="p-3 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md">
            Intento fallido {failedAttempts} de {MAX_ATTEMPTS}. {MAX_ATTEMPTS - failedAttempts} intentos restantes.
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isButtonDisabled}
          aria-label="Iniciar sesión"
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
              Iniciando sesión...
            </>
          ) : isBlocked ? (
            `Bloqueado (${blockTimeRemaining}s)`
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
