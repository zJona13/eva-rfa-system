
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
  nombre: string;
  descripcion?: string;
  totalDocentes: number;
}

const AsignacionEvaluaciones = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<Asignacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { apiRequest } = useApiWithToken();

  useEffect(() => {
    fetchAsignaciones();
    fetchAreas();
  }, []);

  const fetchAsignaciones = async () => {
    console.log('🔄 Obteniendo asignaciones...');
    const response = await apiRequest('/asignaciones');
    if (response.success) {
      console.log('✅ Asignaciones obtenidas:', response.data.asignaciones);
      setAsignaciones(response.data.asignaciones || []);
    } else {
      console.error('❌ Error al obtener asignaciones:', response.error);
      toast.error('Error al cargar las asignaciones');
    }
  };

  const fetchAreas = async () => {
    console.log('🔄 Obteniendo áreas...');
    const response = await apiRequest('/asignaciones/areas');
    if (response.success) {
      console.log('✅ Áreas obtenidas:', response.data.areas);
      setAreas(response.data.areas || []);
    } else {
      console.error('❌ Error al obtener áreas:', response.error);
      toast.error('Error al cargar las áreas');
    }
  };

  const handleSubmit = async (values: any) => {
    console.log('🚀 Iniciando handleSubmit en Index con valores:', values);
    setIsSubmitting(true);
    
    try {
      console.log('📤 Enviando petición API...');
      const response = editingAsignacion
        ? await apiRequest(`/asignaciones/${editingAsignacion.id}`, {
            method: 'PUT',
            body: values,
          })
        : await apiRequest('/asignaciones', {
            method: 'POST',
            body: values,
          });

      console.log('📥 Respuesta del servidor:', response);

      if (response.success) {
        console.log('✅ Asignación guardada exitosamente');
        toast.success(response.data.message || 'Asignación guardada exitosamente');
        
        // Cerrar el diálogo y limpiar estado solo si fue exitoso
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        
        // Recargar las asignaciones
        await fetchAsignaciones();
      } else {
        console.error('❌ Error del servidor:', response.error);
        toast.error(response.error || 'Error al guardar la asignación');
        // NO cerrar el diálogo en caso de error
      }
    } catch (error) {
      console.error('❌ Error de conexión en handleSubmit:', error);
      toast.error('Error de conexión con el servidor');
      // NO cerrar el diálogo en caso de error
    } finally {
      console.log('🏁 Finalizando handleSubmit, estableciendo isSubmitting a false');
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

    console.log('🗑️ Eliminando asignación:', id);
    const response = await apiRequest(`/asignaciones/${id}`, {
      method: 'DELETE',
    });

    if (response.success) {
      console.log('✅ Asignación eliminada');
      toast.success('Asignación eliminada exitosamente');
      fetchAsignaciones();
    } else {
      console.error('❌ Error al eliminar:', response.error);
      toast.error('Error al eliminar la asignación');
    }
  };

  const handleNewAsignacion = () => {
    console.log('➕ Creando nueva asignación');
    setEditingAsignacion(null);
    setIsDialogOpen(true);
  };

  console.log('🎨 Renderizando AsignacionEvaluaciones, isDialogOpen:', isDialogOpen, 'isSubmitting:', isSubmitting);

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
        onOpenChange={(open) => {
          console.log('🔄 Cambiando estado del diálogo a:', open);
          setIsDialogOpen(open);
          if (!open) {
            setEditingAsignacion(null);
          }
        }}
        asignacionData={editingAsignacion}
        areas={areas}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AsignacionEvaluaciones;
