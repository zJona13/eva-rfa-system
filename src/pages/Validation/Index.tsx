
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const Validation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Validación de Evaluaciones</h1>
        <p className="text-muted-foreground mt-2">
          Revise y valide las evaluaciones enviadas por el personal y evaluadores.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Autoevaluaciones pendientes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Carlos Santos</CardTitle>
                <Badge>Autoevaluación</Badge>
              </div>
              <CardDescription>Docente · Departamento de Matemáticas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">Enviado: 15/05/2025</p>
                <Button onClick={() => toast.info('Revisar evaluación')}>Revisar</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>María González</CardTitle>
                <Badge>Autoevaluación</Badge>
              </div>
              <CardDescription>Docente · Departamento de Informática</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">Enviado: 14/05/2025</p>
                <Button onClick={() => toast.info('Revisar evaluación')}>Revisar</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-medium mt-6">Listas de cotejo pendientes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Ana Martínez</CardTitle>
                <Badge variant="secondary">Lista de Cotejo</Badge>
              </div>
              <CardDescription>Evaluado por: Juan Pérez · Jefe de Área</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">Enviado: 12/05/2025</p>
                <Button onClick={() => toast.info('Revisar evaluación')}>Revisar</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-medium mt-6">Validaciones recientes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Roberto Díaz</CardTitle>
                <Badge variant="outline" className="bg-ies-success-50 text-ies-success-500 border-ies-success-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Aprobado
                </Badge>
              </div>
              <CardDescription>Autoevaluación · Validado: 10/05/2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">Calificación: 87/100</p>
                <Button variant="outline" onClick={() => toast.info('Ver detalles')}>
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Laura Vega</CardTitle>
                <Badge variant="outline" className="bg-ies-danger-50 text-ies-danger-500 border-ies-danger-500">
                  <XCircle className="h-3 w-3 mr-1" /> Observado
                </Badge>
              </div>
              <CardDescription>Lista de Cotejo · Validado: 09/05/2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">Observaciones: 2</p>
                <Button variant="outline" onClick={() => toast.info('Ver detalles')}>
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Validation;
