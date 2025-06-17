
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

const EvaluationTrendsChart = () => {
  // Datos de ejemplo - tú implementarás la funcionalidad real
  const data = [
    { periodo: '2023-1', evaluaciones: 45, promedio: 13.2 },
    { periodo: '2023-2', evaluaciones: 52, promedio: 14.1 },
    { periodo: '2024-1', evaluaciones: 48, promedio: 14.8 },
    { periodo: '2024-2', evaluaciones: 55, promedio: 15.2 },
  ];

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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
          Evolución por Semestre
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tendencia de evaluaciones realizadas y promedio general por semestre
        </p>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[300px] md:h-[350px] w-full">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="periodo" 
              fontSize={12}
            />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="evaluaciones" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Evaluaciones"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="promedio" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              name="Promedio"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#8b5cf6', strokeWidth: 2 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EvaluationTrendsChart;
