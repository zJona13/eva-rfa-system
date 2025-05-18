
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, BarChart2, DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';

const Results = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resultados de Evaluaciones</h1>
          <p className="text-muted-foreground mt-2">
            Consulte los resultados consolidados de las evaluaciones realizadas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Descargar PDF')} className="gap-1">
            <DownloadIcon className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" onClick={() => toast.info('Descargar Excel')} className="gap-1">
            <DownloadIcon className="h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Autoevaluación Personal</CardTitle>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <AreaChart className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Periodo 2025-I</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">
                Gráfico de resultados de autoevaluación personal
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Evaluación por Estudiantes</CardTitle>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <BarChart2 className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Periodo 2025-I</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">
                Gráfico de resultados de evaluación por estudiantes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resumen Consolidado</CardTitle>
            <CardDescription>Resultados agregados por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium">Categoría: Pedagógico</h3>
                  <p className="text-2xl font-bold text-ies-blue-600 mt-2">85%</p>
                  <p className="text-sm text-muted-foreground">Puntuación promedio</p>
                </div>
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium">Categoría: Académico</h3>
                  <p className="text-2xl font-bold text-ies-blue-600 mt-2">92%</p>
                  <p className="text-sm text-muted-foreground">Puntuación promedio</p>
                </div>
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium">Categoría: Gestión</h3>
                  <p className="text-2xl font-bold text-ies-blue-600 mt-2">78%</p>
                  <p className="text-sm text-muted-foreground">Puntuación promedio</p>
                </div>
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium">Puntuación Global</h3>
                  <p className="text-2xl font-bold text-primary mt-2">85.4%</p>
                  <p className="text-sm text-muted-foreground">Total consolidado</p>
                </div>
              </div>
              <Button onClick={() => toast.info('Ver detalles completos')}>
                Ver informe detallado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;
