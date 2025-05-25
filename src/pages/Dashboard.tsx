import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSquare2, ClipboardList, AlertCircle, CheckSquare, Users, ShieldCheck, BarChart4 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { modulesData } from '@/config/navigation';
import StatCard from '@/components/Dashboard/StatCard';
import ModuleCard from '@/components/Dashboard/ModuleCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filter modules based on user role
  const userRole = user?.role || 'guest';
  const filteredModules = modulesData.filter(module => 
    !module.roles || module.roles.includes(userRole)
  );

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Use full collaborator name if available, otherwise use user name
  const displayName = user?.colaboradorNombre || user?.name;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {displayName}</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido al Sistema Integral de Evaluación del Personal IES RFA.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Evaluaciones pendientes"
          value={userRole === 'admin' ? '12' : userRole === 'evaluated' ? '2' : '5'}
          icon={<ClipboardList className="h-6 w-6" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Incidencias activas"
          value={userRole === 'admin' ? '4' : '1'}
          icon={<AlertCircle className="h-6 w-6" />}
          trend={{ value: 12, isPositive: false }}
          valueClassName="text-ies-warning-500"
        />
        <StatCard
          title="Validaciones pendientes"
          value={userRole === 'admin' || userRole === 'validator' ? '8' : '0'}
          icon={<ShieldCheck className="h-6 w-6" />}
        />
        <StatCard
          title="Total de resultados"
          value={userRole === 'admin' ? '247' : '15'}
          icon={<BarChart4 className="h-6 w-6" />}
          trend={{ value: 23, isPositive: true }}
        />
      </div>

      {/* Module access */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Módulos disponibles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              description={module.description}
              href={module.href}
              icon={<module.icon className="h-5 w-5" />}
              color={module.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
