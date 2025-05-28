
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import NotificacionesBadge from '@/components/NotificacionesBadge';
import LanguageSelector from '@/components/LanguageSelector';

const Header = () => {
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
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-40">
      <div className="flex h-14 items-center justify-between px-4 md:pl-76">
        <div className="flex items-center space-x-2 min-w-0">
          <h1 className="text-base md:text-lg font-semibold truncate">
            {t('header.systemTitle')}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <NotificacionesBadge />
          
          <LanguageSelector />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
            title={t('header.changeTheme')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">{t('header.changeTheme')}</span>
          </Button>
          
          <div className="hidden md:flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">({displayRole})</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">{t('header.logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
