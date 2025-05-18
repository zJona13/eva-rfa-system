
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const StudentEvaluation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Evaluación del Estudiante al Docente</h1>
        <p className="text-muted-foreground mt-2">
          Evalúe a los docentes de sus asignaturas de manera anónima y confidencial.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Matemáticas II</CardTitle>
            <CardDescription>Prof. Jorge Méndez · Sección A</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.info('Evaluación iniciada')}>Evaluar Docente</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Programación Web</CardTitle>
            <CardDescription>Prof. Ana García · Sección B</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.info('Evaluación iniciada')}>Evaluar Docente</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Base de Datos</CardTitle>
            <CardDescription>Prof. Carlos Santos · Sección A</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.info('Evaluación iniciada')}>Evaluar Docente</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Desarrollo de Software</CardTitle>
            <CardDescription>Prof. María Rodríguez · Sección C</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.info('Evaluación iniciada')}>Evaluar Docente</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentEvaluation;
