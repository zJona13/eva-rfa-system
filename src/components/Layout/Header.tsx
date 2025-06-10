
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import NotificacionesBadge from '@/components/NotificacionesBadge';
import LanguageSelector from '@/components/LanguageSelector';

const Header = ({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    toast.success(t('auth.sessionClosed'));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Determinar el nombre a mostrar, priorizando colaboradorName
  const displayName = user?.colaboradorName || user?.name || 'Usuario';
  const displayRole = user?.role || 'guest';

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-40 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:pl-80">
        {/* Left Section */}
        <div className="flex items-center space-x-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-8 w-8 p-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">IES</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">
                {t('header.welcome')}, {displayName}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {displayRole === 'admin' ? 'Administrador' : 
                 displayRole === 'evaluator' ? 'Evaluador' : 
                 displayRole === 'evaluated' ? 'Evaluado' : 
                 displayRole === 'student' ? 'Estudiante' : 
                 displayRole === 'validator' ? 'Validador' : 'Invitado'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <NotificacionesBadge />
          
          <LanguageSelector />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 hover:bg-accent"
            title={t('header.changeTheme')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">{t('header.changeTheme')}</span>
          </Button>
          
          <div className="hidden lg:flex items-center space-x-3 px-3 py-2 rounded-lg bg-accent/50">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground">{displayRole}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">{t('header.logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
