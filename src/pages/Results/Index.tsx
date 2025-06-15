
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AreaChart, BarChart2, DownloadIcon, TrendingUp, Users, GraduationCap, UserCheck, Calendar, Award, Target } from 'lucide-react';
import { toast } from 'sonner';

const Results = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-I');
  
  // Mock data for charts
  const categoryData = [
    { name: 'Pedagógico', autoevaluacion: 85, estudiantes: 78, supervision: 82 },
    { name: 'Académico', autoevaluacion: 92, estudiantes: 89, supervision: 88 },
    { name: 'Gestión', autoevaluacion: 78, estudiantes: 74, supervision: 80 },
    { name: 'Investigación', autoevaluacion: 88, estudiantes: 85, supervision: 87 }
  ];

  const pieData = [
    { name: 'Excelente', value: 45, color: '#10B981' },
    { name: 'Bueno', value: 35, color: '#3B82F6' },
    { name: 'Regular', value: 15, color: '#F59E0B' },
    { name: 'Deficiente', value: 5, color: '#EF4444' }
  ];

  const trendData = [
    { periodo: '2023-I', score: 78 },
    { periodo: '2023-II', score: 82 },
    { periodo: '2024-I', score: 85 },
    { periodo: '2024-II', score: 83 },
    { periodo: '2025-I', score: 85.4 }
  ];

  const chartConfig = {
    autoevaluacion: {
      label: "Autoevaluación",
      color: "#8B5CF6",
    },
    estudiantes: {
      label: "Evaluación Estudiantes",
      color: "#3B82F6",
    },
    supervision: {
      label: "Evaluación Supervisión",
      color: "#10B981",
    },
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Resultados de Evaluaciones
          </h1>
          <p className="text-muted-foreground text-lg">
            Análisis consolidado del desempeño académico - Periodo {selectedPeriod}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 hover:bg-primary/5">
            <Calendar className="h-4 w-4" />
            Periodo: {selectedPeriod}
          </Button>
          <Button onClick={() => toast.info('Generando reporte PDF...')} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <DownloadIcon className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Autoevaluación</p>
                <p className="text-3xl font-bold text-purple-600">85.8%</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +2.1% vs anterior
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Progress value={85.8} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Eval. Estudiantes</p>
                <p className="text-3xl font-bold text-blue-600">81.5%</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +1.8% vs anterior
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={81.5} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Eval. Supervisión</p>
                <p className="text-3xl font-bold text-green-600">84.2%</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +3.2% vs anterior
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={84.2} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Promedio Global</p>
                <p className="text-3xl font-bold text-primary">83.8%</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Award className="h-3 w-3" />
                  Meta: 80%
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Progress value={83.8} className="mt-4 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Comparison Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Comparativo por Categorías
                </CardTitle>
                <CardDescription>Puntuaciones por tipo de evaluación</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Periodo {selectedPeriod}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="autoevaluacion" fill="var(--color-autoevaluacion)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="estudiantes" fill="var(--color-estudiantes)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="supervision" fill="var(--color-supervision)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AreaChart className="h-5 w-5 text-primary" />
                  Distribución de Resultados
                </CardTitle>
                <CardDescription>Clasificación del desempeño general</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{payload[0].name}</p>
                            <p className="text-sm text-muted-foreground">{payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolución Histórica del Desempeño
          </CardTitle>
          <CardDescription>Tendencia de puntuaciones por periodo académico</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ score: { label: "Puntuación", color: "#3B82F6" } }} className="h-[250px]">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                domain={[70, 90]}
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">Periodo: {label}</p>
                        <p className="text-sm text-muted-foreground">
                          Puntuación: {payload[0].value}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: "#3B82F6" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Detailed Summary */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Resumen Detallado por Categorías
          </CardTitle>
          <CardDescription>Análisis específico de cada área de evaluación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categoryData.map((category, index) => {
              const average = Math.round((category.autoevaluacion + category.estudiantes + category.supervision) / 3);
              const colors = ['border-l-purple-500', 'border-l-blue-500', 'border-l-green-500', 'border-l-orange-500'];
              
              return (
                <div key={category.name} className={`p-6 border rounded-lg ${colors[index]} border-l-4 bg-gradient-to-br from-background to-muted/20`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {average >= 85 ? 'Excelente' : average >= 75 ? 'Bueno' : 'Regular'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Autoevaluación</span>
                        <span className="font-medium text-purple-600">{category.autoevaluacion}%</span>
                      </div>
                      <Progress value={category.autoevaluacion} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Estudiantes</span>
                        <span className="font-medium text-blue-600">{category.estudiantes}%</span>
                      </div>
                      <Progress value={category.estudiantes} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Supervisión</span>
                        <span className="font-medium text-green-600">{category.supervision}%</span>
                      </div>
                      <Progress value={category.supervision} className="h-2" />
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Promedio</span>
                        <span className="text-xl font-bold text-primary">{average}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Análisis General</h3>
                <p className="text-muted-foreground">
                  El desempeño general muestra una tendencia positiva con un promedio de 83.8%, 
                  superando la meta institucional del 80%. Las áreas de mayor fortaleza son 
                  el componente académico y la gestión pedagógica.
                </p>
              </div>
              <Button onClick={() => toast.info('Generando informe detallado...')} className="ml-4">
                Ver Informe Completo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Results;
