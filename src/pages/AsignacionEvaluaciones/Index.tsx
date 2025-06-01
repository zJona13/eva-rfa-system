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
    fetchAsignaciones();
    fetchAreas();
  }, []);

  const fetchAsignaciones = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Iniciando fetchAsignaciones...');
      
      const response = await apiRequest('/asignaciones');
      console.log('📦 Response completa desde API:', response);
      console.log('📦 Tipo de response:', typeof response);
      console.log('📦 Keys de response:', Object.keys(response));
      
      if (response.success) {
        console.log('✅ Response exitosa, analizando data...');
        console.log('📦 response.data:', response.data);
        console.log('📦 Tipo de response.data:', typeof response.data);
        
        if (response.data) {
          console.log('📦 Keys de response.data:', Object.keys(response.data));
          console.log('📦 response.data.asignaciones:', response.data.asignaciones);
          
          const asignacionesData = response.data.asignaciones || [];
          console.log('📊 Asignaciones extraídas:', asignacionesData);
          console.log('📊 Cantidad de asignaciones:', asignacionesData.length);
          console.log('📊 Tipo de asignacionesData:', typeof asignacionesData);
          console.log('📊 Es array?:', Array.isArray(asignacionesData));
          
          if (Array.isArray(asignacionesData)) {
            console.log('✅ Estableciendo asignaciones en el estado...');
            setAsignaciones(asignacionesData);
            
            if (asignacionesData.length > 0) {
              toast.success(`Se cargaron ${asignacionesData.length} asignaciones`);
              console.log('🎉 Toast mostrado con éxito');
            } else {
              console.log('⚠️ Array de asignaciones está vacío');
            }
          } else {
            console.error('❌ asignacionesData no es un array:', asignacionesData);
            setAsignaciones([]);
          }
        } else {
          console.error('❌ response.data es null o undefined');
          setAsignaciones([]);
        }
      } else {
        console.error('❌ Response no exitosa:', response);
        setAsignaciones([]);
        toast.error('No se pudieron cargar las asignaciones');
      }
    } catch (error) {
      console.error('💥 Error en fetchAsignaciones:', error);
      setAsignaciones([]);
      toast.error('Error de conexión al cargar asignaciones');
    } finally {
      setIsLoading(false);
      console.log('🏁 fetchAsignaciones finalizado');
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('Iniciando fetchAreas...');
      const response = await apiRequest('/areas');
      console.log('Response areas:', response);
      
      if (response.success && response.data) {
        const areasData = response.data.areas || [];
        console.log('Áreas recibidas:', areasData);
        setAreas(areasData);
        
        if (areasData.length === 0) {
          toast.error('No hay áreas disponibles');
        }
      } else {
        console.error('Error en la respuesta de áreas:', response);
        toast.error('Error al cargar las áreas');
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast.error('Error de conexión al cargar áreas');
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      console.log('Enviando valores:', values);
      
      const response = editingAsignacion
        ? await apiRequest(`/asignaciones/${editingAsignacion.id}`, {
            method: 'PUT',
            body: values,
          })
        : await apiRequest('/asignaciones', {
            method: 'POST',
            body: values,
          });

      console.log('Response del submit:', response);

      if (response.success) {
        toast.success(response.data?.message || 'Asignación guardada exitosamente');
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        // Recargar las asignaciones para mostrar la nueva
        await fetchAsignaciones();
      } else {
        toast.error(response.error || 'Error al guardar la asignación');
      }
    } catch (error) {
      console.error('Error en submit:', error);
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

    const response = await apiRequest(`/asignaciones/${id}`, {
      method: 'DELETE',
    });

    if (response.success) {
      toast.success('Asignación eliminada exitosamente');
      fetchAsignaciones();
    } else {
      toast.error('Error al eliminar la asignación');
    }
  };

  const handleNewAsignacion = () => {
    setEditingAsignacion(null);
    setIsDialogOpen(true);
  };

  console.log('🎨 RENDER - asignaciones en estado:', asignaciones);
  console.log('🎨 RENDER - isLoading:', isLoading);
  console.log('🎨 RENDER - cantidad asignaciones:', asignaciones.length);
  console.log('🎨 RENDER - tipo de asignaciones:', typeof asignaciones);
  console.log('🎨 RENDER - es array?:', Array.isArray(asignaciones));

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
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando asignaciones...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Total de asignaciones: {asignaciones.length}
              </div>
              {asignaciones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay asignaciones registradas</p>
                  <p className="text-sm">Crea una nueva asignación para comenzar</p>
                </div>
              ) : (
                <AsignacionesTable
                  asignaciones={asignaciones}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </>
          )}
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
