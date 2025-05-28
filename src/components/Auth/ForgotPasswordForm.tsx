
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [step, setStep] = useState<'email' | 'verification' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationEmail = async (userEmail: string, code: string) => {
    // Simulación del envío de email
    console.log(`Enviando código ${code} a ${userEmail}`);
    
    // En una implementación real, aquí harías una llamada a tu API
    // que enviaría el email usando un servicio como Nodemailer, SendGrid, etc.
    
    // Por ahora, mostraremos el código en la consola para testing
    toast.info(`Código de verificación enviado a ${userEmail}. Código: ${code}`);
    
    return true;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingrese su correo electrónico');
      return;
    }

    setIsLoading(true);
    
    try {
      // Verificar si el email existe en la base de datos
      const response = await fetch('http://localhost:3306/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        const code = generateVerificationCode();
        setGeneratedCode(code);
        
        // Enviar código por email
        await sendVerificationEmail(email, code);
        
        setStep('verification');
        toast.success('Código de verificación enviado a su correo');
      } else {
        toast.error(data.message || 'Correo electrónico no encontrado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar código de verificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode !== generatedCode) {
      toast.error('Código de verificación incorrecto');
      return;
    }
    
    setStep('newPassword');
    toast.success('Código verificado correctamente');
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
      const response = await fetch('http://localhost:3306/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Contraseña actualizada exitosamente');
        onBack();
      } else {
        toast.error(data.message || 'Error al actualizar contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Recuperar Contraseña</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {step === 'email' && 'Ingrese su correo para recibir un código de verificación'}
          {step === 'verification' && 'Ingrese el código enviado a su correo'}
          {step === 'newPassword' && 'Ingrese su nueva contraseña'}
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
          
          <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
            Volver al inicio de sesión
          </Button>
        </form>
      )}

      {step === 'verification' && (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          
          <Button type="submit" className="w-full">
            Verificar código
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full" 
            onClick={() => setStep('email')}
          >
            Enviar nuevo código
          </Button>
        </form>
      )}

      {step === 'newPassword' && (
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
