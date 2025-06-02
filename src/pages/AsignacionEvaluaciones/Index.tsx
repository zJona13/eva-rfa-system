
import React, { useState } from 'react';
import { Plus, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import AsignacionDialog from './components/AsignacionDialog';
import AsignacionHistorial from './components/AsignacionHistorial';
import { useAsignaciones, AsignacionData } from '@/hooks/useAsignaciones';

const AsignacionEvaluaciones = () => {
  const { asignaciones, areas, isLoading, refetchAsignaciones } = useAsignaciones();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<AsignacionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroArea, setFiltroArea] = useState<string>('todas');
  const { apiRequest } = useApiWithToken();

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      const response = editingAsignacion
        ? await apiRequest(`/asignaciones/${editingAsignacion.id}`, {
            method: 'PUT',
            body: values,
          })
        : await apiRequest('/asignaciones', {
            method: 'POST',
            body: values,
          });

      if (response.success) {
        toast.success(response.data?.message || 'Asignación guardada exitosamente');
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        refetchAsignaciones();
      } else {
        toast.error(response.error || 'Error al guardar la asignación');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asignacion: AsignacionData) => {
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
      refetchAsignaciones();
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
  const asignacionesActivas = asignacionesFiltradas.filter(a => a.estado === 'Abierta');
  const asignacionesCerradas = asignacionesFiltradas.filter(a => a.estado === 'Cerrada');
  const todasAsignaciones = asignacionesFiltradas;

  console.log('🎯 Estado actual del componente:');
  console.log('- Total asignaciones:', asignaciones.length);
  console.log('- Asignaciones filtradas:', asignacionesFiltradas.length);
  console.log('- Loading:', isLoading);

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
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Total asignaciones: {asignaciones.length}</p>
        <p>Total áreas: {areas.length}</p>
        <p>Filtro estado: {filtroEstado}</p>
        <p>Filtro área: {filtroArea}</p>
        <p>Loading: {isLoading ? 'Sí' : 'No'}</p>
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
                  <SelectItem value="Activa">Activa</SelectItem>
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

      {/* Mostrar loading o contenido */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Cargando asignaciones...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="todas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todas" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Todas ({todasAsignaciones.length})
            </TabsTrigger>
            <TabsTrigger value="activas" className="flex items-center gap-2">
              Activas ({asignacionesActivas.length})
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

          <TabsContent value="activas">
            <Card>
              <CardHeader>
                <CardTitle>Asignaciones Activas</CardTitle>
                <CardDescription>
                  Asignaciones que están actualmente abiertas para evaluación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AsignacionHistorial
                  asignaciones={asignacionesActivas}
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
      )}

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
