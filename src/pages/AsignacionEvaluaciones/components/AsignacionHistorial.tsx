import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AsignacionHistorial {
  id: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  areaId: number;
  areaNombre: string;
  usuarioCreador: string;
  estado: string;
  duracionDias: number;
  estadisticas: {
    totalEvaluaciones: number;
    evaluacionesCompletadas: number;
    evaluacionesPendientes: number;
    autoevaluaciones: number;
    evaluacionesEvaluador: number;
    evaluacionesEstudiante: number;
  };
  progreso: number;
}

interface AsignacionHistorialProps {
  asignaciones: AsignacionHistorial[];
  onEdit?: (asignacion: AsignacionHistorial) => void;
  onDelete?: (id: number) => void;
}

const AsignacionHistorial: React.FC<AsignacionHistorialProps> = ({
  asignaciones,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (asignaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground mb-2">No hay asignaciones</h3>
        <p className="text-muted-foreground">No se encontraron asignaciones en el historial</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {asignaciones.map((asignacion) => (
        <Card key={asignacion.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{asignacion.areaNombre}</h3>
                <p className="text-sm text-muted-foreground">
                  Periodo: {asignacion.periodo}
                </p>
              </div>
              <Badge variant={asignacion.estado === 'Abierta' ? 'default' : 'secondary'}>
                {asignacion.estado}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                <p className="font-medium text-foreground">{formatDate(asignacion.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Fin</p>
                <p className="font-medium text-foreground">{formatDate(asignacion.fechaFin)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso de Evaluaciones</span>
                <span className="text-foreground">{asignacion.progreso}%</span>
              </div>
              <Progress value={asignacion.progreso} className="h-2" />
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Evaluaciones</p>
                <p className="font-medium text-foreground">{asignacion.estadisticas.totalEvaluaciones}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="font-medium text-foreground">{asignacion.estadisticas.evaluacionesCompletadas}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="font-medium text-foreground">{asignacion.estadisticas.evaluacionesPendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AsignacionHistorial;
