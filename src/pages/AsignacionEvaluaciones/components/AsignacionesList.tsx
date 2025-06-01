
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Calendar, Clock, Users, BarChart3, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import useApiWithToken from '@/hooks/useApiWithToken';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface AsignacionesListProps {
  onEdit: (asignacion: Asignacion) => void;
  onDelete: (id: number) => void;
}

const AsignacionesList: React.FC<AsignacionesListProps> = ({ onEdit, onDelete }) => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { apiRequest } = useApiWithToken();

  useEffect(() => {
    loadAsignaciones();
  }, []);

  const loadAsignaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest('/asignaciones');
      
      if (response.success && response.data) {
        let asignacionesData = response.data.asignaciones || [];
        
        // Filtrar asignaciones según el rol del usuario
        if (user?.role !== 'admin') {
          // Para usuarios no admin, obtener su área y mostrar solo asignaciones de su área
          const userResponse = await apiRequest('/user');
          if (userResponse.success && userResponse.data?.areaId) {
            asignacionesData = asignacionesData.filter((asignacion: Asignacion) => 
              asignacion.areaId === userResponse.data.areaId
            );
          } else {
            // Si no tiene área asignada, no mostrar ninguna asignación
            asignacionesData = [];
          }
        }
        
        setAsignaciones(asignacionesData);
      } else {
        setError(response.error || 'Error al cargar las asignaciones');
        setAsignaciones([]);
      }
    } catch (error) {
      setError('Error de conexión al cargar asignaciones');
      setAsignaciones([]);
    } finally {
      setIsLoading(false);
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

  const getProgreso = (completadas: number, total: number) => {
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    return porcentaje;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Cargando historial de asignaciones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2" 
            onClick={loadAsignaciones}
          >
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (asignaciones.length === 0) {
    const mensaje = user?.role === 'admin' 
      ? 'No hay asignaciones de evaluación registradas en el sistema'
      : 'No hay asignaciones de evaluación para tu área';
    
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">{mensaje}</p>
        <p className="text-sm">
          {user?.role === 'admin' 
            ? 'Crea una nueva asignación para programar las evaluaciones por área'
            : 'Las asignaciones para tu área aparecerán aquí cuando sean creadas'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          Historial de Asignaciones
          {user?.role !== 'admin' && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Filtrado por tu área)
            </span>
          )}
        </h3>
        <Badge variant="outline" className="text-xs">
          {asignaciones.length} asignacion{asignaciones.length !== 1 ? 'es' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {asignaciones.map((asignacion) => (
          <div key={asignacion.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-lg">Período {asignacion.periodo}</h4>
                    <p className="text-sm text-muted-foreground">Año académico</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{asignacion.areaNombre}</p>
                    <p className="text-sm text-muted-foreground">Área académica</p>
                  </div>
                </div>
                
                {getEstadoBadge(asignacion.estado)}
              </div>
              
              {user?.role === 'admin' && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(asignacion)}
                    title="Editar asignación"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(asignacion.id)}
                    title="Eliminar asignación"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fechas</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(asignacion.fechaInicio)} - {formatDate(asignacion.fechaFin)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Horario</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(asignacion.horaInicio)} - {formatTime(asignacion.horaFin)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Tipo de Evaluación</p>
                <p className="text-sm text-muted-foreground">{asignacion.tipoEvaluacion}</p>
              </div>
            </div>
            
            {asignacion.descripcion && (
              <div className="mb-4">
                <p className="text-sm font-medium">Descripción</p>
                <p className="text-sm text-muted-foreground">{asignacion.descripcion}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progreso de Evaluaciones:</span>
                <span>
                  {asignacion.evaluacionesCompletadas} / {asignacion.totalEvaluaciones}
                </span>
              </div>
              <Progress 
                value={getProgreso(asignacion.evaluacionesCompletadas, asignacion.totalEvaluaciones)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground text-right">
                {getProgreso(asignacion.evaluacionesCompletadas, asignacion.totalEvaluaciones)}% completado
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AsignacionesList;
