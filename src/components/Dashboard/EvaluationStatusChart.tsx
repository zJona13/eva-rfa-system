
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const EvaluationStatusChart = () => {
  // Datos de ejemplo - tú implementarás la funcionalidad real
  const data = [
    { name: 'Completadas', value: 189, color: '#22c55e' },
    { name: 'Pendientes', value: 15, color: '#eab308' },
    { name: 'En Revisión', value: 32, color: '#3b82f6' },
    { name: 'Canceladas', value: 12, color: '#ef4444' },
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

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <PieChartIcon className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
          Estado de Evaluaciones
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Distribución del estado actual de todas las evaluaciones (Total: {total})
        </p>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[300px] md:h-[350px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={window.innerWidth < 768 ? 80 : 110}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
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
