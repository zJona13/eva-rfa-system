
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserSquare2, ClipboardList, AlertCircle, CheckSquare, Users, ShieldCheck, BarChart4, TrendingUp } from 'lucide-react';
import { useAuth, getToken } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { modulesData } from '@/config/navigation';
import StatCard from '@/components/Dashboard/StatCard';
import ModuleCard from '@/components/Dashboard/ModuleCard';
import RecentEvaluations from '@/components/Dashboard/RecentEvaluations';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import EvaluationsChart from '@/components/Dashboard/EvaluationsChart';
import AdminMetrics from '@/components/Dashboard/AdminMetrics';
import EvaluationsByAreaChart from '@/components/Dashboard/EvaluationsByAreaChart';
import EvaluationStatusChart from '@/components/Dashboard/EvaluationStatusChart';
import EvaluationTrendsChart from '@/components/Dashboard/EvaluationTrendsChart';
import TopPerformersTable from '@/components/Dashboard/TopPerformersTable';

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
    refetchInterval: 5000,
    retry: 3
  });

  const stats = statsData?.data?.stats || {};

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  const displayName = user?.colaboradorName || user?.name;
  const isEvaluated = userRole === 'evaluated';
  const isAdminOrEvaluator = userRole === 'admin' || userRole === 'evaluator';

  // Loading skeleton for stats
  const StatsSkeleton = () => (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card rounded-xl border p-6 shadow-sm">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header Section */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl border shadow-sm">
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-primary/20">
                    <BarChart4 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                      {getGreeting()}, {displayName}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base md:text-lg">
                      {t('dashboard.welcome')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error alert */}
          {statsError && (
            <Alert className="border-destructive/50 bg-destructive/10 rounded-xl md:rounded-2xl">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-destructive">
                {t('dashboard.errorLoadingStats')}
              </AlertDescription>
            </Alert>
          )}

          {/* Admin Dashboard */}
          {userRole === 'admin' && (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Admin Metrics */}
              <AdminMetrics />

              {/* Charts Section */}
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {/* Charts Row 1 - Stack on mobile, side by side on larger screens */}
                <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
                  <EvaluationsByAreaChart />
                  <EvaluationStatusChart />
                </div>

                {/* Charts Row 2 - Stack on mobile, side by side on larger screens */}
                <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
                  <EvaluationTrendsChart />
                  <div className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl border shadow-sm overflow-hidden">
                    <RecentEvaluations />
                  </div>
                </div>

                {/* Top Performers Table - Full width on all screens */}
                <div className="w-full">
                  <TopPerformersTable />
                </div>
              </div>
            </div>
          )}

          {/* Stats overview for non-admin users */}
          {(!isAdminOrEvaluator || userRole === 'evaluator') && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 md:h-8 bg-primary rounded-full"></div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Estadísticas Generales</h2>
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              
              {statsLoading ? (
                <StatsSkeleton />
              ) : (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {isEvaluated ? (
                    <>
                      <StatCard
                        title={t('dashboard.receivedEvaluations')}
                        value={stats.evaluacionesRecibidas || '0'}
                        icon={<ClipboardList className="h-6 w-6" />}
                        className="bg-card/70 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      />
                      <StatCard
                        title={t('dashboard.approvedEvaluations')}
                        value={stats.evaluacionesAprobadas || '0'}
                        icon={<CheckSquare className="h-6 w-6" />}
                        valueClassName="text-emerald-600 dark:text-emerald-400"
                        className="bg-card/70 backdrop-blur-sm border-border/50 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
                      />
                      <StatCard
                        title={t('dashboard.averageScore')}
                        value={`${(Number(stats.promedioCalificacion) || 0).toFixed(1)}/20`}
                        icon={<BarChart4 className="h-6 w-6" />}
                        valueClassName="text-primary"
                        className="bg-card/70 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      />
                      <StatCard
                        title={t('dashboard.personalIncidents')}
                        value={stats.incidenciasPersonales || '0'}
                        icon={<AlertCircle className="h-6 w-6" />}
                        valueClassName="text-amber-600 dark:text-amber-400"
                        className="bg-card/70 backdrop-blur-sm border-border/50 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
                      />
                    </>
                  ) : (
                    <>
                      <StatCard
                        title={t('dashboard.pendingEvaluations')}
                        value={stats.evaluacionesPendientes || '0'}
                        icon={<ClipboardList className="h-6 w-6" />}
                        className="bg-card/70 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      />
                      <StatCard
                        title={t('dashboard.activeIncidents')}
                        value={stats.incidenciasActivas || '0'}
                        icon={<AlertCircle className="h-6 w-6" />}
                        valueClassName="text-amber-600 dark:text-amber-400"
                        className="bg-card/70 backdrop-blur-sm border-border/50 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
                      />
                      <StatCard
                        title={t('dashboard.pendingValidations')}
                        value={stats.validacionesPendientes || '0'}
                        icon={<ShieldCheck className="h-6 w-6" />}
                        className="bg-card/70 backdrop-blur-sm border-border/50 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                      />
                      <StatCard
                        title={t('dashboard.totalResults')}
                        value={stats.totalResultados || '0'}
                        icon={<BarChart4 className="h-6 w-6" />}
                        className="bg-card/70 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Content Grid for non-admin users */}
          {userRole !== 'admin' && (
            <div className="grid gap-6 md:gap-8 xl:grid-cols-3">
              {/* Recent evaluations */}
              <div className="xl:col-span-2 space-y-4 md:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 md:h-8 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">Actividad Reciente</h2>
                </div>
                <div className="bg-card/70 backdrop-blur-sm rounded-2xl md:rounded-3xl border shadow-sm overflow-hidden">
                  <RecentEvaluations />
                </div>
                {userRole === 'evaluator' && (
                  <div className="mt-6">
                    <EvaluationsChart />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
