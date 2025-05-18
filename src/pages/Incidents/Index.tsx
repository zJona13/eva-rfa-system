
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Incidents = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Incidencias</h1>
          <p className="text-muted-foreground mt-2">
            Registre y haga seguimiento a incidencias del sistema o proceso evaluativo.
          </p>
        </div>
        <Button onClick={() => toast.info('Nueva incidencia')}>
          Nueva Incidencia
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle>Error en carga de evaluación</CardTitle>
                <CardDescription>Reportado: 12/05/2025 · Técnica</CardDescription>
              </div>
              <Badge className="bg-ies-warning-500">En proceso</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Al intentar guardar mi autoevaluación, el sistema muestra un error y no se registran mis respuestas.
            </p>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => toast.info('Ver detalles')}>Ver detalles</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle>Acceso denegado a módulo de resultados</CardTitle>
                <CardDescription>Reportado: 10/05/2025 · Administrativa</CardDescription>
              </div>
              <Badge variant="outline" className="bg-ies-success-50 text-ies-success-500 border-ies-success-500">
                Resuelto
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No puedo acceder al módulo de resultados aunque tengo el rol de evaluador asignado.
            </p>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => toast.info('Ver detalles')}>Ver detalles</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle>Criterio incorrecto en lista de cotejo</CardTitle>
                <CardDescription>Reportado: 08/05/2025 · Académica</CardDescription>
              </div>
              <Badge variant="destructive">Pendiente</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              El criterio #4 de la lista de cotejo para docentes contiene un error en su redacción.
            </p>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => toast.info('Ver detalles')}>Ver detalles</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Incidents;
