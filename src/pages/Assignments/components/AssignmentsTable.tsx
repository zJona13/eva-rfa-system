
import React from 'react';
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
import { Edit, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Assignment {
  id: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  areaNombre: string;
  totalEvaluaciones: number;
  evaluacionesCompletadas: number;
}

interface AssignmentsTableProps {
  assignments: Assignment[];
  isLoading: boolean;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignmentId: number) => void;
  onClose: (assignmentId: number) => void;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({
  assignments,
  isLoading,
  onEdit,
  onDelete,
  onClose,
}) => {
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Activa':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Activa</Badge>;
      case 'Abierta':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Abierta</Badge>;
      case 'Cerrada':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Cerrada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Cargando asignaciones...</div>;
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay asignaciones disponibles
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Periodo</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Fin</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Evaluaciones</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell className="font-medium">{assignment.periodo}</TableCell>
              <TableCell>{assignment.areaNombre}</TableCell>
              <TableCell>
                {format(new Date(assignment.fechaInicio), 'dd/MM/yyyy', { locale: es })}
              </TableCell>
              <TableCell>
                {format(new Date(assignment.fechaFin), 'dd/MM/yyyy', { locale: es })}
              </TableCell>
              <TableCell>{getStatusBadge(assignment.estado)}</TableCell>
              <TableCell>{assignment.totalEvaluaciones}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {assignment.evaluacionesCompletadas}/{assignment.totalEvaluaciones}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          assignment.totalEvaluaciones > 0
                            ? (assignment.evaluacionesCompletadas / assignment.totalEvaluaciones) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  {assignment.estado !== 'Cerrada' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(assignment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {assignment.estado === 'Abierta' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onClose(assignment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
