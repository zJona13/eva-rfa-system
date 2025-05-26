
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import NotificacionesBadge from '@/components/NotificacionesBadge';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada exitosamente');
  };

  // Determinar el nombre a mostrar, priorizando colaboradorName
  const displayName = user?.colaboradorName || user?.name || 'Usuario';
  const displayRole = user?.role || 'guest';

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold">Sistema de Evaluación para Desempeño del Personal - IES</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <NotificacionesBadge />
          
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">({displayRole})</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
