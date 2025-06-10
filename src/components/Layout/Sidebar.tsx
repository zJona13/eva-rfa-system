
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 md:w-80 border-r bg-gradient-to-b from-sidebar via-sidebar/95 to-sidebar shadow-xl pt-16 transition-all duration-300 ease-in-out md:translate-x-0 md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Section */}
          <div className="p-6 md:p-8 border-b border-sidebar-border/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">IES</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-bold text-sidebar-foreground leading-tight">
                  Sistema de Evaluación
                </h2>
                <p className="text-xs text-sidebar-foreground/60 font-medium">
                  Desempeño del Personal
                </p>
              </div>
            </div>
            
            {/* User Role Badge */}
            <div className="flex items-center gap-2 p-3 bg-sidebar-accent/10 rounded-lg border border-sidebar-border/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-sidebar-foreground">
                {userRole === 'admin' ? 'Administrador' : 
                 userRole === 'evaluator' ? 'Evaluador' : 
                 userRole === 'evaluated' ? 'Evaluado' : 
                 userRole === 'student' ? 'Estudiante' : 
                 userRole === 'validator' ? 'Validador' : 'Invitado'}
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="px-4 space-y-2">
              {filteredNav.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.href}
                    onClick={handleNavClick}
                    className={({ isActive }) => cn(
                      "group flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden",
                      "hover:scale-[1.02] hover:shadow-md",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      isActive 
                        ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary shadow-md border border-primary/20" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground hover:border-sidebar-border/40 border border-transparent"
                    )}
                  >
                    {/* Icon container with improved styling */}
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                      location.pathname === item.href
                        ? "bg-primary/20 text-primary"
                        : "group-hover:bg-sidebar-accent/30"
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    
                    {/* Text with better typography */}
                    <span className="flex-1 font-medium tracking-wide">{item.title}</span>
                    
                    {/* Badge with improved design */}
                    {item.badge && (
                      <Badge 
                        variant={item.badge.variant} 
                        className="ml-auto text-xs px-2 py-1 font-semibold shadow-sm"
                      >
                        {item.badge.text}
                      </Badge>
                    )}
                    
                    {/* Active indicator */}
                    {location.pathname === item.href && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-r-full"></div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Section */}
          <div className="p-6 border-t border-sidebar-border/20 bg-sidebar-accent/5">
            <div className="text-center">
              <p className="text-xs text-sidebar-foreground/50 font-medium mb-1">
                &copy; {new Date().getFullYear()} IES RFA
              </p>
              <p className="text-xs text-sidebar-foreground/40">
                Sistema de Evaluación para Desempeño del Personal
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
