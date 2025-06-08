import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
  const [resetToken, setResetToken] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3309/api/auth/forgot-password', {
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
        toast.error(data.message || 'Error al enviar el código');
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3309/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Código verificado correctamente');
        setResetToken(data.token);
        setStep('reset');
      } else {
        toast.error(data.message || 'Código de verificación incorrecto');
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3309/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          token: resetToken, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Contraseña actualizada correctamente');
        onBack();
      } else {
        toast.error(data.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
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
          onClick={onBack}
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
