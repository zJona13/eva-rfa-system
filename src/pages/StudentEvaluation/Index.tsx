
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, FileText, Clock, CheckCircle, XCircle, GraduationCap } from 'lucide-react';
import EvaluacionEstudianteForm from './EvaluacionEstudianteForm';

const StudentEvaluation = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);

  // Fetch evaluaciones del usuario como evaluador
  const { data: evaluacionesData, isLoading } = useQuery({
    queryKey: ['evaluaciones-evaluador', user?.id],
    queryFn: async () => {
      const response = await fetch(`/evaluaciones-evaluador/${user?.id}`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  const evaluaciones = evaluacionesData?.data?.evaluaciones || [];
  const evaluacionesEstudiante = evaluaciones.filter((ev: any) => ev.type === 'Evaluacion estudiante-docente');

  const handleNewEvaluation = () => {
    setSelectedEvaluacion(null);
    setShowForm(true);
  };

  const handleEditEvaluation = (evaluacion: any) => {
    setSelectedEvaluacion(evaluacion);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedEvaluacion(null);
  };

  if (showForm) {
    return (
      <EvaluacionEstudianteForm 
        onCancel={handleCancel}
        evaluacionDraft={selectedEvaluacion}
      />
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
            <GraduationCap className="h-8 w-8 text-primary" />
            Evaluación Estudiante-Docente
          </h1>
          <p className="text-muted-foreground">
            Tu opinión es valiosa. Evalúa el desempeño de tus docentes de forma anónima y constructiva.
          </p>
        </div>
        <Button onClick={handleNewEvaluation} className="gap-2">
          <Plus className="h-4 w-4" />
          Evaluar Docente
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {evaluacionesEstudiante.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No hay evaluaciones realizadas</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comienza evaluando el desempeño de un docente.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleNewEvaluation}>
                      Evaluar Docente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            evaluacionesEstudiante.map((evaluacion: any) => (
              <Card key={evaluacion.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(evaluacion.status)}
                      Evaluación a {evaluacion.evaluatedName}
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluacion.status)}`}>
                      {evaluacion.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Docente Evaluado</p>
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
                  {evaluacion.status === 'Pendiente' && (
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditEvaluation(evaluacion)}
                      >
                        Continuar Evaluación
                      </Button>
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

export default StudentEvaluation;
