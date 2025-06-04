
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useApiWithToken } from '@/hooks/useApiWithToken';
import AssignmentDialog from './components/AssignmentDialog';

interface Assignment {
  id: number;
  title: string;
  description: string;
  evaluationType: string;
  startDate: string;
  endDate: string;
  assignedUsers: number;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

const AssignmentEvaluations = () => {
  const queryClient = useQueryClient();
  const { apiRequest } = useApiWithToken();
  const [showDialog, setShowDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Fetch assignments
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => apiRequest('/assignments'),
  });

  const assignments = assignmentsData?.data?.assignments || [];

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/assignments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Asignación eliminada exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar la asignación');
    },
  });

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asignación de Evaluaciones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las asignaciones de evaluaciones a usuarios del sistema.
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Asignación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Asignaciones Activas
          </CardTitle>
          <CardDescription>
            Lista de todas las asignaciones de evaluaciones en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay asignaciones creadas aún.</p>
              <Button className="mt-4" onClick={() => setShowDialog(true)}>
                Crear Primera Asignación
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment: Assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{assignment.title}</h3>
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusText(assignment.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {assignment.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Tipo: {assignment.evaluationType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(assignment.startDate).toLocaleDateString()} - {' '}
                            {new Date(assignment.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{assignment.assignedUsers} usuarios asignados</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(assignment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(assignment.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showDialog && (
        <AssignmentDialog
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
              setEditingAssignment(null);
            }
          }}
          assignment={editingAssignment}
        />
      )}
    </div>
  );
};

export default AssignmentEvaluations;
