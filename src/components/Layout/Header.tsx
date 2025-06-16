
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Moon, Sun } from 'lucide-react';
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
    <header className="h-16 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-40 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:pl-76">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-foreground/90">
              Sistema de Evaluaciones
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="flex items-center space-x-1">
            <NotificacionesBadge />
            
            <LanguageSelector />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0 rounded-lg hover:bg-accent/50 transition-all duration-200"
              title={t('header.changeTheme')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">{t('header.changeTheme')}</span>
            </Button>
          </div>
          
          <div className="hidden sm:flex items-center space-x-3 ml-4 pl-4 border-l border-border/50">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-foreground">{displayName}</div>
                <div className="text-xs text-muted-foreground capitalize">{displayRole}</div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="h-9 px-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">{t('header.logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
