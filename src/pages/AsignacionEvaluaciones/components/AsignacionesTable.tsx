
import React from 'react';
import { Edit, Trash2, Calendar, Clock, Users, BarChart3 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Asignacion {
  id: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  tipoEvaluacion: string;
  estado: string;
  descripcion?: string;
  areaNombre: string;
  areaId: number;
  totalEvaluaciones: number;
  evaluacionesCompletadas: number;
}

interface AsignacionesTableProps {
  asignaciones: Asignacion[];
  onEdit: (asignacion: Asignacion) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

const AsignacionesTable: React.FC<AsignacionesTableProps> = ({
  asignaciones,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Pendiente': 'secondary',
      'Activa': 'default',
      'Abierta': 'default',
      'Completada': 'outline',
      'Cerrada': 'outline',
      'Inactiva': 'destructive',
    };
    
    return (
      <Badge variant={variants[estado] || 'secondary'}>
        {estado}
      </Badge>
    );
  };

  const getProgreso = (completadas: number, total: number) => {
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    return porcentaje;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // Si viene en formato HH:MM:SS, tomar solo HH:MM
    return timeString.slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Cargando asignaciones...</span>
        </div>
      </div>
    );
  }

  if (asignaciones.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No hay asignaciones de evaluación registradas</p>
        <p className="text-sm">Crea una nueva asignación para programar las evaluaciones por área</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período</TableHead>
            <TableHead>Fechas</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Tipo Evaluación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {asignaciones.map((asignacion) => (
            <TableRow key={asignacion.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{asignacion.periodo}</div>
                    <div className="text-sm text-muted-foreground">Año académico</div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {formatDate(asignacion.fechaInicio)}
                    </div>
                    {asignacion.fechaInicio !== asignacion.fechaFin && (
                      <div className="text-sm text-muted-foreground">
                        hasta {formatDate(asignacion.fechaFin)}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {formatTime(asignacion.horaInicio)} - {formatTime(asignacion.horaFin)}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{asignacion.areaNombre}</div>
                    <div className="text-sm text-muted-foreground">Área académica</div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{asignacion.tipoEvaluacion}</div>
                  <div className="text-muted-foreground">3 modalidades</div>
                </div>
              </TableCell>
              
              <TableCell>
                {getEstadoBadge(asignacion.estado)}
              </TableCell>
              
              <TableCell>
                <div className="space-y-2 min-w-[120px]">
                  <div className="flex justify-between text-sm">
                    <span>Completadas:</span>
                    <span className="font-medium">
                      {asignacion.evaluacionesCompletadas} / {asignacion.totalEvaluaciones}
                    </span>
                  </div>
                  <Progress 
                    value={getProgreso(asignacion.evaluacionesCompletadas, asignacion.totalEvaluaciones)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {getProgreso(asignacion.evaluacionesCompletadas, asignacion.totalEvaluaciones)}% completado
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="max-w-xs">
                  <p className="text-sm text-muted-foreground truncate" title={asignacion.descripcion}>
                    {asignacion.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(asignacion)}
                    title="Editar asignación"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(asignacion.id)}
                    title="Eliminar asignación"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AsignacionesTable;
