
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useApiWithToken from '@/hooks/useApiWithToken';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AsignacionDialog from './components/AsignacionDialog';

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
  periodo: number;
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
  const { apiRequest, isAuthenticated } = useApiWithToken();
  const { user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    } else {
      setIsLoading(false);
      toast.error('Necesitas iniciar sesión para acceder a esta página');
    }
  }, [isAuthenticated, user]);

  const loadInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchAsignaciones(), fetchAreas()]);
    setIsLoading(false);
  };

  const fetchAsignaciones = async () => {
    try {
      console.log('🔄 Obteniendo asignaciones...');
      const response = await apiRequest('/asignaciones');
      console.log('📋 Respuesta asignaciones:', response);
      
      if (response.success && response.data) {
        const asignacionesData = response.data.asignaciones || [];
        console.log('✅ Asignaciones recibidas:', asignacionesData.length);
        setAsignaciones(asignacionesData);
      } else {
        console.error('❌ Error en respuesta de asignaciones:', response.error);
        if (response.error !== 'TOKEN_EXPIRED' && response.error !== 'NO_TOKEN') {
          toast.error('Error al cargar las asignaciones');
        }
        setAsignaciones([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener asignaciones:', error);
      toast.error('Error de conexión al cargar asignaciones');
      setAsignaciones([]);
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('🔄 Obteniendo áreas...');
      const response = await apiRequest('/areas');
      console.log('🏢 Respuesta áreas:', response);
      
      if (response.success && response.data) {
        const areasData = response.data.areas || [];
        console.log('✅ Áreas recibidas:', areasData.length);
        setAreas(areasData);
        
        if (areasData.length === 0) {
          toast.error('No hay áreas disponibles para crear asignaciones');
        }
      } else {
        console.error('❌ Error en respuesta de áreas:', response.error);
        if (response.error !== 'TOKEN_EXPIRED' && response.error !== 'NO_TOKEN') {
          toast.error('Error al cargar las áreas');
        }
        setAreas([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener áreas:', error);
      toast.error('Error de conexión al cargar áreas');
      setAreas([]);
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      console.log('💾 Enviando datos de asignación:', values);
      
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
        const message = editingAsignacion 
          ? 'Asignación actualizada exitosamente'
          : 'Asignación creada exitosamente';
        
        toast.success(response.data?.message || message);
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        
        // Recargar las asignaciones después de crear/editar
        await fetchAsignaciones();
      } else {
        console.error('❌ Error en la respuesta:', response.error);
        if (response.error !== 'TOKEN_EXPIRED' && response.error !== 'NO_TOKEN') {
          toast.error(response.error || 'Error al guardar la asignación');
        }
      }
    } catch (error) {
      console.error('❌ Error al enviar asignación:', error);
      toast.error('Error de conexión al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asignacion: Asignacion) => {
    console.log('✏️ Editando asignación:', asignacion.id);
    setEditingAsignacion(asignacion);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando asignación ID:', id);
      const response = await apiRequest(`/asignaciones/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        toast.success('Asignación eliminada exitosamente');
        await fetchAsignaciones();
      } else {
        console.error('❌ Error al eliminar:', response.error);
        if (response.error !== 'TOKEN_EXPIRED' && response.error !== 'NO_TOKEN') {
          toast.error(response.error || 'Error al eliminar la asignación');
        }
      }
    } catch (error) {
      console.error('❌ Error al eliminar asignación:', error);
      toast.error('Error de conexión al eliminar');
    }
  };

  const handleNewAsignacion = () => {
    setEditingAsignacion(null);
    setIsDialogOpen(true);
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Pendiente': 'secondary',
      'Activa': 'default',
      'Abierta': 'default',
      'Completada': 'outline',
      'Cerrada': 'outline',
      'Inactiva': 'destructive',
    };
    
    return (
      <Badge variant={variants[estado] || 'secondary'}>
        {estado}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Acceso Restringido
            </h3>
            <p className="text-sm text-muted-foreground">
              Necesitas iniciar sesión para acceder a esta página
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Asignación de Evaluaciones</h1>
          <p className="text-muted-foreground">
            Gestiona los períodos de evaluación organizados por área
          </p>
        </div>
        <Button onClick={handleNewAsignacion}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      {/* Cards view instead of table */}
      {asignaciones.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay asignaciones registradas
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Crea una nueva asignación para programar las evaluaciones por área.
              </p>
              <Button onClick={handleNewAsignacion} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Asignación
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {asignaciones.map((asignacion) => (
            <Card key={asignacion.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-blue-600">
                      {asignacion.areaNombre}
                    </CardTitle>
                    <CardDescription>
                      Período {asignacion.periodo || new Date(asignacion.fechaInicio).getFullYear()}
                    </CardDescription>
                  </div>
                  {getEstadoBadge(asignacion.estado)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(asignacion.fechaInicio)} - {formatDate(asignacion.fechaFin)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {asignacion.evaluacionesCompletadas || 0} / {asignacion.totalEvaluaciones || 0} evaluaciones
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>
                      {asignacion.totalEvaluaciones > 0 
                        ? Math.round(((asignacion.evaluacionesCompletadas || 0) / asignacion.totalEvaluaciones) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${asignacion.totalEvaluaciones > 0 
                          ? ((asignacion.evaluacionesCompletadas || 0) / asignacion.totalEvaluaciones) * 100
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {asignacion.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {asignacion.descripcion}
                  </p>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(asignacion)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(asignacion.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
