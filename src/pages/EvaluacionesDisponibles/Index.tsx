
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApiWithToken } from '@/hooks/useApiWithToken';
import EvaluacionForm from './EvaluacionForm';

const EvaluacionesDisponibles = () => {
  const { user } = useAuth();
  const { apiRequest } = useApiWithToken();
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch evaluaciones pendientes disponibles para este usuario
  const { data: evaluacionesData, isLoading, refetch } = useQuery({
    queryKey: ['evaluaciones-pendientes', user?.id],
    queryFn: () => apiRequest(`/evaluaciones/pendientes/${user?.id}`),
    enabled: !!user?.id,
  });

  const evaluaciones = evaluacionesData?.data?.evaluaciones || [];

  const handleStartEvaluation = (evaluacion: any) => {
    setSelectedEvaluacion(evaluacion);
    setShowForm(true);
  };

  const handleCompleteEvaluation = async (evaluacionData: any) => {
    try {
      const response = await apiRequest(`/evaluaciones/${selectedEvaluacion.id}/complete`, {
        method: 'POST',
        body: evaluacionData,
      });

      if (response?.success) {
        toast.success('Evaluación completada exitosamente');
        setShowForm(false);
        setSelectedEvaluacion(null);
        refetch();
      } else {
        toast.error(response?.message || 'Error al completar la evaluación');
      }
    } catch (error) {
      console.error('Error completing evaluation:', error);
      toast.error('Error de conexión');
    }
  };

  const getEvaluationType = (tipo: string) => {
    switch (tipo) {
      case 'Autoevaluacion':
        return 'Autoevaluación';
      case 'Evaluador-Evaluado':
        return 'Evaluación a Docente';
      case 'Estudiante-Docente':
        return 'Evaluación Estudiante';
      default:
        return tipo;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'Autoevaluacion':
        return 'bg-blue-100 text-blue-800';
      case 'Evaluador-Evaluado':
        return 'bg-green-100 text-green-800';
      case 'Estudiante-Docente':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm && selectedEvaluacion) {
    return (
      <EvaluacionForm
        evaluacion={selectedEvaluacion}
        onComplete={handleCompleteEvaluation}
        onCancel={() => {
          setShowForm(false);
          setSelectedEvaluacion(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Evaluaciones Disponibles</h1>
        <p className="text-muted-foreground mt-2">
          Completa las evaluaciones que tienes pendientes dentro del período establecido.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : evaluaciones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay evaluaciones disponibles</h3>
            <p className="text-muted-foreground text-center">
              No tienes evaluaciones pendientes en este momento o no estás dentro del período de evaluación.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {evaluaciones.map((evaluacion: any) => (
            <Card key={evaluacion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{getEvaluationType(evaluacion.type)}</CardTitle>
                    <CardDescription>
                      Evaluado: {evaluacion.evaluatedName}
                    </CardDescription>
                  </div>
                  <Badge className={getTypeColor(evaluacion.type)}>
                    {getEvaluationType(evaluacion.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(evaluacion.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {evaluacion.time}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => handleStartEvaluation(evaluacion)}>
                    Realizar Evaluación
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluacionesDisponibles;
