import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { BarChart4 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '@/contexts/AuthContext';

const EvaluationsByAreaChart = () => {
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

  if (isLoading) return <div className="p-6">Cargando gráfico...</div>;
  if (error) return <div className="p-6 text-red-500">Error al cargar gráfico</div>;

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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <BarChart4 className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
          Evaluaciones por Área
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Distribución de evaluaciones totales, aprobadas y desaprobadas por área académica
        </p>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[300px] md:h-[400px] w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="area" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
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
