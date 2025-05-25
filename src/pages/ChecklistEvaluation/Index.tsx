
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import EvaluacionSupervisionForm from './EvaluacionSupervisionForm';

const API_BASE_URL = 'http://localhost:3306/api';

// API functions
const fetchEvaluacionesByEvaluador = async (userId: number) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/evaluaciones/evaluador/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const ChecklistEvaluation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Fetch evaluaciones realizadas por este evaluador
  const { data: evaluacionesData, isLoading: isLoadingEvaluaciones } = useQuery({
    queryKey: ['evaluaciones-evaluador', user?.id],
    queryFn: () => fetchEvaluacionesByEvaluador(Number(user?.id) || 0),
    enabled: !!user?.id,
  });

  const evaluaciones = evaluacionesData?.evaluaciones || [];
  const evaluacionesSupervision = evaluaciones.filter((e: any) => e.type === 'Evaluacion a Docente');

  if (showForm) {
    return <EvaluacionSupervisionForm onCancel={() => setShowForm(false)} />;
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
          <CardTitle>Mis Evaluaciones de Supervisión</CardTitle>
          <CardDescription>
            Historial de evaluaciones de supervisión que has realizado
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
              {evaluacionesSupervision.map((evaluacion: any) => (
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
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        evaluacion.status === 'Completada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {evaluacion.status}
                      </span>
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
    </div>
  );
};

export default ChecklistEvaluation;
