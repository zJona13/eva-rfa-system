
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApiWithToken } from '@/hooks/useApiWithToken';
import AutoevaluacionForm from './AutoevaluacionForm';
import IncidenciaDialog from '@/components/IncidenciaDialog';

const SelfEvaluation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { apiRequest } = useApiWithToken();
  const [showForm, setShowForm] = useState(false);
  const [showIncidenciaDialog, setShowIncidenciaDialog] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<any>(null);

  // Fetch autoevaluaciones del usuario actual
  const { data: evaluacionesData, isLoading: isLoadingEvaluaciones } = useQuery({
    queryKey: ['evaluaciones-colaborador', user?.colaboradorId],
    queryFn: () => apiRequest(`/evaluaciones/colaborador/${user?.colaboradorId}`),
    enabled: !!user?.colaboradorId,
  });

  const evaluaciones = evaluacionesData?.data?.evaluaciones || [];
  const autoevaluaciones = evaluaciones.filter((e: any) => e.type === 'Autoevaluacion');

  const handleGenerateIncidencia = (evaluacion: any) => {
    console.log('Generating incidencia for self-evaluation:', evaluacion);
    setSelectedEvaluacion({
      evaluatedId: user?.colaboradorId,
      evaluatedName: user?.colaboradorName || user?.name || 'Usuario',
      score: evaluacion.score,
      type: evaluacion.type
    });
    setShowIncidenciaDialog(true);
  };

  const getEvaluationStatus = (score: number) => {
    return score >= 11 ? 'Aprobado' : 'Desaprobado';
  };

  const getStatusColor = (score: number) => {
    return score >= 11 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Para autoevaluaciones, un supervisor puede generar incidencias si la nota es menor a 11
  const canGenerateIncidencia = (evaluacion: any) => {
    return evaluacion.score < 11;
  };

  if (showForm) {
    return <AutoevaluacionForm onCancel={() => setShowForm(false)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Autoevaluación del Personal</h1>
        <p className="text-muted-foreground mt-2">
          Consulta tus autoevaluaciones anteriores y tu progreso profesional.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Autoevaluaciones</CardTitle>
          <CardDescription>
            Consulta tus autoevaluaciones anteriores y tu progreso. Nota aprobatoria: ≥ 11/20
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEvaluaciones ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : autoevaluaciones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No has realizado autoevaluaciones aún.</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowForm(true)}
              >
                Realizar Primera Autoevaluación
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowForm(true)}>
                  Nueva Autoevaluación
                </Button>
              </div>
              {autoevaluaciones.map((evaluacion: any) => (
                <div key={evaluacion.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{evaluacion.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        Evaluador: {evaluacion.evaluatorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Fecha: {new Date(evaluacion.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Puntaje: {evaluacion.score}/20
                      </p>
                    </div>
                    <div className="flex gap-2 flex-col items-end">
                      <span className={`px-2 py-1 rounded text-xs ${
                        evaluacion.status === 'Completada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {evaluacion.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(evaluacion.score)}`}>
                        {getEvaluationStatus(evaluacion.score)}
                      </span>
                      {canGenerateIncidencia(evaluacion) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateIncidencia(evaluacion)}
                          className="text-xs"
                        >
                          Generar Incidencia
                        </Button>
                      )}
                    </div>
                  </div>
                  {evaluacion.comments && (
                    <div className="mt-3 p-3 bg-muted rounded">
                      <p className="text-sm"><strong>Comentarios:</strong> {evaluacion.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEvaluacion && (
        <IncidenciaDialog
          open={showIncidenciaDialog}
          onOpenChange={setShowIncidenciaDialog}
          evaluacionData={selectedEvaluacion}
        />
      )}
    </div>
  );
};

export default SelfEvaluation;
