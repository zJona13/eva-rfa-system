
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
    await Promise.all([fetchAsignaciones(), fetchAreas()]);
    setIsLoading(false);
  };

  const fetchAsignaciones = async () => {
    try {
      console.log('Fetching asignaciones...');
      const response = await apiRequest('/asignaciones');
      console.log('Response completa asignaciones:', response);
      
      if (response.success && response.data && response.data.asignaciones) {
        console.log('Asignaciones recibidas:', response.data.asignaciones);
        setAsignaciones(response.data.asignaciones);
      } else {
        console.error('Error en respuesta de asignaciones:', response);
        setAsignaciones([]);
        toast.error('Error al cargar las asignaciones');
      }
    } catch (error) {
      console.error('Error fetching asignaciones:', error);
      setAsignaciones([]);
      toast.error('Error de conexión al cargar asignaciones');
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('Fetching areas...');
      const response = await apiRequest('/areas');
      console.log('Response areas:', response);
      
      if (response.success && response.data && response.data.areas) {
        const areasData = response.data.areas.map((area: any) => ({
          id: area.id,
          name: area.nombre || area.name,
          description: area.descripcion || area.description
        }));
        setAreas(areasData);
      } else {
        console.error('Error en respuesta de áreas:', response);
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
        toast.success(response.message || 'Asignación guardada exitosamente');
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        fetchAsignaciones(); // Recargar asignaciones
      } else {
        toast.error(response.error || response.message || 'Error al guardar la asignación');
      }
    } catch (error) {
      console.error('Error al enviar asignación:', error);
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
              <AsignacionHistorial
                asignaciones={todasAsignaciones}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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
              <AsignacionHistorial
                asignaciones={asignacionesAbiertas}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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
              <AsignacionHistorial
                asignaciones={asignacionesCerradas}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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
