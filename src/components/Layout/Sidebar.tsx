
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navItems } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || 'guest';
  
  // Filter navigation items based on user role
  const filteredNav = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  // Close sidebar on mobile when a link is clicked
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 border-r bg-sidebar pt-16 transition-transform duration-300 md:translate-x-0 md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-sidebar-foreground">
              Sistema de Evaluación
            </h2>
            <p className="text-sm text-sidebar-foreground/70">
              {userRole === 'admin' ? 'Administrador' : 
               userRole === 'evaluator' ? 'Evaluador' : 
               userRole === 'evaluated' ? 'Evaluado' : 
               userRole === 'student' ? 'Estudiante' : 
               userRole === 'validator' ? 'Validador' : 'Invitado'}
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="px-3 py-2 space-y-1">
              {filteredNav.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.href}
                    onClick={handleNavClick}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant={item.badge.variant} className="ml-auto text-xs">
                        {item.badge.text}
                      </Badge>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} IES RFA - Sistema de Evaluación del Personal
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
