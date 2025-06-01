
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useApiWithToken } from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import AssignmentForm from './components/AssignmentForm';
import AssignmentsTable from './components/AssignmentsTable';

export interface Assignment {
  id: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  areaId: number;
  areaNombre: string;
  totalEvaluaciones: number;
  evaluacionesCompletadas: number;
}

export interface Area {
  id: number;
  nombre: string;
  descripcion: string;
  totalDocentes: number;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const { apiRequest, isLoading } = useApiWithToken();

  const fetchAssignments = async () => {
    const response = await apiRequest('/asignaciones');
    if (response.success && response.data) {
      setAssignments(response.data.asignaciones || []);
    } else {
      toast.error('Error al cargar las asignaciones');
    }
  };

  const fetchAreas = async () => {
    const response = await apiRequest('/asignaciones/areas');
    if (response.success && response.data) {
      setAreas(response.data.areas || []);
    } else {
      toast.error('Error al cargar las áreas');
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchAreas();
  }, []);

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setShowForm(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta asignación?')) {
      return;
    }

    const response = await apiRequest(`/asignaciones/${id}`, {
      method: 'DELETE'
    });

    if (response.success) {
      toast.success('Asignación eliminada exitosamente');
      fetchAssignments();
    } else {
      toast.error(response.error || 'Error al eliminar la asignación');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAssignment(null);
    fetchAssignments();
  };

  const handleCloseAssignment = async (id: number) => {
    const response = await apiRequest(`/asignaciones/${id}/cerrar`, {
      method: 'PUT'
    });

    if (response.success) {
      toast.success('Asignación cerrada exitosamente');
      fetchAssignments();
    } else {
      toast.error(response.error || 'Error al cerrar la asignación');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Asignación de Evaluaciones
          </CardTitle>
          <Button onClick={handleCreateAssignment} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Asignación
          </Button>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <AssignmentForm
              assignment={editingAssignment}
              areas={areas}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <AssignmentsTable
              assignments={assignments}
              isLoading={isLoading}
              onEdit={handleEditAssignment}
              onDelete={handleDeleteAssignment}
              onClose={handleCloseAssignment}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Assignments;
