import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

interface AutoevaluacionFormProps {
  onCancel: () => void;
  evaluacionDraft?: any;
}

const AutoevaluacionForm: React.FC<AutoevaluacionFormProps> = ({ onCancel, evaluacionDraft }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const form = useForm();
  const [subcriteriosRatings, setSubcriteriosRatings] = useState<Record<string, number>>(
    evaluacionDraft?.subcriteriosRatings || {}
  );

  // Fetch colaborador info by user ID
  const { data: colaboradorData, isLoading: isLoadingColaborador } = useQuery({
    queryKey: ['colaborador-by-user', user?.id],
    queryFn: async () => {
      const response = await fetch(`/colaborador-by-user/${user?.id}`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch criterios para autoevaluación
  const { data: criteriosData, isLoading: isLoadingCriterios } = useQuery({
    queryKey: ['criterios'],
    queryFn: async () => {
      const response = await fetch('/criterios');
      return response.json();
    },
  });

  // Fetch subcriterios
  const { data: subcriteriosData, isLoading: isLoadingSubcriterios } = useQuery({
    queryKey: ['subcriterios'],
    queryFn: async () => {
      const response = await fetch('/subcriterios');
      return response.json();
    },
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
      toast.success('Autoevaluación creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['evaluaciones-colaborador'] });
      onCancel();
    },
    onError: (error: any) => {
      toast.error(`Error al crear autoevaluación: ${error.message}`);
    },
  });

  const criterios = criteriosData?.data?.criterios || [];
  const subcriterios = subcriteriosData?.data?.subcriterios || [];

  // Agrupar subcriterios por criterio
  const criteriosAgrupados = criterios.reduce((acc: any, criterio: any) => {
    acc[criterio.nombre] = subcriterios.filter((sub: any) => sub.idCriterio === criterio.idCriterio);
    return acc;
  }, {});

  const handleSubcriterioRating = (subcriterioId: string, rating: number) => {
    setSubcriteriosRatings(prev => ({
      ...prev,
      [subcriterioId]: rating
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(subcriteriosRatings).reduce((sum, rating) => sum + rating, 0);
  };

  // Guardar borrador de autoevaluación
  const handleSaveDraft = (data: any) => {
    const colaborador = colaboradorData?.data?.colaborador;
    if (!colaborador) {
      toast.error('No se pudo obtener información del colaborador');
      return;
    }
    
    // Guardar en localStorage
    const borradorId = evaluacionDraft?.id || `temp-${user?.id}-autoeval`;
    localStorage.setItem(`autoevaluacion-borrador-${borradorId}`, JSON.stringify({
      subcriteriosRatings,
      comments: data.comentarios || '',
    }));
    
    if (evaluacionDraft?.id) {
      const now = new Date();
      const evaluacionData = {
        type: 'Autoevaluacion',
        evaluatorId: user?.id,
        evaluatedId: colaborador.id,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        score: calculateTotalScore(),
        comments: data.comentarios || null,
        status: 'Pendiente'
      };
      
      fetch(`/evaluaciones/${evaluacionDraft.id}`, {
        method: 'PUT',
        body: JSON.stringify(evaluacionData)
      }).then(response => response.json()).then(() => {
        toast.success('Borrador guardado exitosamente');
        queryClient.invalidateQueries({ queryKey: ['evaluaciones-colaborador'] });
        onCancel();
      }).catch((error: any) => {
        toast.error(`Error al guardar borrador: ${error.message}`);
      });
    } else {
      const now = new Date();
      const evaluacionData = {
        type: 'Autoevaluacion',
        evaluatorId: user?.id,
        evaluatedId: colaborador.id,
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
    if (Object.keys(subcriteriosRatings).length !== subcriterios.length) {
      toast.error('Debe calificar todos los subcriterios');
      return;
    }
    
    const colaborador = colaboradorData?.data?.colaborador;
    if (!colaborador) {
      toast.error('No se pudo obtener información del colaborador');
      return;
    }
    
    const now = new Date();
    const evaluacionData = {
      type: 'Autoevaluacion',
      evaluatorId: user?.id,
      evaluatedId: colaborador.id,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      score: calculateTotalScore(),
      comments: data.comentarios || null,
      status: 'Completada'
    };
    
    if (evaluacionDraft?.id) {
      fetch(`/evaluaciones/${evaluacionDraft.id}`, {
        method: 'PUT',
        body: JSON.stringify(evaluacionData)
      }).then(response => response.json()).then(() => {
        toast.success('Autoevaluación finalizada exitosamente');
        queryClient.invalidateQueries({ queryKey: ['evaluaciones-colaborador'] });
        onCancel();
      }).catch((error: any) => {
        toast.error(`Error al finalizar autoevaluación: ${error.message}`);
      });
    } else {
      createEvaluacionMutation.mutate(evaluacionData);
    }
  };

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

  // Recuperar borrador de localStorage al abrir el formulario
  useEffect(() => {
    const borradorId = evaluacionDraft?.id || `temp-${user?.id}-autoeval`;
    const borrador = localStorage.getItem(`autoevaluacion-borrador-${borradorId}`);
    if (borrador) {
      const data = JSON.parse(borrador);
      setSubcriteriosRatings(data.subcriteriosRatings || {});
      if (data.comments) form.setValue('comentarios', data.comments);
    }
  }, [evaluacionDraft]);

  if (isLoadingColaborador || isLoadingCriterios || isLoadingSubcriterios) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const colaborador = colaboradorData?.data?.colaborador;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Formulario de Autoevaluación</h1>
          <p className="text-muted-foreground">Evalúa tu propio desempeño profesional</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFinish)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Evaluación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Docente</Label>
                  <Input value={colaborador?.fullName || 'Cargando...'} disabled />
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input value={new Date(evaluacionDraft?.date || Date.now()).toLocaleDateString()} disabled />
                </div>
              </div>
              {evaluacionDraft?.status === 'Pendiente' && evaluacionDraft?.date && (
                <div className="mt-2 text-sm text-blue-600 font-semibold">
                  Fecha límite para editar/finalizar: {new Date(new Date(evaluacionDraft.date).getTime() + 24*60*60*1000).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-100">Escala de Valoración</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-semibold">1 punto:</span>
                  <br />Cumplimiento Total
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-semibold">0.5 puntos:</span>
                  <br />Cumplimiento Parcial
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-semibold">0 puntos:</span>
                  <br />No Cumple
                </div>
              </div>
            </div>
          </div>

          {Object.entries(criteriosAgrupados).map(([criterioNombre, subcriteriosGrupo]: [string, any]) => (
            <Card key={criterioNombre} className="border-l-4 border-l-primary">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                <CardTitle className="text-lg text-primary">{criterioNombre}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {subcriteriosGrupo.map((subcriterio: any, index: number) => (
                    <div key={subcriterio.idSubCriterio} className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <Label className="text-base font-medium leading-relaxed cursor-pointer">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-bold mr-3">
                              {index + 1}
                            </span>
                            {subcriterio.texto}
                          </Label>
                        </div>
                        <div className="flex-shrink-0">
                          <RadioGroup
                            value={subcriteriosRatings[subcriterio.idSubCriterio]?.toString() || ''}
                            onValueChange={(value) => handleSubcriterioRating(subcriterio.idSubCriterio, parseFloat(value))}
                            className="flex gap-6"
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <RadioGroupItem 
                                value="0" 
                                id={`${subcriterio.idSubCriterio}-0`}
                                className="w-5 h-5 border-2 border-red-400 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                              />
                              <Label htmlFor={`${subcriterio.idSubCriterio}-0`} className="text-xs text-center font-medium text-red-600 dark:text-red-400">
                                0
                              </Label>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                              <RadioGroupItem 
                                value="0.5" 
                                id={`${subcriterio.idSubCriterio}-0.5`}
                                className="w-5 h-5 border-2 border-yellow-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                              />
                              <Label htmlFor={`${subcriterio.idSubCriterio}-0.5`} className="text-xs text-center font-medium text-yellow-600 dark:text-yellow-400">
                                0.5
                              </Label>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                              <RadioGroupItem 
                                value="1" 
                                id={`${subcriterio.idSubCriterio}-1`}
                                className="w-5 h-5 border-2 border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                              />
                              <Label htmlFor={`${subcriterio.idSubCriterio}-1`} className="text-xs text-center font-medium text-green-600 dark:text-green-400">
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

          <Card className="border-2 border-primary">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardTitle className="text-center">Puntaje Total Obtenido</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-bold text-center text-primary">
                {calculateTotalScore()}<span className="text-2xl text-muted-foreground">/{subcriterios.length}</span>
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
                        placeholder="Reflexiones sobre tu desempeño profesional..."
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
              disabled={fueraDeRango || cancelada}
              className="flex-1"
            >
              Guardar Borrador
            </Button>
            <Button 
              type="button"
              onClick={() => form.handleSubmit(handleFinish)()}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              disabled={fueraDeRango || cancelada}
            >
              Finalizar Evaluación
            </Button>
          </div>
          {fueraDeRango && (
            <div className="text-red-600 text-center font-semibold mt-2">
              No puedes finalizar esta autoevaluación porque ha pasado más de 1 día desde su creación.
            </div>
          )}
          {cancelada && (
            <div className="text-red-600 text-center font-semibold mt-2">
              Esta autoevaluación ha sido cancelada automáticamente por superar la fecha límite.
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default AutoevaluacionForm;
