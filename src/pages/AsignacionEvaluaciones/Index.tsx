
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import AsignacionDialog from './components/AsignacionDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Asignacion {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  areaNombre: string;
  areaId: number;
  totalEvaluaciones: number;
  evaluacionesCompletadas: number;
  periodo: number;
}

interface Area {
  id: number;
  nombre: string;
  descripcion?: string;
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
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchAsignaciones(), fetchAreas()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAsignaciones = async () => {
    try {
      console.log('🔍 Cargando asignaciones...');
      const response = await apiRequest('/asignaciones');
      console.log('📋 Respuesta del servidor:', response);
      
      if (response.success) {
        // Extraer datos de diferentes estructuras posibles
        let data = response.data;
        
        // Si viene envuelto en otra propiedad
        if (data && data.asignaciones) {
          data = data.asignaciones;
        }
        
        // Si es un array, usarlo directamente
        if (Array.isArray(data)) {
          console.log('✅ Asignaciones encontradas:', data.length);
          setAsignaciones(data);
        } else {
          console.log('⚠️ Los datos no son un array:', data);
          setAsignaciones([]);
        }
      } else {
        console.error('❌ Error en respuesta:', response.error);
        toast.error('Error al cargar asignaciones');
        setAsignaciones([]);
      }
    } catch (error) {
      console.error('❌ Error en fetchAsignaciones:', error);
      toast.error('Error de conexión');
      setAsignaciones([]);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await apiRequest('/areas');
      
      if (response.success) {
        let data = response.data;
        
        if (data && data.areas) {
          data = data.areas;
        }
        
        if (Array.isArray(data)) {
          // Mapear para asegurar la estructura correcta
          const areasFormateadas = data.map((area: any) => ({
            id: area.id || area.idArea,
            nombre: area.nombre || area.name,
            descripcion: area.descripcion || area.description
          }));
          setAreas(areasFormateadas);
        } else {
          setAreas([]);
        }
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error('❌ Error en fetchAreas:', error);
      setAreas([]);
    }
  };

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
        toast.success('Asignación guardada exitosamente');
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        // Recargar inmediatamente después de guardar
        await fetchAsignaciones();
      } else {
        toast.error(response.error || 'Error al guardar la asignación');
      }
    } catch (error) {
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
        // Recargar inmediatamente después de eliminar
        await fetchAsignaciones();
      } else {
        toast.error('Error al eliminar la asignación');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleNewAsignacion = () => {
    setEditingAsignacion(null);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
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

  const AsignacionCard = ({ asignacion }: { asignacion: Asignacion }) => {
    const porcentajeCompletado = asignacion.totalEvaluaciones > 0 
      ? Math.round((asignacion.evaluacionesCompletadas / asignacion.totalEvaluaciones) * 100) 
      : 0;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">
                {asignacion.areaNombre}
              </CardTitle>
              <CardDescription>
                Periodo {asignacion.periodo}
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
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>08:00 - 18:00</span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>3 tipos de evaluación</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Progreso de evaluaciones</span>
              <span>{porcentajeCompletado}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${porcentajeCompletado}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{asignacion.evaluacionesCompletadas} completadas</span>
              <span>{asignacion.totalEvaluaciones} total</span>
            </div>
          </div>

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
              variant="destructive" 
              size="sm" 
              onClick={() => handleDelete(asignacion.id)}
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando asignaciones...</p>
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

      {/* Información de debug */}
      <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
        <p>Asignaciones cargadas: {asignaciones.length}</p>
        <p>Áreas disponibles: {areas.length}</p>
      </div>

      {/* Lista de asignaciones */}
      {asignaciones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay asignaciones</h3>
            <p className="text-muted-foreground text-center mb-4">
              No se han encontrado asignaciones de evaluación. Crea una nueva asignación para comenzar.
            </p>
            <Button onClick={handleNewAsignacion}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Asignación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asignaciones.map((asignacion) => (
            <AsignacionCard key={asignacion.id} asignacion={asignacion} />
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
