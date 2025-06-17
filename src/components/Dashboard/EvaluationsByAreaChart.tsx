
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { BarChart4 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const EvaluationsByAreaChart = () => {
  const isMobile = useIsMobile();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['evaluaciones-por-area'],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch('/api/reportes/evaluaciones-por-area', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Error al obtener evaluaciones por área');
      return res.json();
    }
  });

  if (isLoading) return (
    <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-4 sm:p-6 flex items-center justify-center h-48 sm:h-64 md:h-80">
        <div className="text-sm text-muted-foreground">Cargando gráfico...</div>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-4 sm:p-6 flex items-center justify-center h-48 sm:h-64 md:h-80">
        <div className="text-sm text-red-500">Error al cargar gráfico</div>
      </CardContent>
    </Card>
  );

  const chartData = (data?.evaluaciones || []).map((row: any) => ({
    area: row.area,
    total: row.totalEvaluaciones,
    aprobadas: row.aprobadas,
    desaprobadas: row.desaprobadas
  }));

  const chartConfig = {
    total: {
      label: "Total",
      color: "#3b82f6",
    },
    aprobadas: {
      label: "Aprobadas",
      color: "#22c55e",
    },
    desaprobadas: {
      label: "Desaprobadas",
      color: "#ef4444",
    },
  };

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
          <BarChart4 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0" />
          <span className="line-clamp-1">Evaluaciones por Área</span>
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          Distribución de evaluaciones totales, aprobadas y desaprobadas por área académica
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-48 sm:h-64 md:h-80 lg:h-96 w-full">
          <BarChart 
            data={chartData} 
            margin={{ 
              top: 10, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 10 : 20, 
              bottom: isMobile ? 40 : 60 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="area" 
              fontSize={isMobile ? 10 : 12}
              angle={isMobile ? -45 : -45}
              textAnchor="end"
              height={isMobile ? 50 : 80}
              interval={0}
            />
            <YAxis fontSize={isMobile ? 10 : 12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {!isMobile && <Legend />}
            <Bar 
              dataKey="total" 
              fill="#3b82f6" 
              name="Total"
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
            <Bar 
              dataKey="aprobadas" 
              fill="#22c55e" 
              name="Aprobadas"
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
            <Bar 
              dataKey="desaprobadas" 
              fill="#ef4444" 
              name="Desaprobadas"
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EvaluationsByAreaChart;
