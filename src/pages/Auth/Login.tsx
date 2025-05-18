
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/Auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }
  
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
      </div>
    </div>
  );
};

export default Login;
