
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import AsignacionDialog from './components/AsignacionDialog';
import AsignacionesTable from './components/AsignacionesTable';
import EvaluacionesPorRol from './components/EvaluacionesPorRol';

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

interface Area {
  id: number;
  nombre: string;
  descripcion?: string;
  totalDocentes: number;
}

const AsignacionEvaluaciones = () => {
  const { user } = useAuth();
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<Asignacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { apiRequest } = useApiWithToken();

  useEffect(() => {
    fetchAsignaciones();
    fetchAreas();
  }, []);

  const fetchAsignaciones = async () => {
    try {
      const response = await apiRequest('/asignaciones');
      console.log('Respuesta asignaciones:', response);
      
      if (response.success) {
        setAsignaciones(response.data.asignaciones || []);
      } else {
        toast.error('Error al cargar las asignaciones');
      }
    } catch (error) {
      console.error('Error en fetchAsignaciones:', error);
      toast.error('Error de conexión al cargar asignaciones');
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await apiRequest('/asignaciones/areas');
      console.log('Respuesta áreas:', response);
      
      if (response.success) {
        const areasData = response.data.areas || [];
        console.log('Áreas procesadas:', areasData);
        setAreas(areasData);
      } else {
        console.error('Error en respuesta de áreas:', response);
        toast.error('Error al cargar las áreas');
      }
    } catch (error) {
      console.error('Error en fetchAreas:', error);
      toast.error('Error de conexión al cargar áreas');
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      console.log('Enviando asignación:', values);
      
      const response = editingAsignacion
        ? await apiRequest(`/asignaciones/${editingAsignacion.id}`, {
            method: 'PUT',
            body: values,
          })
        : await apiRequest('/asignaciones', {
            method: 'POST',
            body: values,
          });

      console.log('Respuesta del servidor:', response);

      if (response.success) {
        toast.success(response.data.message || 'Asignación guardada exitosamente');
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        fetchAsignaciones(); // Recargar la lista
      } else {
        console.error('Error del servidor:', response.error);
        toast.error(response.error || 'Error al guardar la asignación');
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      toast.error('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asignacion: Asignacion) => {
    setEditingAsignacion(asignacion);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    try {
      const response = await apiRequest(`/asignaciones/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        toast.success('Asignación eliminada exitosamente');
        fetchAsignaciones();
        // Si la asignación seleccionada fue eliminada, limpiar la selección
        if (selectedAsignacion?.id === id) {
          setSelectedAsignacion(null);
        }
      } else {
        toast.error('Error al eliminar la asignación');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error de conexión');
    }
  };

  const handleNewAsignacion = () => {
    setEditingAsignacion(null);
    setIsDialogOpen(true);
  };

  const handleSelectAsignacion = (asignacion: Asignacion) => {
    setSelectedAsignacion(asignacion);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Asignación de Evaluaciones por Área</h1>
          <p className="text-muted-foreground">
            Gestiona los períodos y horarios para las evaluaciones organizadas por área
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={handleNewAsignacion}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Asignación
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Asignaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Asignaciones de Evaluación</CardTitle>
            <CardDescription>
              Lista de todas las asignaciones de evaluación programadas por área. 
              Selecciona una asignación para ver las evaluaciones disponibles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AsignacionesTable
              asignaciones={asignaciones}
              onEdit={user?.role === 'admin' ? handleEdit : undefined}
              onDelete={user?.role === 'admin' ? handleDelete : undefined}
              onSelect={handleSelectAsignacion}
              selectedId={selectedAsignacion?.id}
            />
          </CardContent>
        </Card>

        {/* Panel de Evaluaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluaciones por Rol</CardTitle>
            <CardDescription>
              {selectedAsignacion 
                ? `Evaluaciones disponibles para el área: ${selectedAsignacion.areaNombre}`
                : 'Selecciona una asignación para ver las evaluaciones disponibles'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EvaluacionesPorRol 
              areaId={selectedAsignacion?.areaId}
              asignacionId={selectedAsignacion?.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialog para crear/editar asignaciones - Solo para administradores */}
      {user?.role === 'admin' && (
        <AsignacionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          asignacionData={editingAsignacion}
          areas={areas}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default AsignacionEvaluaciones;
