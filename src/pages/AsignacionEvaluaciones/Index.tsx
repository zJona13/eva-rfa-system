
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import AsignacionDialog from './components/AsignacionDialog';
import AsignacionesTable from './components/AsignacionesTable';

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
  name: string;
  description?: string;
}

const AsignacionEvaluaciones = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<Asignacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { apiRequest } = useApiWithToken();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchAsignaciones(), fetchAreas()]);
    setIsLoading(false);
  };

  const fetchAsignaciones = async () => {
    try {
      console.log('Obteniendo asignaciones...');
      const response = await apiRequest('/asignaciones');
      console.log('Respuesta asignaciones:', response);
      
      if (response.success && response.data) {
        const asignacionesData = response.data.asignaciones || [];
        console.log('Asignaciones recibidas:', asignacionesData);
        setAsignaciones(asignacionesData);
      } else {
        console.error('Error en respuesta de asignaciones:', response);
        toast.error('Error al cargar las asignaciones');
        setAsignaciones([]);
      }
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      toast.error('Error de conexión al cargar asignaciones');
      setAsignaciones([]);
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('Obteniendo áreas...');
      const response = await apiRequest('/areas');
      console.log('Respuesta áreas:', response);
      
      if (response.success && response.data) {
        const areasData = response.data.areas || [];
        console.log('Áreas recibidas:', areasData);
        setAreas(areasData);
        
        if (areasData.length === 0) {
          toast.error('No hay áreas disponibles');
        }
      } else {
        console.error('Error en respuesta de áreas:', response);
        toast.error('Error al cargar las áreas');
        setAreas([]);
      }
    } catch (error) {
      console.error('Error al obtener áreas:', error);
      toast.error('Error de conexión al cargar áreas');
      setAreas([]);
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      console.log('Enviando datos de asignación:', values);
      
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
        const message = editingAsignacion 
          ? 'Asignación actualizada exitosamente'
          : 'Asignación creada exitosamente';
        
        toast.success(response.data?.message || message);
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        
        // Recargar las asignaciones después de crear/editar
        await fetchAsignaciones();
      } else {
        console.error('Error en la respuesta:', response);
        toast.error(response.error || 'Error al guardar la asignación');
      }
    } catch (error) {
      console.error('Error al enviar asignación:', error);
      toast.error('Error de conexión al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asignacion: Asignacion) => {
    console.log('Editando asignación:', asignacion);
    setEditingAsignacion(asignacion);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    try {
      console.log('Eliminando asignación ID:', id);
      const response = await apiRequest(`/asignaciones/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        toast.success('Asignación eliminada exitosamente');
        await fetchAsignaciones();
      } else {
        console.error('Error al eliminar:', response);
        toast.error(response.error || 'Error al eliminar la asignación');
      }
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      toast.error('Error de conexión al eliminar');
    }
  };

  const handleNewAsignacion = () => {
    setEditingAsignacion(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando asignaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Asignación de Evaluaciones por Área</h1>
          <p className="text-muted-foreground">
            Gestiona los períodos y horarios para las evaluaciones organizadas por área
          </p>
        </div>
        <Button onClick={handleNewAsignacion}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asignaciones de Evaluación</CardTitle>
          <CardDescription>
            Lista de todas las asignaciones de evaluación programadas por área. 
            Cada asignación crea automáticamente autoevaluaciones, evaluaciones evaluador-evaluado y evaluaciones estudiante-docente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AsignacionesTable
            asignaciones={asignaciones}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <AsignacionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        asignacionData={editingAsignacion}
        areas={areas}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AsignacionEvaluaciones;
