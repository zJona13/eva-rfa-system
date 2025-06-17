
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const EvaluationStatusChart = () => {
  const isMobile = useIsMobile();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['evaluation-status-chart'],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch('/api/dashboard/evaluations-chart', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Error al obtener estados de evaluaciones');
      return res.json();
    }
  });

  if (isLoading) return (
    <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-4 sm:p-6 flex items-center justify-center h-48 sm:h-64 md:h-80">
        <div className="text-sm text-muted-foreground">Cargando gráfico...</div>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-4 sm:p-6 flex items-center justify-center h-48 sm:h-64 md:h-80">
        <div className="text-sm text-red-500">Error al cargar gráfico</div>
      </CardContent>
    </Card>
  );

  const chartData = data?.chartData || [];
  const total = chartData.reduce((sum: number, item: any) => sum + item.value, 0);

  const chartConfig = {
    completadas: {
      label: "Completadas",
      color: "#22c55e",
    },
    pendientes: {
      label: "Pendientes", 
      color: "#eab308",
    },
    revision: {
      label: "En Revisión",
      color: "#3b82f6",
    },
    canceladas: {
      label: "Canceladas",
      color: "#ef4444",
    },
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
          <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600 flex-shrink-0" />
          <span className="line-clamp-1">Estado de Evaluaciones</span>
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          Distribución del estado actual de todas las evaluaciones (Total: {total})
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-48 sm:h-64 md:h-80 lg:h-96 w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={!isMobile ? renderCustomizedLabel : false}
              outerRadius={isMobile ? 60 : 80}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              height={36}
              fontSize={isMobile ? 12 : 14}
              formatter={(value, entry: any) => (
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  {value}: {entry.payload.value}
                </span>
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EvaluationStatusChart;
