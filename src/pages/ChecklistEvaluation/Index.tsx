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
  const [colaboradores, setColaboradores] = useState<any[]>([]);

  // Fetch evaluaciones realizadas por este evaluador
  const { data: evaluacionesData, isLoading: isLoadingEvaluaciones } = useQuery({
    queryKey: ['evaluaciones-evaluador', user?.id],
    queryFn: () => fetch(`/evaluaciones/evaluador/${user?.id}`),
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

  const fetchColaboradores = async () => {
    try {
      const response = await fetch('http://localhost:3309/api/colaboradores');
      const data = await response.json();
      setColaboradores(data.colaboradores || []);
    } catch (error) {
      toast.error('Error al cargar colaboradores');
    }
  };

  if (showForm || editingEvaluacion) {
    return <EvaluacionSupervisionForm onCancel={() => { setShowForm(false); setEditingEvaluacion(null); }} evaluacionDraft={editingEvaluacion} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Supervisión Docente</h1>
        <p className="text-muted-foreground mt-2">
          Consulta las evaluaciones de supervisión que has realizado utilizando criterios predefinidos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones Pendientes</CardTitle>
          <CardDescription>
            Evaluaciones de supervisión que están pendientes de realizar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendientesSupervision.length === 0 ? (
            <p className="text-muted-foreground">No tienes evaluaciones pendientes.</p>
          ) : (
            pendientesSupervision.map((evaluacion: any) => (
              <div key={evaluacion.id} className="border rounded-lg p-4 mb-2 bg-yellow-50 dark:bg-yellow-900/30 flex justify-between items-center transition-colors">
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">{evaluacion.type}</h3>
                  <p className="text-sm text-muted-foreground">Evaluado: {evaluacion.evaluatedName}</p>
                  <p className="text-sm text-muted-foreground">Fecha: {new Date(evaluacion.date).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setEditingEvaluacion(evaluacion)}>Continuar</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis Evaluaciones de Supervisión</CardTitle>
          <CardDescription>
            Historial de evaluaciones de supervisión que has realizado. Nota aprobatoria: ≥ 11/20
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEvaluaciones ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : evaluacionesSupervision.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No has realizado evaluaciones de supervisión aún.</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowForm(true)}
              >
                Realizar Primera Supervisión
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowForm(true)}>
                  Nueva Supervisión
                </Button>
              </div>
              {historialSupervision.map((evaluacion: any) => (
                <div key={evaluacion.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{evaluacion.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        Evaluado: {evaluacion.evaluatedName}
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
                          : evaluacion.status === 'Cancelada'
                            ? 'bg-red-100 text-red-800'
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

export default ChecklistEvaluation;
