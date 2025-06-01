
import React from 'react';
import { Edit, Trash2, Calendar, Users, CheckCircle } from 'lucide-react';
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
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  areaNombre: string;
  areaId: number;
  estado: string;
  totalEvaluaciones: number;
  evaluacionesCompletadas: number;
}

interface AsignacionesTableProps {
  asignaciones: Asignacion[];
  onEdit: (asignacion: Asignacion) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

const AsignacionesTable: React.FC<AsignacionesTableProps> = ({
  asignaciones,
  onEdit,
  onDelete,
  isLoading,
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getProgresoPercentage = (completadas: number, total: number) => {
    return total > 0 ? Math.round((completadas / total) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando asignaciones...</p>
      </div>
    );
  }

  if (asignaciones.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-semibold mb-2">No hay asignaciones registradas</p>
        <p className="text-sm">Crea una nueva asignación para comenzar</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Fin</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Evaluaciones</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {asignaciones.map((asignacion) => (
            <TableRow key={asignacion.id}>
              <TableCell className="font-medium">
                #{asignacion.id}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{asignacion.periodo}</span>
                </div>
              </TableCell>
              <TableCell>
                {formatDate(asignacion.fechaInicio)}
              </TableCell>
              <TableCell>
                {formatDate(asignacion.fechaFin)}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {asignacion.areaNombre}
                </div>
              </TableCell>
              <TableCell>
                {getEstadoBadge(asignacion.estado)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{asignacion.totalEvaluaciones}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">
                      {asignacion.evaluacionesCompletadas} / {asignacion.totalEvaluaciones}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getProgresoPercentage(asignacion.evaluacionesCompletadas, asignacion.totalEvaluaciones)}% completado
                    </div>
                  </div>
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
