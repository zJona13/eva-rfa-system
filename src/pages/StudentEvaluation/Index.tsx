import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApiWithToken } from '@/hooks/useApiWithToken';
import EvaluacionEstudianteForm from './EvaluacionEstudianteForm';
import IncidenciaDialog from '@/components/IncidenciaDialog';
import { useEvaluationPermissions } from '@/hooks/useEvaluationPermissions';

const StudentEvaluation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { apiRequest } = useApiWithToken();
  const [showForm, setShowForm] = useState(false);
  const [showIncidenciaDialog, setShowIncidenciaDialog] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<any>(null);

  // Use evaluation permissions
  const { 
    canAccessStudentEvaluation, 
    userAreas, 
    isLoading: isLoadingPermissions 
  } = useEvaluationPermissions();

  // Fetch evaluaciones realizadas por este estudiante
  const { data: evaluacionesData, isLoading: isLoadingEvaluaciones } = useQuery({
    queryKey: ['evaluaciones-estudiante', user?.id],
    queryFn: () => apiRequest(`/evaluaciones/evaluador/${user?.id}`),
    enabled: !!user?.id && canAccessStudentEvaluation,
  });

  const evaluaciones = evaluacionesData?.data?.evaluaciones || [];
  const evaluacionesEstudiante = evaluaciones.filter((e: any) => e.type === 'Evaluacion estudiante-docente');

  const handleGenerateIncidencia = (evaluacion: any) => {
    console.log('Generating incidencia for evaluation:', evaluacion);
    setSelectedEvaluacion({
      evaluatedId: evaluacion.evaluatedId,
      evaluatedName: evaluacion.evaluatedName,
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

  // Verificar si el usuario puede generar incidencias (no debe ser el evaluado)
  const canGenerateIncidencia = (evaluacion: any) => {
    // El estudiante puede generar incidencias para docentes que evaluó
    return evaluacion.score < 11;
  };

  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!canAccessStudentEvaluation) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evaluación del Estudiante al Docente</h1>
          <p className="text-muted-foreground mt-2">
            Consulta las evaluaciones que has realizado a los docentes.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No tienes permisos para acceder a evaluaciones de docentes o no tienes asignaciones activas en tu área.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return <EvaluacionEstudianteForm onCancel={() => setShowForm(false)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Evaluación del Estudiante al Docente</h1>
        <p className="text-muted-foreground mt-2">
          Consulta las evaluaciones que has realizado a los docentes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mis Evaluaciones a Docentes</CardTitle>
          <CardDescription>
            Historial de evaluaciones que has realizado a docentes. Nota aprobatoria: ≥ 11/20
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEvaluaciones ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : evaluacionesEstudiante.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No has evaluado a ningún docente aún.</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowForm(true)}
              >
                Evaluar Primer Docente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowForm(true)}>
                  Nueva Evaluación
                </Button>
              </div>
              {evaluacionesEstudiante.map((evaluacion: any) => (
                <div key={evaluacion.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{evaluacion.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        Docente evaluado: {evaluacion.evaluatedName}
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

export default StudentEvaluation;
