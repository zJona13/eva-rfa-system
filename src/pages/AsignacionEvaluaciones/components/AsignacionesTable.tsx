
import React from 'react';
import { Edit, Trash2, Calendar, Clock, Users } from 'lucide-react';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Asignacion {
  id: number;
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
  periodo?: number;
}

interface AsignacionesTableProps {
  asignaciones: Asignacion[];
  onEdit: (asignacion: Asignacion) => void;
  onDelete: (id: number) => void;
}

const AsignacionesTable: React.FC<AsignacionesTableProps> = ({
  asignaciones,
  onEdit,
  onDelete,
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
    
    const colors: Record<string, string> = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Activa': 'bg-blue-100 text-blue-800',
      'Abierta': 'bg-green-100 text-green-800',
      'Completada': 'bg-gray-100 text-gray-800',
      'Cerrada': 'bg-gray-100 text-gray-800',
      'Inactiva': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge variant={variants[estado] || 'secondary'} className={colors[estado]}>
        {estado}
      </Badge>
    );
  };

  const getProgresoEvaluaciones = (completadas: number, total: number) => {
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {completadas} / {total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {porcentaje}% completado
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Sin fecha';
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  if (asignaciones.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="mx-auto h-16 w-16 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No hay asignaciones registradas</h3>
        <p className="text-sm">
          Crea una nueva asignación para programar las 3 evaluaciones por área
        </p>
        <p className="text-xs mt-2 text-gray-500">
          (Autoevaluación, Evaluador-Evaluado, Estudiante-Docente)
        </p>
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
            <TableHead>Progreso de Evaluaciones</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {asignaciones.map((asignacion) => (
            <TableRow key={asignacion.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="font-medium">
                  Período {asignacion.periodo || new Date().getFullYear()}
                </div>
                <div className="text-sm text-muted-foreground">
                  ID: {asignacion.id}
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
                      {asignacion.horaInicio || '08:00'} - {asignacion.horaFin || '18:00'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {asignacion.areaNombre}
                </div>
                <div className="text-sm text-muted-foreground">
                  3 tipos de evaluación
                </div>
              </TableCell>
              <TableCell>
                {getProgresoEvaluaciones(
                  asignacion.evaluacionesCompletadas || 0, 
                  asignacion.totalEvaluaciones || 0
                )}
              </TableCell>
              <TableCell>
                {getEstadoBadge(asignacion.estado)}
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
                    className="text-destructive hover:text-destructive"
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
