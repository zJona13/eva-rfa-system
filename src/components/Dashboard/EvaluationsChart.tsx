import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BarChart4 } from 'lucide-react';
import { getToken } from '@/contexts/AuthContext';

const EvaluationsChart = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-evaluations-chart'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch('/dashboard/evaluations-chart', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      return response.json();
    },
  });

  const chartData = data?.chartData || [
    { name: 'Completadas', value: 0, color: '#22c55e' },
    { name: 'Pendientes', value: 0, color: '#eab308' },
    { name: 'En Revisión', value: 0, color: '#3b82f6' },
    { name: 'Canceladas', value: 0, color: '#ef4444' },
  ];

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5" />
            Estado de Evaluaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5" />
            Estado de Evaluaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error al cargar los datos del gráfico</p>
        </CardContent>
      </Card>
    );
  }

  const totalEvaluations = chartData.reduce((acc: number, item: any) => acc + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart4 className="h-5 w-5" />
          Estado de Evaluaciones
        </CardTitle>
        <CardDescription>
          Distribución del estado de las evaluaciones (Total: {totalEvaluations})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ name, percent }) => 
                percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
              }
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item: any) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluationsChart;
