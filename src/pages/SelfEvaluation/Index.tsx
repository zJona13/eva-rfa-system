
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import AutoevaluacionForm from './AutoevaluacionForm';

const API_BASE_URL = 'http://localhost:3306/api';

// API functions
const createEvaluacion = async (evaluacionData: any) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/evaluaciones`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(evaluacionData),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const fetchEvaluacionesByColaborador = async (colaboradorId: number) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/evaluaciones/colaborador/${colaboradorId}`, {
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

const SelfEvaluation = () => {
  const [activeTab, setActiveTab] = useState('autoevaluacion');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch autoevaluaciones del usuario actual
  const { data: evaluacionesData, isLoading: isLoadingEvaluaciones } = useQuery({
    queryKey: ['evaluaciones-colaborador', user?.colaboradorId],
    queryFn: () => fetchEvaluacionesByColaborador(user?.colaboradorId || 0),
    enabled: !!user?.colaboradorId,
  });

  // Mutation para crear autoevaluación
  const createAutoevaluacionMutation = useMutation({
    mutationFn: createEvaluacion,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Autoevaluación guardada exitosamente');
        queryClient.invalidateQueries({ queryKey: ['evaluaciones-colaborador'] });
        setActiveTab('mis-autoevaluaciones');
      } else {
        toast.error(data.message || 'Error al guardar la autoevaluación');
      }
    },
    onError: (error) => {
      console.error('Error creating autoevaluacion:', error);
      toast.error(`Error al guardar la autoevaluación: ${error.message}`);
    },
  });

  const handleSubmitAutoevaluacion = (evaluacionData: any) => {
    const dataToSubmit = {
      ...evaluacionData,
      evaluatorId: user?.id, // El usuario se evalúa a sí mismo
      evaluatedId: user?.colaboradorId, // Su propio colaborador ID
      status: 'Completada'
    };
    
    console.log('Submitting autoevaluacion:', dataToSubmit);
    createAutoevaluacionMutation.mutate(dataToSubmit);
  };

  const evaluaciones = evaluacionesData?.evaluaciones || [];
  const autoevaluaciones = evaluaciones.filter((e: any) => e.type === 'Autoevaluación Docente');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Autoevaluación del Personal</h1>
        <p className="text-muted-foreground mt-2">
          Realiza tu autoevaluación reflexionando sobre tu práctica docente y desempeño profesional.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="autoevaluacion">Nueva Autoevaluación</TabsTrigger>
          <TabsTrigger value="mis-autoevaluaciones">Mis Autoevaluaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="autoevaluacion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Autoevaluación Docente</CardTitle>
              <CardDescription>
                Reflexiona sobre tu desempeño y práctica docente utilizando la escala modificada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoevaluacionForm
                onSubmit={handleSubmitAutoevaluacion}
                docenteName={user?.name || ''}
                isLoading={createAutoevaluacionMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mis-autoevaluaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Autoevaluaciones</CardTitle>
              <CardDescription>
                Consulta tus autoevaluaciones anteriores y tu progreso
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
                    onClick={() => setActiveTab('autoevaluacion')}
                  >
                    Realizar Primera Autoevaluación
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelfEvaluation;
