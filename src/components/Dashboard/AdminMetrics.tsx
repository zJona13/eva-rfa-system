import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart4, AlertTriangle, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';

const AdminMetrics = () => {
  // Datos de ejemplo - tú implementarás la funcionalidad real
  const metrics = {
    totalEvaluaciones: 248,
    evaluacionesPendientes: 15,
    evaluacionesAprobadas: 189,
    evaluacionesDesaprobadas: 44,
    promedioGeneral: 14.2,
    incidenciasActivas: 8
  };

  const MetricCard = ({ title, value, icon, color, trend }: any) => (
    <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 md:p-3 rounded-xl bg-${color}-50 dark:bg-${color}-950/50 border border-${color}-200 dark:border-${color}-800 group-hover:scale-105 transition-transform duration-300`}>
              <div className={`text-${color}-600 dark:text-${color}-400`}>
                {icon}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 
                ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 md:h-8 bg-blue-600 rounded-full"></div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Métricas Principales</h2>
        <BarChart4 className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
      </div>
      
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <MetricCard
          title="Total Evaluaciones"
          value={metrics.totalEvaluaciones}
          icon={<BarChart4 className="h-6 w-6 md:h-7 md:w-7" />}
          color="blue"
          trend={12}
        />
        <MetricCard
          title="Pendientes"
          value={metrics.evaluacionesPendientes}
          icon={<AlertTriangle className="h-6 w-6 md:h-7 md:w-7" />}
          color="amber"
          trend={-5}
        />
        <MetricCard
          title="Aprobadas"
          value={metrics.evaluacionesAprobadas}
          icon={<CheckCircle className="h-6 w-6 md:h-7 md:w-7" />}
          color="green"
          trend={8}
        />
        <MetricCard
          title="Desaprobadas"
          value={metrics.evaluacionesDesaprobadas}
          icon={<XCircle className="h-6 w-6 md:h-7 md:w-7" />}
          color="red"
          trend={-3}
        />
        <MetricCard
          title="Promedio General"
          value={`${metrics.promedioGeneral}/20`}
          icon={<TrendingUp className="h-6 w-6 md:h-7 md:w-7" />}
          color="purple"
          trend={2}
        />
        <MetricCard
          title="Incidencias Activas"
          value={metrics.incidenciasActivas}
          icon={<Users className="h-6 w-6 md:h-7 md:w-7" />}
          color="orange"
          trend={-15}
        />
      </div>
    </div>
  );
};

export default AdminMetrics;
