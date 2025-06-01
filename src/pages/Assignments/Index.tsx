
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import useApiWithToken from '@/hooks/useApiWithToken';
import AssignmentsTable from './components/AssignmentsTable';
import AssignmentForm from './components/AssignmentForm';

const AssignmentsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const { apiRequest } = useApiWithToken();

  // Fetch assignments
  const { data: assignmentsData, isLoading, refetch } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await apiRequest('/asignaciones');
      if (response.success) {
        return response.data.asignaciones;
      }
      throw new Error(response.error || 'Error al cargar asignaciones');
    },
  });

  // Fetch areas for the form
  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await apiRequest('/asignaciones/areas');
      if (response.success) {
        return response.data.areas;
      }
      throw new Error(response.error || 'Error al cargar áreas');
    },
  });

  const handleCreate = () => {
    setEditingAssignment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleDelete = async (assignmentId) => {
    try {
      const response = await apiRequest(`/asignaciones/${assignmentId}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        toast.success('Asignación eliminada exitosamente');
        refetch();
      } else {
        toast.error(response.error || 'Error al eliminar la asignación');
      }
    } catch (error) {
      toast.error('Error al eliminar la asignación');
    }
  };

  const handleClose = async (assignmentId) => {
    try {
      const response = await apiRequest(`/asignaciones/${assignmentId}/cerrar`, {
        method: 'PUT',
      });
      
      if (response.success) {
        toast.success('Asignación cerrada exitosamente');
        refetch();
      } else {
        toast.error(response.error || 'Error al cerrar la asignación');
      }
    } catch (error) {
      toast.error('Error al cerrar la asignación');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
    refetch();
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Asignación de Evaluaciones</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Asignación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AssignmentsTable
            assignments={assignmentsData || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={handleClose}
          />
        </CardContent>
      </Card>

      <AssignmentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        assignment={editingAssignment}
        areas={areasData || []}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default AssignmentsPage;
