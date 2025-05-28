
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserSquare2, ClipboardList, AlertCircle, CheckSquare, Users, ShieldCheck, BarChart4 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApiWithToken } from '@/hooks/useApiWithToken';
import { modulesData } from '@/config/navigation';
import StatCard from '@/components/Dashboard/StatCard';
import ModuleCard from '@/components/Dashboard/ModuleCard';
import RecentEvaluations from '@/components/Dashboard/RecentEvaluations';
import EvaluationsChart from '@/components/Dashboard/EvaluationsChart';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { apiRequest } = useApiWithToken();
  
  // Filter modules based on user role
  const userRole = user?.role || 'guest';
  const filteredModules = modulesData.filter(module => 
    !module.roles || module.roles.includes(userRole)
  );

  // Fetch dashboard statistics using authenticated API
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiRequest('/dashboard/stats'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const stats = statsData?.data?.stats || {};

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
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
        <p className="text-muted-foreground mt-4">
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isEvaluated ? (
          // Estadísticas para docentes evaluados
          <>
            <StatCard
              title={t('dashboard.receivedEvaluations')}
              value={statsLoading ? '-' : stats.evaluacionesRecibidas || '0'}
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <StatCard
              title={t('dashboard.approvedEvaluations')}
              value={statsLoading ? '-' : stats.evaluacionesAprobadas || '0'}
              icon={<CheckSquare className="h-6 w-6" />}
              valueClassName="text-green-600"
            />
            <StatCard
              title={t('dashboard.averageScore')}
              value={statsLoading ? '-' : `${stats.promedioCalificacion || '0'}/20`}
              icon={<BarChart4 className="h-6 w-6" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title={t('dashboard.personalIncidents')}
              value={statsLoading ? '-' : stats.incidenciasPersonales || '0'}
              icon={<AlertCircle className="h-6 w-6" />}
              valueClassName="text-orange-600"
            />
          </>
        ) : isAdminOrEvaluator ? (
          // Estadísticas para administradores y evaluadores
          <>
            <StatCard
              title={t('dashboard.totalEvaluations')}
              value={statsLoading ? '-' : stats.totalEvaluaciones || '0'}
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <StatCard
              title={t('dashboard.pendingEvaluations')}
              value={statsLoading ? '-' : stats.evaluacionesPendientes || '0'}
              icon={<AlertCircle className="h-6 w-6" />}
              valueClassName="text-yellow-600"
            />
            <StatCard
              title={t('dashboard.pendingValidations')}
              value={statsLoading ? '-' : stats.validacionesPendientes || '0'}
              icon={<ShieldCheck className="h-6 w-6" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title={t('dashboard.generalAverage')}
              value={statsLoading ? '-' : `${stats.promedioGeneral || '0'}/20`}
              icon={<BarChart4 className="h-6 w-6" />}
              valueClassName="text-green-600"
            />
          </>
        ) : (
          // Estadísticas por defecto para otros roles
          <>
            <StatCard
              title={t('dashboard.pendingEvaluations')}
              value="0"
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <StatCard
              title={t('dashboard.activeIncidents')}
              value="0"
              icon={<AlertCircle className="h-6 w-6" />}
              valueClassName="text-orange-600"
            />
            <StatCard
              title={t('dashboard.pendingValidations')}
              value="0"
              icon={<ShieldCheck className="h-6 w-6" />}
            />
            <StatCard
              title={t('dashboard.totalResults')}
              value="0"
              icon={<BarChart4 className="h-6 w-6" />}
            />
          </>
        )}
      </div>

      {/* Recent evaluations, chart and modules */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Recent Evaluations */}
          <RecentEvaluations />
          
          {/* Evaluations Chart */}
          <EvaluationsChart />
        </div>

        {/* Module access */}
        <div className="space-y-4">
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
