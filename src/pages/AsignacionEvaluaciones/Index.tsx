
import React, { useState, useEffect } from 'react';
import { Plus, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import AsignacionDialog from './components/AsignacionDialog';
import AsignacionHistorial from './components/AsignacionHistorial';

interface Asignacion {
  id: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  fechaCreacion: string;
  areaId: number;
  areaNombre: string;
  usuarioCreador: string;
  estado: string;
  duracionDias: number;
  estadisticas: {
    totalEvaluaciones: number;
    evaluacionesCompletadas: number;
    evaluacionesPendientes: number;
    autoevaluaciones: number;
    evaluacionesEvaluador: number;
    evaluacionesEstudiante: number;
  };
  progreso: number;
}

interface AreaData {
  id: number;
  name: string;
  description?: string;
}

const AsignacionEvaluaciones = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<Asignacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroArea, setFiltroArea] = useState<string>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const { apiRequest } = useApiWithToken();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchAsignaciones(), fetchAreas()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAsignaciones = async () => {
    try {
      console.log('=== FRONTEND: Iniciando fetchAsignaciones ===');
      const response = await apiRequest('/asignaciones');
      console.log('=== FRONTEND: Respuesta completa del servidor ===', response);
      
      if (response?.success && response?.data?.asignaciones) {
        const asignacionesData = response.data.asignaciones;
        console.log('=== FRONTEND: Asignaciones recibidas ===', asignacionesData.length);
        
        if (asignacionesData.length > 0) {
          console.log('=== FRONTEND: Primera asignación recibida ===', asignacionesData[0]);
        }
        
        // Actualizar el estado
        setAsignaciones(asignacionesData);
        console.log('=== FRONTEND: Estado actualizado ===');
      } else {
        console.warn('=== FRONTEND: Respuesta sin datos válidos ===', response);
        setAsignaciones([]);
        if (response?.error) {
          toast.error(response.error);
        }
      }
    } catch (error) {
      console.error('=== FRONTEND: Error en fetchAsignaciones ===', error);
      setAsignaciones([]);
      toast.error('Error de conexión al cargar asignaciones');
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('=== FRONTEND: Obteniendo áreas ===');
      const response = await apiRequest('/areas');
      
      if (response?.success && response?.data?.areas) {
        const areasData = response.data.areas.map((area: any) => ({
          id: area.id,
          name: area.name || area.nombre,
          description: area.description || area.descripcion
        }));
        setAreas(areasData);
        console.log('=== FRONTEND: Áreas cargadas ===', areasData.length);
      } else {
        console.error('=== FRONTEND: Error cargando áreas ===', response);
        toast.error('Error al cargar las áreas');
      }
    } catch (error) {
      console.error('=== FRONTEND: Error al obtener áreas ===', error);
      toast.error('Error de conexión al cargar áreas');
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      console.log('=== FRONTEND: Enviando datos de asignación ===', values);
      const response = editingAsignacion
        ? await apiRequest(`/asignaciones/${editingAsignacion.id}`, {
            method: 'PUT',
            body: values,
          })
        : await apiRequest('/asignaciones', {
            method: 'POST',
            body: values,
          });

      console.log('=== FRONTEND: Respuesta del servidor ===', response);

      if (response?.success) {
        toast.success(response.message || 'Asignación guardada exitosamente');
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        
        // Recargar inmediatamente
        await fetchAsignaciones();
      } else {
        toast.error(response?.error || response?.message || 'Error al guardar la asignación');
      }
    } catch (error) {
      console.error('=== FRONTEND: Error al enviar asignación ===', error);
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

      if (response?.success) {
        toast.success('Asignación eliminada exitosamente');
        await fetchAsignaciones();
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

  // Filtrar asignaciones
  const asignacionesFiltradas = asignaciones.filter(asignacion => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || asignacion.estado === filtroEstado;
    const cumpleFiltroArea = filtroArea === 'todas' || asignacion.areaId.toString() === filtroArea;
    return cumpleFiltroEstado && cumpleFiltroArea;
  });

  // Agrupar asignaciones por estado
  const asignacionesAbiertas = asignacionesFiltradas.filter(a => a.estado === 'Abierta');
  const asignacionesCerradas = asignacionesFiltradas.filter(a => a.estado === 'Cerrada');
  const todasAsignaciones = asignacionesFiltradas;

  console.log('=== FRONTEND: Estado actual del componente ===');
  console.log('isLoading:', isLoading);
  console.log('Total asignaciones en estado:', asignaciones.length);
  console.log('Asignaciones sin filtrar:', asignaciones);
  console.log('Filtradas:', asignacionesFiltradas.length);
  console.log('Abiertas:', asignacionesAbiertas.length);
  console.log('Cerradas:', asignacionesCerradas.length);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando asignaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Historial de Asignaciones</h1>
          <p className="text-muted-foreground">
            Gestiona y revisa el historial completo de asignaciones de evaluación por área
          </p>
        </div>
        <Button onClick={handleNewAsignacion}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      {/* Debug info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              <strong>Debug Info:</strong>
            </p>
            <p className="text-xs text-blue-600">
              • Total asignaciones: {asignaciones.length}
            </p>
            <p className="text-xs text-blue-600">
              • Abiertas: {asignacionesAbiertas.length}
            </p>
            <p className="text-xs text-blue-600">
              • Cerradas: {asignacionesCerradas.length}
            </p>
            <p className="text-xs text-blue-600">
              • Áreas cargadas: {areas.length}
            </p>
            <p className="text-xs text-blue-600">
              • Loading: {isLoading ? 'Sí' : 'No'}
            </p>
            {asignaciones.length > 0 && (
              <div className="text-xs text-blue-600">
                <p>• Primera asignación: {asignaciones[0].areaNombre} - {asignaciones[0].estado}</p>
                <p>• Evaluaciones: {asignaciones[0].estadisticas.totalEvaluaciones}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Abierta">Abierta</SelectItem>
                  <SelectItem value="Cerrada">Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Área</label>
              <Select value={filtroArea} onValueChange={setFiltroArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las áreas</SelectItem>
                  {areas.map(area => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de asignaciones */}
      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Todas ({todasAsignaciones.length})
          </TabsTrigger>
          <TabsTrigger value="abiertas" className="flex items-center gap-2">
            Abiertas ({asignacionesAbiertas.length})
          </TabsTrigger>
          <TabsTrigger value="cerradas" className="flex items-center gap-2">
            Cerradas ({asignacionesCerradas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Asignaciones</CardTitle>
              <CardDescription>
                Historial completo de asignaciones de evaluación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todasAsignaciones.length > 0 ? (
                <AsignacionHistorial
                  asignaciones={todasAsignaciones}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay asignaciones para mostrar</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {asignaciones.length === 0 
                      ? "No se han creado asignaciones aún" 
                      : "No hay asignaciones que coincidan con los filtros"}
                  </p>
                  <Button onClick={handleNewAsignacion} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Asignación
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abiertas">
          <Card>
            <CardHeader>
              <CardTitle>Asignaciones Abiertas</CardTitle>
              <CardDescription>
                Asignaciones que están actualmente abiertas para evaluación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {asignacionesAbiertas.length > 0 ? (
                <AsignacionHistorial
                  asignaciones={asignacionesAbiertas}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay asignaciones abiertas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cerradas">
          <Card>
            <CardHeader>
              <CardTitle>Asignaciones Cerradas</CardTitle>
              <CardDescription>
                Asignaciones completadas y cerradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {asignacionesCerradas.length > 0 ? (
                <AsignacionHistorial
                  asignaciones={asignacionesCerradas}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay asignaciones cerradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
