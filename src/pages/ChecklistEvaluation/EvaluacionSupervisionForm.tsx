import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApiWithToken } from '@/hooks/useApiWithToken';
import { ArrowLeft } from 'lucide-react';
import { subcriteriosSupervision, getCriteriosAgrupados } from '@/data/evaluationCriteria';

const API_BASE_URL = 'http://localhost:3306/api';

interface Colaborador {
  id: number;
  fullName: string;
  roleName: string;
}

interface EvaluacionSupervisionFormProps {
  onCancel: () => void;
  evaluacionDraft?: any;
}

const EvaluacionSupervisionForm: React.FC<EvaluacionSupervisionFormProps> = ({ onCancel, evaluacionDraft }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm();
  const { apiRequest } = useApiWithToken();
  const [selectedColaborador, setSelectedColaborador] = useState<string>(evaluacionDraft?.evaluatedId ? evaluacionDraft.evaluatedId.toString() : '');
  const [subcriteriosRatings, setSubcriteriosRatings] = useState<Record<string, number>>(
    evaluacionDraft?.subcriteriosRatings || {}
  );
  const [isDraft, setIsDraft] = useState(false);
  const borradorKey = evaluacionDraft?.id ? `evaluacion-borrador-${evaluacionDraft.id}` : null;

  // Fetch colaboradores
  const { data: colaboradoresData, isLoading: isLoadingColaboradores } = useQuery({
    queryKey: ['colaboradores-para-evaluar'],
    queryFn: () => apiRequest('/colaboradores-para-evaluar'),
  });

  const createEvaluacionMutation = useMutation({
    mutationFn: (evaluacionData: any) => apiRequest('/evaluaciones', {
      method: 'POST',
      body: evaluacionData
    }),
    onSuccess: () => {
      toast.success('Evaluación creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['evaluaciones-evaluador'] });
      onCancel();
    },
    onError: (error: any) => {
      toast.error(`Error al crear evaluación: ${error.message}`);
    },
  });

  const colaboradores: Colaborador[] = colaboradoresData?.data?.colaboradores || [];

  // Filtrar solo docentes
  const colaboradoresDocentes = colaboradores.filter(c => c.roleName === 'Docente');

  // Agrupar subcriterios por criterio
  const criteriosAgrupados = getCriteriosAgrupados(subcriteriosSupervision);

  const handleSubcriterioRating = (subcriterioId: string, rating: number) => {
    setSubcriteriosRatings(prev => ({
      ...prev,
      [subcriterioId]: rating
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(subcriteriosRatings).reduce((sum, rating) => sum + rating, 0);
  };

  const handleSaveDraft = (data: any) => {
    if (!selectedColaborador) {
      toast.error('Debe seleccionar un colaborador para evaluar');
      return;
    }
    // Guardar en localStorage SIEMPRE, usando el id del borrador o generando uno temporal si no existe
    const borradorId = evaluacionDraft?.id || `temp-${user?.id}-${selectedColaborador}`;
    localStorage.setItem(`evaluacion-borrador-${borradorId}`, JSON.stringify({
      subcriteriosRatings,
      selectedColaborador,
      comments: data.comentarios || ''
    }));
    // Si es un borrador real, guardar en BD
    if (evaluacionDraft?.id) {
      const now = new Date();
      const evaluacionData = {
        type: 'Evaluacion a Docente',
        evaluatorId: user?.id,
        evaluatedId: parseInt(selectedColaborador),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        score: calculateTotalScore(),
        comments: data.comentarios || null,
        status: 'Pendiente'
      };
      apiRequest(`/evaluaciones/${evaluacionDraft.id}`, {
        method: 'PUT',
        body: evaluacionData
      }).then(() => {
        toast.success('Borrador guardado exitosamente');
        queryClient.invalidateQueries({ queryKey: ['evaluaciones-evaluador'] });
        onCancel();
      }).catch((error: any) => {
        toast.error(`Error al guardar borrador: ${error.message}`);
      });
    } else {
      // Si no hay borrador en BD, crear uno nuevo
      const now = new Date();
      const evaluacionData = {
        type: 'Evaluacion a Docente',
        evaluatorId: user?.id,
        evaluatedId: parseInt(selectedColaborador),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        score: calculateTotalScore(),
        comments: data.comentarios || null,
        status: 'Pendiente'
      };
      createEvaluacionMutation.mutate(evaluacionData);
    }
  };

  const handleFinish = (data: any) => {
    if (!selectedColaborador) {
      toast.error('Debe seleccionar un colaborador para evaluar');
      return;
    }
    if (Object.keys(subcriteriosRatings).length !== subcriteriosSupervision.length) {
      toast.error('Debe calificar todos los subcriterios');
      return;
    }
    // Eliminar borrador de localStorage
    if (evaluacionDraft?.id) {
      localStorage.removeItem(`evaluacion-borrador-${evaluacionDraft.id}`);
    }
    const now = new Date();
    const evaluacionData = {
      type: 'Evaluacion a Docente',
      evaluatorId: user?.id,
      evaluatedId: parseInt(selectedColaborador),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      score: calculateTotalScore(),
      comments: data.comentarios || null,
      status: 'Completada'
    };
    if (evaluacionDraft?.id) {
      // Actualizar evaluación existente
      apiRequest(`/evaluaciones/${evaluacionDraft.id}`, {
        method: 'PUT',
        body: evaluacionData
      }).then(() => {
        toast.success('Evaluación finalizada exitosamente');
        queryClient.invalidateQueries({ queryKey: ['evaluaciones-evaluador'] });
        onCancel();
      }).catch((error: any) => {
        toast.error(`Error al finalizar evaluación: ${error.message}`);
      });
    } else {
      // Crear nueva evaluación
      createEvaluacionMutation.mutate(evaluacionData);
    }
  };

  React.useEffect(() => {
    if (evaluacionDraft?.id) {
      // Cargar borrador de localStorage si existe
      const borrador = localStorage.getItem(`evaluacion-borrador-${evaluacionDraft.id}`);
      if (borrador) {
        const data = JSON.parse(borrador);
        setSubcriteriosRatings(data.subcriteriosRatings || {});
        setSelectedColaborador(data.selectedColaborador || '');
        if (data.comments) form.setValue('comentarios', data.comments);
      }
    }
  }, [evaluacionDraft]);

  React.useEffect(() => {
    if (!selectedColaborador) return;
    const borradorId = evaluacionDraft?.id || `temp-${user?.id}-${selectedColaborador}`;
    localStorage.setItem(`evaluacion-borrador-${borradorId}`, JSON.stringify({
      subcriteriosRatings,
      selectedColaborador,
      comments: form.getValues('comentarios') || ''
    }));
  }, [subcriteriosRatings, selectedColaborador]);

  // Lógica de fecha límite para edición/finalización (1 día)
  let fueraDeRango = false;
  let fechaEvaluacionDraft = null;
  let cancelada = evaluacionDraft?.status === 'Cancelada';
  if (evaluacionDraft?.date && evaluacionDraft?.status === 'Pendiente') {
    fechaEvaluacionDraft = new Date(evaluacionDraft.date);
    const ahora = new Date();
    if (!isNaN(fechaEvaluacionDraft.getTime())) {
      const diffMs = ahora.getTime() - fechaEvaluacionDraft.getTime();
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      if (diffDias > 1) {
        fueraDeRango = true;
      }
    }
  }

  if (isLoadingColaboradores) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Ficha de Supervisión de Aprendizaje</h1>
          <p className="text-muted-foreground">Evalúa el desempeño docente utilizando criterios predefinidos</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFinish)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Evaluación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="colaborador">Docente a evaluar</Label>
                <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un docente" />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradoresDocentes.map((colaborador) => (
                      <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                        {colaborador.fullName} - {colaborador.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Fecha</Label>
                  <Input value={new Date(evaluacionDraft?.date || Date.now()).toLocaleDateString()} disabled />
                </div>
                <div>
                  <Label>Hora de Inicio</Label>
                  <Input type="time" {...form.register('horaInicio')} />
                </div>
                <div>
                  <Label>Hora de Término</Label>
                  <Input type="time" {...form.register('horaTermino')} />
                </div>
              </div>
              {evaluacionDraft?.status === 'Pendiente' && evaluacionDraft?.date && (
                <div className="mt-2 text-sm text-blue-600 font-semibold">
                  Fecha límite para editar/finalizar: {new Date(new Date(evaluacionDraft.date).getTime() + 24*60*60*1000).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <h3 className="font-bold text-lg mb-3 text-emerald-900 dark:text-emerald-100">Escala de Valoración</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-semibold">1 punto:</span>
                  <br />Cumple Totalmente / Observado Satisfactoriamente
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-semibold">0.5 puntos:</span>
                  <br />Cumple Parcialmente / Observado con Áreas de Mejora
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-semibold">0 puntos:</span>
                  <br />No Cumple / No Observado
                </div>
              </div>
            </div>
          </div>

          {Object.entries(criteriosAgrupados).map(([criterioNombre, subcriteriosGrupo]) => (
            <Card key={criterioNombre} className="border-l-4 border-l-emerald-500">
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20">
                <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300">{criterioNombre}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {subcriteriosGrupo.map((subcriterio, index) => (
                    <div key={subcriterio.id} className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <Label className="text-base font-medium leading-relaxed cursor-pointer">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-600 text-white rounded-full text-sm font-bold mr-3">
                              {index + 1}
                            </span>
                            {subcriterio.texto}
                          </Label>
                        </div>
                        <div className="flex-shrink-0">
                          <RadioGroup
                            value={subcriteriosRatings[subcriterio.id]?.toString() || ''}
                            onValueChange={(value) => handleSubcriterioRating(subcriterio.id, parseFloat(value))}
                            className="flex gap-6"
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <RadioGroupItem 
                                value="0" 
                                id={`${subcriterio.id}-0`}
                                className="w-5 h-5 border-2 border-red-400 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                              />
                              <Label htmlFor={`${subcriterio.id}-0`} className="text-xs text-center font-medium text-red-600 dark:text-red-400">
                                0
                              </Label>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                              <RadioGroupItem 
                                value="0.5" 
                                id={`${subcriterio.id}-0.5`}
                                className="w-5 h-5 border-2 border-yellow-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                              />
                              <Label htmlFor={`${subcriterio.id}-0.5`} className="text-xs text-center font-medium text-yellow-600 dark:text-yellow-400">
                                0.5
                              </Label>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                              <RadioGroupItem 
                                value="1" 
                                id={`${subcriterio.id}-1`}
                                className="w-5 h-5 border-2 border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                              />
                              <Label htmlFor={`${subcriterio.id}-1`} className="text-xs text-center font-medium text-green-600 dark:text-green-400">
                                1
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-2 border-emerald-500">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
              <CardTitle className="text-center">Puntaje Total Obtenido</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-bold text-center text-emerald-600">
                {calculateTotalScore()}<span className="text-2xl text-muted-foreground">/20</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comentarios Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="comentarios"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Escriba sus comentarios y observaciones..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="button"
              variant="secondary"
              onClick={() => form.handleSubmit(handleSaveDraft)()}
              disabled={createEvaluacionMutation.isPending || !selectedColaborador || fueraDeRango || cancelada}
              className="flex-1"
            >
              Guardar Borrador
            </Button>
            <Button 
              type="button"
              onClick={() => form.handleSubmit(handleFinish)()}
              disabled={createEvaluacionMutation.isPending || !selectedColaborador || fueraDeRango || cancelada}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white"
            >
              {createEvaluacionMutation.isPending ? 'Guardando...' : 'Finalizar Evaluación'}
            </Button>
          </div>
          {fueraDeRango && (
            <div className="text-red-600 text-center font-semibold mt-2">
              No puedes editar ni finalizar esta evaluación porque han pasado más de 1 día desde su creación.
            </div>
          )}
          {cancelada && (
            <div className="text-red-600 text-center font-semibold mt-2">
              Esta evaluación ha sido cancelada automáticamente por superar la fecha límite.
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default EvaluacionSupervisionForm;
