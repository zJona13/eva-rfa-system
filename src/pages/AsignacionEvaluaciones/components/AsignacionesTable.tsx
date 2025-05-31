
import React from 'react';
import { Edit, Trash2, Calendar, Clock } from 'lucide-react';
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
  evaluadorNombre: string;
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
      'Activa': 'default',
      'Inactiva': 'secondary',
      'Completada': 'outline',
    };
    
    return (
      <Badge variant={variants[estado] || 'secondary'}>
        {estado}
      </Badge>
    );
  };

  const getTipoEvaluacionBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      'Checklist': 'bg-blue-100 text-blue-800',
      'Estudiante': 'bg-green-100 text-green-800',
      'Autoevaluacion': 'bg-purple-100 text-purple-800',
      'Supervision': 'bg-orange-100 text-orange-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tipo] || 'bg-gray-100 text-gray-800'}`}>
        {tipo}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  if (asignaciones.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No hay asignaciones de evaluación registradas</p>
        <p className="text-sm">Crea una nueva asignación para comenzar</p>
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
            <TableHead>Tipo</TableHead>
            <TableHead>Evaluador</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {asignaciones.map((asignacion) => (
            <TableRow key={asignacion.id}>
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
                      {asignacion.horaInicio} - {asignacion.horaFin}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getTipoEvaluacionBadge(asignacion.tipoEvaluacion)}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {asignacion.evaluadorNombre}
                </div>
              </TableCell>
              <TableCell>
                {getEstadoBadge(asignacion.estado)}
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="text-sm text-muted-foreground truncate">
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
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(asignacion.id)}
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
