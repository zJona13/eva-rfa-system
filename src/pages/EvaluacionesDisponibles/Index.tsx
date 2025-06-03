
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import EvaluacionForm from './EvaluacionForm';

interface EvaluacionDisponible {
  id: number;
  fechaEvaluacion: string;
  horaEvaluacion: string;
  tipo: string;
  estado: string;
  evaluadoNombre: string;
  evaluadoId: number;
  asignacionId: number;
  fechaInicio: string;
  fechaFin: string;
}

const EvaluacionesDisponibles = () => {
  const { user } = useAuth();
  const { apiRequest } = useApiWithToken();
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionDisponible[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<EvaluacionDisponible | null>(null);

  const fetchEvaluacionesDisponibles = async () => {
    if (!user) return;

    try {
      const response = await apiRequest(`/evaluaciones/disponibles/${user.id}`);
      
      if (response?.success && response?.data?.evaluaciones) {
        setEvaluaciones(response.data.evaluaciones);
      } else {
        toast.error('Error al cargar evaluaciones disponibles');
      }
    } catch (error) {
      console.error('Error al obtener evaluaciones:', error);
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const isEvaluacionDisponible = (evaluacion: EvaluacionDisponible) => {
    const now = new Date();
    const fechaInicio = new Date(evaluacion.fechaInicio);
    const fechaFin = new Date(evaluacion.fechaFin);
    
    return now >= fechaInicio && now <= fechaFin;
  };

  const handleEvaluacionCompleted = () => {
    setSelectedEvaluacion(null);
    fetchEvaluacionesDisponibles();
  };

  useEffect(() => {
    fetchEvaluacionesDisponibles();
  }, [user]);

  if (selectedEvaluacion) {
    return (
      <EvaluacionForm
        evaluacion={selectedEvaluacion}
        onCompleted={handleEvaluacionCompleted}
        onCancel={() => setSelectedEvaluacion(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando evaluaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evaluaciones Disponibles</h1>
        <p className="text-muted-foreground">
          Completa las evaluaciones asignadas dentro del período establecido
        </p>
      </div>

      {evaluaciones.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay evaluaciones disponibles</h3>
            <p className="text-gray-600">
              No tienes evaluaciones pendientes en este momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evaluaciones.map((evaluacion) => {
            const disponible = isEvaluacionDisponible(evaluacion);
            
            return (
              <Card key={evaluacion.id} className={`${!disponible ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{evaluacion.tipo}</CardTitle>
                    <Badge variant={evaluacion.estado === 'Pendiente' ? 'destructive' : 'default'}>
                      {evaluacion.estado}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{evaluacion.evaluadoNombre}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(evaluacion.fechaEvaluacion).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{evaluacion.horaEvaluacion}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>Período: {new Date(evaluacion.fechaInicio).toLocaleDateString()} - {new Date(evaluacion.fechaFin).toLocaleDateString()}</p>
                  </div>
                  
                  {disponible ? (
                    <Button 
                      className="w-full"
                      onClick={() => setSelectedEvaluacion(evaluacion)}
                      disabled={evaluacion.estado === 'Completada'}
                    >
                      {evaluacion.estado === 'Completada' ? 'Completada' : 'Realizar Evaluación'}
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full" disabled>
                      No disponible aún
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EvaluacionesDisponibles;
