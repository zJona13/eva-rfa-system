
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { BarChart4 } from 'lucide-react';

const EvaluationsByAreaChart = () => {
  // Datos de ejemplo - tú implementarás la funcionalidad real
  const data = [
    { area: 'Matemáticas', total: 45, aprobadas: 38, desaprobadas: 7 },
    { area: 'Lengua', total: 52, aprobadas: 41, desaprobadas: 11 },
    { area: 'Ciencias', total: 38, aprobadas: 32, desaprobadas: 6 },
    { area: 'Historia', total: 29, aprobadas: 24, desaprobadas: 5 },
    { area: 'Inglés', total: 34, aprobadas: 28, desaprobadas: 6 },
    { area: 'Ed. Física', total: 25, aprobadas: 22, desaprobadas: 3 }
  ];

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
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
