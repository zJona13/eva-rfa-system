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
        <div key={i} className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-sm animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6 md:space-y-8">
          {/* Header Section */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-border/50 shadow-lg">
            <div className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-inner">
                    <BarChart4 className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground tracking-tight leading-tight">
                      {getGreeting()}, {displayName}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-base md:text-lg lg:text-xl">
                      {isEvaluated ? 'Panel de Control - Docente' : t('dashboard.welcome')}
                    </p>
                    {isEvaluated && (
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                          <UserSquare2 className="h-3 w-3 mr-1" />
                          Docente Evaluado
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error alert */}
          {statsError && (
            <Alert className="border-destructive/50 bg-destructive/10 rounded-2xl backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-destructive font-medium">
                {t('dashboard.errorLoadingStats')}
              </AlertDescription>
            </Alert>
          )}

          {/* Admin Dashboard */}
          {userRole === 'admin' && (
            <div className="space-y-6 md:space-y-8">
              {/* Admin Metrics */}
              <AdminMetrics />

              {/* Charts Row 1 */}
              <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2 overflow-x-auto">
                <div className="min-w-0">
                  <EvaluationsByAreaChart />
                </div>
                <div className="min-w-0">
                  <EvaluationStatusChart />
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2 overflow-x-auto">
                <div className="min-w-0">
                  <EvaluationTrendsChart />
                </div>
                <div className="min-w-0 bg-card/70 backdrop-blur-sm rounded-2xl md:rounded-3xl border shadow-sm overflow-x-auto">
                  <RecentEvaluations />
                </div>
              </div>
            </div>
          )}

          {/* Stats overview for non-admin users */}
          {(!isAdminOrEvaluator || userRole === 'evaluator') && (
            <div className="space-y-6 md:space-y-8">
              {/* Section Title */}
              <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-8 md:h-10 bg-gradient-to-b from-primary to-primary/60 rounded-full shadow-sm"></div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                    {isEvaluated ? 'Mis Métricas de Evaluación' : 'Estadísticas Generales'}
                  </h2>
                  {isEvaluated && (
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                      Resumen de tu desempeño académico y evaluaciones recibidas
                    </p>
                  )}
                </div>
                <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              
              {statsLoading ? (
                <StatsSkeleton />
              ) : (
                <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {isEvaluated ? (
                    <>
                      <StatCard
                        title={t('dashboard.receivedEvaluations')}
                        value={stats.evaluacionesRecibidas || '0'}
                        icon={<ClipboardList className="h-6 w-6 md:h-7 md:w-7" />}
                        description="Total de evaluaciones realizadas"
                        className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 dark:from-blue-950/50 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-300 group"
                        valueClassName="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                      />
                      <StatCard
                        title={t('dashboard.approvedEvaluations')}
                        value={stats.evaluacionesAprobadas || '0'}
                        icon={<CheckSquare className="h-6 w-6 md:h-7 md:w-7" />}
                        description="Evaluaciones exitosas (≥11 pts)"
                        valueClassName="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
                        className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/50 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xl transition-all duration-300 group"
                      />
                      <StatCard
                        title={t('dashboard.averageScore')}
                        value={`${(Number(stats.promedioCalificacion) || 0).toFixed(1)}/20`}
                        icon={<BarChart4 className="h-6 w-6 md:h-7 md:w-7" />}
                        description="Calificación promedio obtenida"
                        valueClassName="text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300"
                        className="bg-gradient-to-br from-purple-50/80 to-purple-100/30 dark:from-purple-950/50 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-xl transition-all duration-300 group"
                        trend={{
                          value: 5,
                          isPositive: (Number(stats.promedioCalificacion) || 0) >= 15
                        }}
                      />
                      <StatCard
                        title={t('dashboard.personalIncidents')}
                        value={stats.incidenciasPersonales || '0'}
                        icon={<AlertCircle className="h-6 w-6 md:h-7 md:w-7" />}
                        description="Incidencias reportadas"
                        valueClassName="text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300"
                        className="bg-gradient-to-br from-amber-50/80 to-amber-100/30 dark:from-amber-950/50 dark:to-amber-900/20 border-amber-200/50 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-xl transition-all duration-300 group"
                      />
                    </>
                  ) : (
                    // ... keep existing code (non-evaluated user stats)
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
              {/* Recent evaluations - Enhanced for evaluated users */}
              <div className={`space-y-6 md:space-y-8 ${isEvaluated ? 'xl:col-span-2' : 'xl:col-span-2'}`}>
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1.5 h-8 md:h-10 bg-gradient-to-b from-violet-500 to-violet-600 rounded-full shadow-sm"></div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                      {isEvaluated ? 'Mis Evaluaciones Recientes' : 'Actividad Reciente'}
                    </h2>
                    {isEvaluated && (
                      <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Últimas evaluaciones recibidas con detalles de desempeño
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-border/50 shadow-lg overflow-hidden">
                  <RecentEvaluations />
                </div>
                
                {/* Evolution Chart for evaluated users */}
                {isEvaluated && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                      <div className="w-1.5 h-8 md:h-10 bg-gradient-to-b from-green-500 to-green-600 rounded-full shadow-sm"></div>
                      <div className="flex-1">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                          Evolución de mi Desempeño
                        </h2>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">
                          Progreso de tu promedio de calificaciones a lo largo del tiempo
                        </p>
                      </div>
                    </div>
                    <div className="bg-card/80 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-border/50 shadow-lg">
                      <EvaluationsChart />
                    </div>
                  </div>
                )}
                
                {userRole === 'evaluator' && !isEvaluated && (
                  <div className="mt-6">
                    <EvaluationsChart />
                  </div>
                )}
              </div>

              {/* Performance Summary for evaluated users */}
              {isEvaluated && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full shadow-sm"></div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      Resumen de Desempeño
                    </h2>
                  </div>
                  
                  {/* Performance indicators */}
                  <div className="space-y-4">
                    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-lg">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Tasa de Aprobación
                          </span>
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.evaluacionesRecibidas > 0 
                              ? Math.round(((stats.evaluacionesAprobadas || 0) / stats.evaluacionesRecibidas) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${stats.evaluacionesRecibidas > 0 
                                ? ((stats.evaluacionesAprobadas || 0) / stats.evaluacionesRecibidas) * 100
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-lg">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Nivel de Desempeño
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`${
                              (Number(stats.promedioCalificacion) || 0) >= 18 
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : (Number(stats.promedioCalificacion) || 0) >= 15
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : (Number(stats.promedioCalificacion) || 0) >= 11
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                            }`}
                          >
                            {(Number(stats.promedioCalificacion) || 0) >= 18 
                              ? 'Excelente'
                              : (Number(stats.promedioCalificacion) || 0) >= 15
                              ? 'Muy Bueno'
                              : (Number(stats.promedioCalificacion) || 0) >= 11
                              ? 'Bueno'
                              : 'Necesita Mejorar'
                            }
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-foreground">
                            {(Number(stats.promedioCalificacion) || 0).toFixed(1)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            de 20 puntos
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
