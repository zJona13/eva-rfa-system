
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
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 bg-card rounded-xl border shadow-sm">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20">
              <BarChart4 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {getGreeting()}, {displayName}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mt-1">
                {t('dashboard.welcome')}
              </p>
            </div>
          </div>
        </div>

        {/* Error alert */}
        {statsError && (
          <Alert variant="destructive" className="border-l-4 border-l-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('dashboard.errorLoadingStats')}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats overview */}
        {(!isAdminOrEvaluator || userRole === 'evaluator') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              Estadísticas Generales
            </h2>
            {statsLoading ? (
              <StatsSkeleton />
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {isEvaluated ? (
                  // Estadísticas para docentes evaluados
                  <>
                    <StatCard
                      title={t('dashboard.receivedEvaluations')}
                      value={stats.evaluacionesRecibidas || '0'}
                      icon={<ClipboardList className="h-5 w-5" />}
                      className="hover:shadow-md transition-shadow"
                    />
                    <StatCard
                      title={t('dashboard.approvedEvaluations')}
                      value={stats.evaluacionesAprobadas || '0'}
                      icon={<CheckSquare className="h-5 w-5" />}
                      valueClassName="text-emerald-600 dark:text-emerald-400"
                      className="hover:shadow-md transition-shadow"
                    />
                    <StatCard
                      title={t('dashboard.averageScore')}
                      value={`${(stats.promedioCalificacion || 0).toFixed(1)}/20`}
                      icon={<BarChart4 className="h-5 w-5" />}
                      valueClassName="text-blue-600 dark:text-blue-400"
                      className="hover:shadow-md transition-shadow"
                    />
                    <StatCard
                      title={t('dashboard.personalIncidents')}
                      value={stats.incidenciasPersonales || '0'}
                      icon={<AlertCircle className="h-5 w-5" />}
                      valueClassName="text-amber-600 dark:text-amber-400"
                      className="hover:shadow-md transition-shadow"
                    />
                  </>
                ) : (
                  // Estadísticas para estudiantes y evaluadores
                  <>
                    <StatCard
                      title={t('dashboard.pendingEvaluations')}
                      value={stats.evaluacionesPendientes || '0'}
                      icon={<ClipboardList className="h-5 w-5" />}
                      className="hover:shadow-md transition-shadow"
                    />
                    <StatCard
                      title={t('dashboard.activeIncidents')}
                      value={stats.incidenciasActivas || '0'}
                      icon={<AlertCircle className="h-5 w-5" />}
                      valueClassName="text-amber-600 dark:text-amber-400"
                      className="hover:shadow-md transition-shadow"
                    />
                    <StatCard
                      title={t('dashboard.pendingValidations')}
                      value={stats.validacionesPendientes || '0'}
                      icon={<ShieldCheck className="h-5 w-5" />}
                      className="hover:shadow-md transition-shadow"
                    />
                    <StatCard
                      title={t('dashboard.totalResults')}
                      value={stats.totalResultados || '0'}
                      icon={<BarChart4 className="h-5 w-5" />}
                      className="hover:shadow-md transition-shadow"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Recent evaluations */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              Actividad Reciente
            </h2>
            <div className="bg-card rounded-xl border shadow-sm">
              <RecentEvaluations />
            </div>
          </div>
          
          {/* Module access */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              Acceso Rápido
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {filteredModules.slice(0, 6).map((module) => (
                <div key={module.id} className="transform hover:scale-105 transition-transform duration-200">
                  <ModuleCard
                    title={module.title}
                    description={module.description}
                    href={module.href}
                    icon={<module.icon className="h-5 w-5" />}
                    color={module.color}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
