
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
    <header className="h-16 border-b border-border/40 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 fixed top-0 left-0 right-0 z-40 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:pl-80">
        {/* Left Section */}
        <div className="flex items-center space-x-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 hover:bg-accent/50 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">IES</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                Sistema de Evaluación
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Desempeño del Personal - IES
              </p>
            </div>
            <h1 className="sm:hidden text-base font-semibold text-foreground truncate">
              IES Evaluación
            </h1>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Notifications */}
          <NotificacionesBadge />
          
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 hover:bg-accent/50 transition-all duration-200"
            title={t('header.changeTheme')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">{t('header.changeTheme')}</span>
          </Button>
          
          {/* User Info */}
          <div className="hidden lg:flex items-center space-x-3 px-3 py-2 bg-accent/20 rounded-lg border border-border/40">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border-2 border-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-tight">{displayName}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {displayRole === 'admin' ? 'Administrador' : 
                 displayRole === 'evaluator' ? 'Evaluador' : 
                 displayRole === 'evaluated' ? 'Evaluado' : 
                 displayRole === 'student' ? 'Estudiante' : 
                 displayRole === 'validator' ? 'Validador' : 'Invitado'}
              </span>
            </div>
          </div>
          
          {/* Mobile User Info */}
          <div className="lg:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border-2 border-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
          
          {/* Logout Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="h-9 px-3 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 border border-transparent hover:border-destructive/20"
          >
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline font-medium">{t('header.logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
