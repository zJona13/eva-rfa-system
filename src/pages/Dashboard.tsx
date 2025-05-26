import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserSquare2, ClipboardList, AlertCircle, CheckSquare, Users, ShieldCheck, BarChart4 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { modulesData } from '@/config/navigation';
import StatCard from '@/components/Dashboard/StatCard';
import ModuleCard from '@/components/Dashboard/ModuleCard';
import RecentEvaluations from '@/components/Dashboard/RecentEvaluations';
import { authenticatedFetch } from '@/utils/sessionUtils';

const API_BASE_URL = 'http://localhost:3306';

const fetchDashboardStats = async () => {
  return authenticatedFetch(`${API_BASE_URL}/api/dashboard/stats`);
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filter modules based on user role
  const userRole = user?.role || 'guest';
  const filteredModules = modulesData.filter(module => 
    !module.roles || module.roles.includes(userRole)
  );

  // Fetch dashboard statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('invalid_token') || error?.message?.includes('token_expired')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  const stats = statsData?.stats || {};

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Use full collaborator name if available, otherwise use user name
  const displayName = user?.colaboradorName || user?.name;

  // Determine if user is evaluated (docente) - using English role values
  const isEvaluated = userRole === 'evaluated';
  const isAdminOrEvaluator = userRole === 'admin' || userRole === 'evaluator';

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
        {isEvaluated ? (
          // Estadísticas para docentes evaluados
          <>
            <StatCard
              title="Evaluaciones recibidas"
              value={statsLoading ? '-' : stats.evaluacionesRecibidas || '0'}
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <StatCard
              title="Evaluaciones aprobadas"
              value={statsLoading ? '-' : stats.evaluacionesAprobadas || '0'}
              icon={<CheckSquare className="h-6 w-6" />}
              valueClassName="text-green-600"
            />
            <StatCard
              title="Promedio de calificación"
              value={statsLoading ? '-' : `${stats.promedioCalificacion || '0'}/20`}
              icon={<BarChart4 className="h-6 w-6" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title="Incidencias registradas"
              value={statsLoading ? '-' : stats.incidenciasPersonales || '0'}
              icon={<AlertCircle className="h-6 w-6" />}
              valueClassName="text-orange-600"
            />
          </>
        ) : isAdminOrEvaluator ? (
          // Estadísticas para administradores y evaluadores
          <>
            <StatCard
              title="Total de evaluaciones"
              value={statsLoading ? '-' : stats.totalEvaluaciones || '0'}
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <StatCard
              title="Evaluaciones pendientes"
              value={statsLoading ? '-' : stats.evaluacionesPendientes || '0'}
              icon={<AlertCircle className="h-6 w-6" />}
              valueClassName="text-yellow-600"
            />
            <StatCard
              title="Validaciones pendientes"
              value={statsLoading ? '-' : stats.validacionesPendientes || '0'}
              icon={<ShieldCheck className="h-6 w-6" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title="Promedio general"
              value={statsLoading ? '-' : `${stats.promedioGeneral || '0'}/20`}
              icon={<BarChart4 className="h-6 w-6" />}
              valueClassName="text-green-600"
            />
          </>
        ) : (
          // Estadísticas por defecto para otros roles
          <>
            <StatCard
              title="Evaluaciones pendientes"
              value="0"
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <StatCard
              title="Incidencias activas"
              value="0"
              icon={<AlertCircle className="h-6 w-6" />}
              valueClassName="text-orange-600"
            />
            <StatCard
              title="Validaciones pendientes"
              value="0"
              icon={<ShieldCheck className="h-6 w-6" />}
            />
            <StatCard
              title="Total de resultados"
              value="0"
              icon={<BarChart4 className="h-6 w-6" />}
            />
          </>
        )}
      </div>

      {/* Recent evaluations and modules */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Evaluations */}
        <RecentEvaluations />

        {/* Module access */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Módulos disponibles</h2>
          <div className="grid gap-4">
            {filteredModules.slice(0, 6).map((module) => (
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
    </div>
  );
};

export default Dashboard;
