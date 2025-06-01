
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
    
    return (
      <Badge variant={variants[estado] || 'secondary'}>
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
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
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
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatDateRange = (fechaInicio: string, fechaFin: string) => {
    const inicio = formatDate(fechaInicio);
    const fin = formatDate(fechaFin);
    
    if (inicio === fin) {
      return inicio;
    }
    
    return `${inicio} - ${fin}`;
  };

  if (!asignaciones || asignaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No hay asignaciones registradas
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Crea una nueva asignación para programar las evaluaciones por área. 
          Cada asignación generará automáticamente los 3 tipos de evaluación.
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
            <TableHead>Horario</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-32">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {asignaciones.map((asignacion) => (
            <TableRow key={asignacion.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {formatDateRange(asignacion.fechaInicio, asignacion.fechaFin)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Período {new Date(asignacion.fechaInicio).getFullYear()}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {asignacion.horaInicio} - {asignacion.horaFin}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Horario de evaluación
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="font-medium text-blue-600">
                    {asignacion.areaNombre}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    3 tipos de evaluación
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="min-w-[120px]">
                  {getProgresoEvaluaciones(
                    asignacion.evaluacionesCompletadas || 0, 
                    asignacion.totalEvaluaciones || 0
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {getEstadoBadge(asignacion.estado)}
              </TableCell>
              
              <TableCell>
                <div className="max-w-xs">
                  <p className="text-sm text-muted-foreground truncate" title={asignacion.descripcion}>
                    {asignacion.descripcion || 'Sin descripción específica'}
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
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(asignacion.id)}
                    title="Eliminar asignación"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
