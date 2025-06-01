
import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import AsignacionDialog from './components/AsignacionDialog';
import AsignacionesList from './components/AsignacionesList';

interface Asignacion {
  id: number;
  periodo: number;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<Asignacion | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { apiRequest } = useApiWithToken();

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      console.log('🔄 Cargando áreas...');
      const response = await apiRequest('/areas');
      console.log('Response áreas:', response);
      
      if (response.success && response.data) {
        const areasData = response.data.areas || [];
        console.log('✅ Áreas cargadas:', areasData);
        setAreas(areasData);
      } else {
        console.error('❌ Error en respuesta de áreas:', response);
        toast.error('Error al cargar las áreas');
        setAreas([]);
      }
    } catch (error) {
      console.error('❌ Error loading areas:', error);
      toast.error('Error de conexión al cargar áreas');
      setAreas([]);
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      console.log('📝 Enviando datos de asignación:', values);
      
      const response = editingAsignacion
        ? await apiRequest(`/asignaciones/${editingAsignacion.id}`, {
            method: 'PUT',
            body: values,
          })
        : await apiRequest('/asignaciones', {
            method: 'POST',
            body: values,
          });

      console.log('📤 Respuesta del servidor:', response);

      if (response.success) {
        toast.success(response.data?.message || 'Asignación guardada exitosamente');
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        // Forzar recarga de la lista
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(response.error || 'Error al guardar la asignación');
      }
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      toast.error('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asignacion: Asignacion) => {
    console.log('✏️ Editando asignación:', asignacion);
    setEditingAsignacion(asignacion);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando asignación:', id);
      const response = await apiRequest(`/asignaciones/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        toast.success('Asignación eliminada exitosamente');
        // Forzar recarga de la lista
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error('Error al eliminar la asignación');
      }
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      toast.error('Error de conexión');
    }
  };

  const handleNewAsignacion = () => {
    setEditingAsignacion(null);
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Lista actualizada');
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={handleNewAsignacion}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Asignación
          </Button>
        </div>
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
          <AsignacionesList
            key={refreshKey}
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
