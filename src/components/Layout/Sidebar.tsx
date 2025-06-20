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
  let filteredNav = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );
  // Si el usuario es admin, ocultar las evaluaciones del sidebar
  if (userRole === 'admin') {
    const evalRoutes = ['/self-evaluation', '/student-evaluation', '/supervisor-evaluation'];
    filteredNav = filteredNav.filter(item => !evalRoutes.includes(item.href));
  }

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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-60 border-r bg-gradient-to-b from-sidebar via-sidebar/95 to-sidebar shadow-lg pt-16 transition-all duration-300 ease-in-out md:translate-x-0 md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Section */}
          <div className="p-3 border-b border-sidebar-border/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">IES</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xs font-bold text-sidebar-foreground leading-tight">
                  Sistema de Evaluación
                </h2>
                <p className="text-xs text-sidebar-foreground/60 font-medium">
                  Desempeño del Personal - IES RFA
                </p>
              </div>
            </div>
            
            {/* User Role Badge */}
            <div className="flex items-center justify-between p-2 bg-sidebar-accent/10 rounded-lg border border-sidebar-border/30">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-xs font-medium text-sidebar-foreground truncate">
                  {userRole === 'admin' ? 'Administrador' : 
                   userRole === 'evaluator' ? 'Evaluador' : 
                   userRole === 'evaluated' ? 'Evaluado' : 
                   userRole === 'student' ? 'Estudiante' : 
                   userRole === 'validator' ? 'Validador' : 'Invitado'}
                </span>
              </div>
              {userRole === 'admin' && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5 flex-shrink-0 ml-1">
                  Admin
                </Badge>
              )}
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="px-2 space-y-1">
              {filteredNav.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.href}
                    onClick={handleNavClick}
                    className={({ isActive }) => cn(
                      "group flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 ease-in-out relative overflow-hidden",
                      "hover:scale-[1.01] hover:shadow-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      isActive 
                        ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary shadow-sm border border-primary/20" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground hover:border-sidebar-border/40 border border-transparent"
                    )}
                  >
                    {/* Icon container with improved styling */}
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 flex-shrink-0",
                      location.pathname === item.href
                        ? "bg-primary/20 text-primary"
                        : "group-hover:bg-sidebar-accent/30"
                    )}>
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    
                    {/* Text with better typography */}
                    <span className="flex-1 font-medium tracking-wide truncate">{item.title}</span>
                    
                    {/* Badge with improved design */}
                    {item.badge && (
                      <Badge 
                        variant={item.badge.variant} 
                        className="ml-auto text-xs px-1 py-0.5 font-semibold shadow-sm flex-shrink-0"
                      >
                        {item.badge.text}
                      </Badge>
                    )}
                    
                    {/* Active indicator */}
                    {location.pathname === item.href && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-r-full"></div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Section */}
          <div className="p-2 border-t border-sidebar-border/20 bg-sidebar-accent/5">
            <div className="text-center">
              <p className="text-xs text-sidebar-foreground/50 font-medium">
                &copy; {new Date().getFullYear()} IES RFA
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
