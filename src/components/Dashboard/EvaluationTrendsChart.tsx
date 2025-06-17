
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const EvaluationTrendsChart = () => {
  const isMobile = useIsMobile();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['evaluaciones-por-semestre'],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch('/api/reportes/evaluaciones-por-semestre', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Error al obtener tendencias de evaluaciones');
      return res.json();
    }
  });

  if (isLoading) return (
    <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-4 sm:p-6 flex items-center justify-center h-48 sm:h-64 md:h-80">
        <div className="text-sm text-muted-foreground">Cargando gráfico...</div>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-4 sm:p-6 flex items-center justify-center h-48 sm:h-64 md:h-80">
        <div className="text-sm text-red-500">Error al cargar gráfico</div>
      </CardContent>
    </Card>
  );

  const chartData = (data?.evaluaciones || []).map((row: any) => ({
    periodo: row.periodo,
    evaluaciones: row.totalEvaluaciones,
    promedio: row.promedioGeneral
  }));

  const chartConfig = {
    evaluaciones: {
      label: "Evaluaciones",
      color: "#3b82f6",
    },
    promedio: {
      label: "Promedio",
      color: "#8b5cf6",
    },
  };

  return (
    <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0" />
          <span className="line-clamp-1">Evolución por Semestre</span>
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          Tendencia de evaluaciones realizadas y promedio general por semestre
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-48 sm:h-64 md:h-80 lg:h-96 w-full">
          <LineChart 
            data={chartData} 
            margin={{ 
              top: 10, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 10 : 20, 
              bottom: 10 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="periodo" 
              fontSize={isMobile ? 10 : 12}
            />
            <YAxis yAxisId="left" fontSize={isMobile ? 10 : 12} />
            <YAxis yAxisId="right" orientation="right" fontSize={isMobile ? 10 : 12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {!isMobile && <Legend />}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="evaluaciones" 
              stroke="#3b82f6" 
              strokeWidth={isMobile ? 2 : 3}
              name="Evaluaciones"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: isMobile ? 4 : 6 }}
              activeDot={{ r: isMobile ? 6 : 8, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="promedio" 
              stroke="#8b5cf6" 
              strokeWidth={isMobile ? 2 : 3}
              name="Promedio"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: isMobile ? 4 : 6 }}
              activeDot={{ r: isMobile ? 6 : 8, stroke: '#8b5cf6', strokeWidth: 2 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EvaluationTrendsChart;
