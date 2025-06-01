
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, CheckCircle, Clock } from 'lucide-react';
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
  horaInicio: string;
  horaFin: string;
  tipoEvaluacion: string;
  estado: string;
  descripcion?: string;
  areaNombre: string;
  areaId: number;
  totalEvaluaciones: number;
  evaluacionesCompletadas: number;
  periodo?: number;
}

interface Area {
  id: number;
  nombre?: string;
  name?: string;
  description?: string;
  descripcion?: string;
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
    try {
      console.log('🔍 Iniciando fetchAsignaciones...');
      const response = await apiRequest('/asignaciones');
      console.log('📋 Response completa asignaciones:', response);
      
      if (response.success && response.data) {
        // Verificar si las asignaciones están en response.data.asignaciones o directamente en response.data
        const asignacionesData = response.data.asignaciones || response.data || [];
        console.log('✅ Asignaciones encontradas:', asignacionesData.length);
        console.log('📊 Datos de asignaciones:', asignacionesData);
        
        setAsignaciones(asignacionesData);
        
        if (asignacionesData.length === 0) {
          console.log('⚠️ No se encontraron asignaciones');
        }
      } else {
        console.error('❌ Error en la respuesta:', response);
        toast.error('Error al cargar las asignaciones');
      }
    } catch (error) {
      console.error('❌ Error fetching asignaciones:', error);
      toast.error('Error de conexión al cargar asignaciones');
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('🔍 Iniciando fetchAreas...');
      const response = await apiRequest('/areas');
      console.log('🏢 Response areas:', response);
      
      if (response.success && response.data) {
        const areasData = response.data.areas || response.data || [];
        console.log('✅ Áreas encontradas:', areasData.length);
        console.log('🏢 Datos de áreas:', areasData);
        setAreas(areasData);
        
        if (areasData.length === 0) {
          toast.error('No hay áreas disponibles');
        }
      } else {
        console.error('❌ Error en la respuesta de áreas:', response);
        toast.error('Error al cargar las áreas');
      }
    } catch (error) {
      console.error('❌ Error fetching areas:', error);
      toast.error('Error de conexión al cargar áreas');
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
        toast.success(response.data.message || 'Asignación guardada exitosamente');
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        fetchAsignaciones();
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

  const formatDate = (dateString: string) => {
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
                Periodo {asignacion.periodo || new Date().getFullYear()}
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
            <span>
              {asignacion.horaInicio} - {asignacion.horaFin}
            </span>
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

          {asignacion.descripcion && (
            <p className="text-sm text-muted-foreground">
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
      <div className="text-sm text-muted-foreground">
        Total de asignaciones cargadas: {asignaciones.length}
      </div>

      {/* Lista de asignaciones como cards */}
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
