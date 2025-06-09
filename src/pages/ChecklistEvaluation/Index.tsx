
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import EvaluacionSupervisionForm from './EvaluacionSupervisionForm';
import IncidenciaDialog from '@/components/IncidenciaDialog';

const ChecklistEvaluation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showIncidenciaDialog, setShowIncidenciaDialog] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<any>(null);
  const [editingEvaluacion, setEditingEvaluacion] = useState<any>(null);

  // Fetch evaluaciones realizadas por este evaluador
  const { data: evaluacionesData, isLoading: isLoadingEvaluaciones } = useQuery({
    queryKey: ['evaluaciones-evaluador', user?.id],
    queryFn: async () => {
      const response = await fetch(`/evaluaciones/evaluador/${user?.id}`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  const evaluaciones = evaluacionesData?.data?.evaluaciones || [];
  const evaluacionesSupervision = evaluaciones.filter((e: any) => e.type === 'Evaluacion a Docente');

  const pendientesSupervision = evaluacionesSupervision.filter((e: any) => e.status === 'Pendiente');
  const historialSupervision = evaluacionesSupervision.filter((e: any) => e.status === 'Completada' || e.status === 'Cancelada');

  const handleGenerateIncidencia = (evaluacion: any) => {
    console.log('Generating incidencia for supervision:', evaluacion);
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

  // Para supervisiones, el supervisor puede generar incidencias si la nota es menor a 11
  const canGenerateIncidencia = (evaluacion: any) => {
    return evaluacion.score < 11;
  };

  if (showForm || editingEvaluacion) {
    return <EvaluacionSupervisionForm onCancel={() => { setShowForm(false); setEditingEvaluacion(null); }} evaluacionDraft={editingEvaluacion} />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Supervisión Docente
        </h1>
        <p className="text-muted-foreground">
          Consulta las evaluaciones de supervisión que has realizado utilizando criterios predefinidos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2 text-primary">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              Evaluaciones Pendientes
            </CardTitle>
            <CardDescription className="text-sm">
              Evaluaciones de supervisión que están pendientes de realizar.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {pendientesSupervision.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <span className="text-muted-foreground text-xl">✓</span>
                </div>
                <p className="text-muted-foreground text-sm">No tienes evaluaciones pendientes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendientesSupervision.map((evaluacion: any) => (
                  <div key={evaluacion.id} className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-lg p-4 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">{evaluacion.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Evaluado:</span> {evaluacion.evaluatedName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Fecha:</span> {new Date(evaluacion.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => setEditingEvaluacion(evaluacion)}
                      >
                        Continuar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2 text-secondary">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Historial de Evaluaciones
            </CardTitle>
            <CardDescription className="text-sm">
              Evaluaciones completadas. Nota aprobatoria: ≥ 11/20
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingEvaluaciones ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : evaluacionesSupervision.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <span className="text-muted-foreground text-xl">📋</span>
                </div>
                <p className="text-muted-foreground text-sm">No has realizado evaluaciones de supervisión aún.</p>
                <Button 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" 
                  onClick={() => setShowForm(true)}
                >
                  Realizar Primera Supervisión
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button 
                    className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
                    onClick={() => setShowForm(true)}
                  >
                    Nueva Supervisión
                  </Button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {historialSupervision.map((evaluacion: any) => (
                    <div key={evaluacion.id} className="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{evaluacion.type}</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><span className="font-medium">Evaluado:</span> {evaluacion.evaluatedName}</p>
                            <p><span className="font-medium">Fecha:</span> {new Date(evaluacion.date).toLocaleDateString()}</p>
                            <p><span className="font-medium">Puntaje:</span> {evaluacion.score}/20</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-col items-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            evaluacion.status === 'Completada'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : evaluacion.status === 'Cancelada'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {evaluacion.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluacion.score)}`}>
                            {getEvaluationStatus(evaluacion.score)}
                          </span>
                          {canGenerateIncidencia(evaluacion) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateIncidencia(evaluacion)}
                              className="text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              Generar Incidencia
                            </Button>
                          )}
                        </div>
                      </div>
                      {evaluacion.comments && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                          <p className="text-sm">
                            <span className="font-semibold text-foreground">Comentarios:</span> 
                            <span className="text-muted-foreground ml-2">{evaluacion.comments}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

export default ChecklistEvaluation;
