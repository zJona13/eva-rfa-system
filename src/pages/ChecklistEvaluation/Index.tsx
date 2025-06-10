
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, FileText, Clock, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import SupervisionForm from './SupervisionForm';

const ChecklistEvaluation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Fetch colaboradores para evaluar
  const { data: colaboradoresData, isLoading: isLoadingColaboradores } = useQuery({
    queryKey: ['colaboradores-para-evaluar'],
    queryFn: async () => {
      const response = await fetch('/colaboradores-para-evaluar');
      return response.json();
    },
  });

  // Fetch evaluaciones realizadas por el usuario
  const { data: evaluacionesData, isLoading } = useQuery({
    queryKey: ['evaluaciones-evaluador', user?.id],
    queryFn: async () => {
      const response = await fetch(`/evaluaciones-evaluador/${user?.id}`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  const createEvaluacionMutation = useMutation({
    mutationFn: async (evaluacionData: any) => {
      const response = await fetch('/evaluaciones', {
        method: 'POST',
        body: JSON.stringify(evaluacionData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast.success('Evaluación de supervisión guardada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['evaluaciones-evaluador'] });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(`Error al guardar evaluación: ${error.message}`);
    },
  });

  const colaboradores = colaboradoresData?.data?.colaboradores || [];
  const evaluaciones = evaluacionesData?.data?.evaluaciones || [];
  const evaluacionesSupervision = evaluaciones.filter((ev: any) => ev.type === 'Ficha de Supervisión de Aprendizaje');

  const handleNewEvaluation = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleSubmitEvaluation = (evaluacionData: any) => {
    const now = new Date();
    const finalData = {
      ...evaluacionData,
      type: 'Ficha de Supervisión de Aprendizaje',
      evaluatorId: user?.id,
      status: 'Completada'
    };
    createEvaluacionMutation.mutate(finalData);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleCancel} className="p-2">
            ← Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nueva Evaluación de Supervisión</h1>
            <p className="text-muted-foreground">Ficha de supervisión de aprendizaje</p>
          </div>
        </div>
        <SupervisionForm
          onSubmit={handleSubmitEvaluation}
          colaboradores={colaboradores}
          isLoading={createEvaluacionMutation.isPending}
        />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completada':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Pendiente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Cancelada':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Cancelada':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            Evaluación por Lista de Verificación
          </h1>
          <p className="text-muted-foreground">
            Fichas de supervisión de aprendizaje y evaluaciones estructuradas.
          </p>
        </div>
        <Button onClick={handleNewEvaluation} className="gap-2" disabled={isLoadingColaboradores}>
          <Plus className="h-4 w-4" />
          Nueva Supervisión
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {evaluacionesSupervision.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No hay evaluaciones de supervisión</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comienza creando una nueva evaluación de supervisión.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleNewEvaluation} disabled={isLoadingColaboradores}>
                      Nueva Supervisión
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            evaluacionesSupervision.map((evaluacion: any) => (
              <Card key={evaluacion.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(evaluacion.status)}
                      Supervisión a {evaluacion.evaluatedName}
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluacion.status)}`}>
                      {evaluacion.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Docente Supervisado</p>
                      <p className="text-sm text-muted-foreground">
                        {evaluacion.evaluatedName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Fecha</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(evaluacion.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Puntaje</p>
                      <p className="text-sm text-muted-foreground">
                        {evaluacion.score}/20
                      </p>
                    </div>
                  </div>
                  {evaluacion.comments && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Comentarios</p>
                      <p className="text-sm text-muted-foreground">
                        {evaluacion.comments}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ChecklistEvaluation;
