
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Plus, Calendar, Users, Clock } from 'lucide-react';

const AssignmentEvaluations = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asignación de Evaluaciones</h1>
          <p className="text-muted-foreground">
            Administra y asigna evaluaciones a los colaboradores del instituto
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asignaciones</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              Este período
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Asignados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment List */}
      <Card>
        <CardHeader>
          <CardTitle>Asignaciones Recientes</CardTitle>
          <CardDescription>
            Lista de evaluaciones asignadas y su estado actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 1,
                evaluado: 'Dr. María González',
                evaluador: 'Lic. Carlos Ruiz',
                tipo: 'Autoevaluación',
                estado: 'Activa',
                fecha: '2024-01-15',
                progreso: 75
              },
              {
                id: 2,
                evaluado: 'Ing. José Pérez',
                evaluador: 'Dra. Ana López',
                tipo: 'Supervisión',
                estado: 'Pendiente',
                fecha: '2024-01-20',
                progreso: 0
              },
              {
                id: 3,
                evaluado: 'Lic. Sandra Torres',
                evaluador: 'Dr. Miguel Jiménez',
                tipo: 'Evaluación 360°',
                estado: 'Completada',
                fecha: '2024-01-10',
                progreso: 100
              }
            ].map((asignacion) => (
              <div key={asignacion.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{asignacion.evaluado}</h4>
                    <Badge variant="outline">{asignacion.tipo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Evaluador: {asignacion.evaluador}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fecha: {asignacion.fecha}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge 
                      variant={
                        asignacion.estado === 'Completada' ? 'default' :
                        asignacion.estado === 'Activa' ? 'secondary' : 'outline'
                      }
                    >
                      {asignacion.estado}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {asignacion.progreso}% completado
                    </p>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentEvaluations;
