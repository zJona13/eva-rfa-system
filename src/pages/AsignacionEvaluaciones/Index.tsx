
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

interface AreaData {
  id: number;
  nombre: string;
  descripcion?: string;
}

// Interface que espera el AsignacionDialog
interface Area {
  id: number;
  name: string;
  descripcion?: string;
}

const AsignacionEvaluaciones = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areasData, setAreasData] = useState<AreaData[]>([]);
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
      console.log('📋 Respuesta asignaciones:', response);
      
      if (response.success && response.data) {
        let asignacionesData = response.data;
        
        // Manejar diferentes estructuras de respuesta
        if (response.data.asignaciones) {
          asignacionesData = response.data.asignaciones;
        }
        
        if (Array.isArray(asignacionesData)) {
          console.log('✅ Asignaciones cargadas:', asignacionesData.length);
          setAsignaciones(asignacionesData);
        } else {
          console.log('⚠️ Datos no son array:', asignacionesData);
          setAsignaciones([]);
        }
      } else {
        console.log('❌ Error en respuesta o sin datos');
        setAsignaciones([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar asignaciones:', error);
      setAsignaciones([]);
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('🔍 Cargando áreas...');
      const response = await apiRequest('/areas');
      console.log('🏢 Respuesta áreas:', response);
      
      if (response.success && response.data) {
        let areasRaw = response.data;
        if (response.data.areas) {
          areasRaw = response.data.areas;
        }
        
        if (Array.isArray(areasRaw)) {
          const areasFormateadas = areasRaw.map((area: any) => ({
            id: area.id || area.idArea,
            nombre: area.nombre || area.name,
            descripcion: area.descripcion || area.description
          }));
          console.log('🏢 Áreas formateadas:', areasFormateadas);
          setAreasData(areasFormateadas);
        } else {
          setAreasData([]);
        }
      } else {
        setAreasData([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar áreas:', error);
      setAreasData([]);
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

  // Convertir AreaData[] a Area[] para el dialog
  const areasForDialog: Area[] = areasData.map(area => ({
    id: area.id,
    name: area.nombre,
    descripcion: area.descripcion
  }));

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
        <p>Asignaciones encontradas: {asignaciones.length}</p>
        <p>Áreas disponibles: {areasData.length}</p>
        {asignaciones.length > 0 && (
          <p>Primera asignación: {JSON.stringify(asignaciones[0])}</p>
        )}
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
        areas={areasForDialog}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AsignacionEvaluaciones;
