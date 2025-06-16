import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserSquare2, ClipboardList, AlertCircle, CheckSquare, Users, ShieldCheck, BarChart4 } from 'lucide-react';
import { useAuth, getToken } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { modulesData } from '@/config/navigation';
import StatCard from '@/components/Dashboard/StatCard';
import ModuleCard from '@/components/Dashboard/ModuleCard';
import RecentEvaluations from '@/components/Dashboard/RecentEvaluations';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  evaluacionesRecibidas?: number;
  evaluacionesAprobadas?: number;
  promedioCalificacion?: number;
  incidenciasPersonales?: number;
  totalEvaluaciones?: number;
  evaluacionesPendientes?: number;
  validacionesPendientes?: number;
  promedioGeneral?: number;
  incidenciasActivas?: number;
  totalResultados?: number;
}

interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Filter modules based on user role
  const userRole = user?.role || 'guest';
  const filteredModules = modulesData.filter(module => 
    !module.roles || module.roles.includes(userRole)
  );

  // Fetch dashboard statistics using authenticated API
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery<DashboardResponse>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('🔄 Fetching dashboard stats...');
      const token = getToken();
      const response = await fetch('/api/dashboard/stats', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        throw new Error('Error fetching dashboard stats');
      }
      const data = await response.json();
      console.log('✅ Dashboard stats fetched successfully:', data);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3 // Retry failed requests 3 times
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

  // Loading skeleton for stats
  const StatsSkeleton = () => (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 bg-white rounded-lg shadow">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {displayName}</h1>
        <p className="text-muted-foreground mt-4">
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* Error alert */}
      {statsError && (
        <Alert variant="destructive">
          <AlertDescription>
            {t('dashboard.errorLoadingStats')}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats overview */}
      {(!isAdminOrEvaluator || userRole === 'evaluator') && (
        statsLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {isEvaluated ? (
              // Estadísticas para docentes evaluados
              <>
                <StatCard
                  title={t('dashboard.receivedEvaluations')}
                  value={stats.evaluacionesRecibidas || '0'}
                  icon={<ClipboardList className="h-6 w-6" />}
                />
                <StatCard
                  title={t('dashboard.approvedEvaluations')}
                  value={stats.evaluacionesAprobadas || '0'}
                  icon={<CheckSquare className="h-6 w-6" />}
                  valueClassName="text-green-600"
                />
                <StatCard
                  title={t('dashboard.averageScore')}
                  value={`${(stats.promedioCalificacion || 0).toFixed(1)}/20`}
                  icon={<BarChart4 className="h-6 w-6" />}
                  valueClassName="text-blue-600"
                />
                <StatCard
                  title={t('dashboard.personalIncidents')}
                  value={stats.incidenciasPersonales || '0'}
                  icon={<AlertCircle className="h-6 w-6" />}
                  valueClassName="text-orange-600"
                />
              </>
            ) : (
              // Estadísticas para estudiantes y evaluadores
              <>
                <StatCard
                  title={t('dashboard.pendingEvaluations')}
                  value={stats.evaluacionesPendientes || '0'}
                  icon={<ClipboardList className="h-6 w-6" />}
                />
                <StatCard
                  title={t('dashboard.activeIncidents')}
                  value={stats.incidenciasActivas || '0'}
                  icon={<AlertCircle className="h-6 w-6" />}
                  valueClassName="text-orange-600"
                />
                <StatCard
                  title={t('dashboard.pendingValidations')}
                  value={stats.validacionesPendientes || '0'}
                  icon={<ShieldCheck className="h-6 w-6" />}
                />
                <StatCard
                  title={t('dashboard.totalResults')}
                  value={stats.totalResultados || '0'}
                  icon={<BarChart4 className="h-6 w-6" />}
                />
              </>
            )}
          </div>
        )
      )}

      {/* Recent evaluations, chart and modules */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Recent Evaluations */}
          <RecentEvaluations />
        </div>
        {/* Module access */}
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
