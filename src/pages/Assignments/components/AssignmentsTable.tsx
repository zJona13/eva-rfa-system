
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
import { Pencil, Trash, Lock } from 'lucide-react';
import type { Assignment } from '../Index';

interface AssignmentsTableProps {
  assignments: Assignment[];
  isLoading: boolean;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: number) => void;
  onClose: (id: number) => void;
}

const AssignmentsTable = ({ 
  assignments, 
  isLoading, 
  onEdit, 
  onDelete, 
  onClose 
}: AssignmentsTableProps) => {
  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      'Activa': { variant: 'default' as const, label: 'Activa' },
      'Abierta': { variant: 'default' as const, label: 'Abierta' },
      'Cerrada': { variant: 'secondary' as const, label: 'Cerrada' },
    };

    const config = statusConfig[estado as keyof typeof statusConfig] || 
                  { variant: 'outline' as const, label: estado };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getProgress = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-muted-foreground">Cargando asignaciones...</div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay asignaciones registradas</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Fin</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Evaluaciones</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell className="font-medium">
                {assignment.periodo}
              </TableCell>
              <TableCell>{assignment.areaNombre}</TableCell>
              <TableCell>{formatDate(assignment.fechaInicio)}</TableCell>
              <TableCell>{formatDate(assignment.fechaFin)}</TableCell>
              <TableCell>{getStatusBadge(assignment.estado)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${getProgress(assignment.evaluacionesCompletadas, assignment.totalEvaluaciones)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {getProgress(assignment.evaluacionesCompletadas, assignment.totalEvaluaciones)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{assignment.evaluacionesCompletadas} / {assignment.totalEvaluaciones}</div>
                  <div className="text-muted-foreground">completadas</div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  {assignment.estado !== 'Cerrada' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(assignment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {assignment.estado === 'Abierta' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onClose(assignment.id)}
                          title="Cerrar asignación"
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(assignment.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssignmentsTable;
