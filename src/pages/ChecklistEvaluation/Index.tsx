
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const ChecklistEvaluation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calificación mediante Lista de Cotejo</h1>
        <p className="text-muted-foreground mt-2">
          Evalúe al personal utilizando listas de cotejo con criterios predefinidos.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Personal pendiente de evaluación</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Carlos Santos</CardTitle>
              <CardDescription>Docente · Departamento de Matemáticas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => toast.info('Iniciar evaluación')}>Evaluar</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>María González</CardTitle>
              <CardDescription>Docente · Departamento de Informática</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => toast.info('Iniciar evaluación')}>Evaluar</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Juan Pérez</CardTitle>
              <CardDescription>Administrativo · Biblioteca</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => toast.info('Iniciar evaluación')}>Evaluar</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-medium mb-4">Evaluaciones completadas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Ana Martínez</CardTitle>
                <CardDescription>Docente · Departamento de Ciencias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Calificación: 92/100</p>
                    <p className="text-xs text-muted-foreground">Completado: 10/05/2025</p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info('Ver evaluación')}>
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Roberto Díaz</CardTitle>
                <CardDescription>Docente · Departamento de Humanidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Calificación: 87/100</p>
                    <p className="text-xs text-muted-foreground">Completado: 08/05/2025</p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info('Ver evaluación')}>
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistEvaluation;
