import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetAll = () => {
    setEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setStep('email');
    setError('');
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Código de verificación enviado a tu correo');
        setStep('verify');
      } else {
        setError(data.message || 'Error al enviar el código');
        toast.error(data.message || 'Error al enviar el código');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Código verificado correctamente');
        setStep('reset');
      } else {
        let msg = data.message || 'Código de verificación incorrecto';
        if (msg.includes('expirado')) msg = 'El código ha expirado. Solicita uno nuevo.';
        if (msg.includes('utilizado')) msg = 'El código ya ha sido utilizado. Solicita uno nuevo.';
        setError(msg);
        toast.error(msg);
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code: verificationCode, 
          newPassword 
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Contraseña actualizada correctamente');
        resetAll();
        onBack();
      } else {
        let msg = data.message || 'Error al actualizar la contraseña';
        if (msg.includes('código') && msg.includes('utilizado')) msg = 'El código ya ha sido utilizado. Solicita uno nuevo.';
        if (msg.includes('código') && msg.includes('válido')) msg = 'El código no es válido o ya fue utilizado.';
        setError(msg);
        toast.error(msg);
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => { resetAll(); onBack(); }}
          className="mb-4 p-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </Button>
        <h1 className="text-2xl font-bold">Recuperar Contraseña</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {step === 'email' && 'Ingresa tu correo electrónico para recibir un código de verificación'}
          {step === 'verify' && 'Ingresa el código que enviamos a tu correo'}
          {step === 'reset' && 'Crea una nueva contraseña para tu cuenta'}
        </p>
      </div>

      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-6">
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
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar código de verificación'}
          </Button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              required
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Código enviado a: {email}
            </p>
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Verificar código'}
          </Button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
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
              minLength={6}
            />
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
