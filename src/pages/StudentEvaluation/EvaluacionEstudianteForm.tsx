import React, { useState, useEffect } from 'react';
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
import { subcriteriosEstudiante, getCriteriosAgrupados } from '@/data/evaluationCriteria';

interface Colaborador {
  id: number;
  fullName: string;
  roleName: string;
}

interface EvaluacionEstudianteFormProps {
  onCancel: () => void;
}

const EvaluacionEstudianteForm: React.FC<EvaluacionEstudianteFormProps & { evaluacionData?: any }> = ({ onCancel, evaluacionData }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: evaluacionData ? {
      comentarios: evaluacionData.comments || '',
      asignatura: evaluacionData.asignatura || ''
    } : {
      comentarios: '',
      asignatura: ''
    }
  });
  const { apiRequest } = useApiWithToken();
  const [selectedColaborador, setSelectedColaborador] = useState<string>(evaluacionData ? String(evaluacionData.evaluatedId) : '');
  // Precargar ratings solo una vez al abrir en edición
  const [subcriteriosRatings, setSubcriteriosRatings] = useState<Record<string, number>>(() => {
    if (evaluacionData && evaluacionData.subcriteriosRatings) {
      return evaluacionData.subcriteriosRatings;
    }
    return {};
  });
  const [ratingsInitialized, setRatingsInitialized] = useState(false);

  // Fetch colaboradores solo si NO es edición
  const { data: colaboradoresData, isLoading: isLoadingColaboradores } = useQuery({
    queryKey: ['colaboradores-para-evaluar'],
    queryFn: () => apiRequest('/colaboradores-para-evaluar'),
    enabled: !evaluacionData
  });

  // Agrupar subcriterios por criterio
  const criteriosAgrupados = getCriteriosAgrupados(subcriteriosEstudiante);

  // Precargar ratings solo una vez al abrir en edición
  useEffect(() => {
    if (
      evaluacionData &&
      evaluacionData.subcriteriosRatings &&
      !ratingsInitialized
    ) {
      setSubcriteriosRatings(evaluacionData.subcriteriosRatings);
      setRatingsInitialized(true);
    }
  }, [evaluacionData, ratingsInitialized]);

  const handleSubcriterioRating = (subcriterioId: string, rating: number) => {
    setSubcriteriosRatings(prev => ({
      ...prev,
      [subcriterioId]: rating
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(subcriteriosRatings).reduce((sum, rating) => sum + rating, 0);
  };

  // Mutación para crear o actualizar evaluación
  const saveEvaluacionMutation = useMutation({
    mutationFn: (evaluacionDataToSend: any) => {
      if (evaluacionData && evaluacionData.id) {
        // Actualizar evaluación existente
        return apiRequest(`/evaluaciones/${evaluacionData.id}`, {
          method: 'PUT',
          body: evaluacionDataToSend
        });
      } else {
        // Crear nueva evaluación
        return apiRequest('/evaluaciones', {
          method: 'POST',
          body: evaluacionDataToSend
        });
      }
    },
    onSuccess: () => {
      toast.success('Evaluación guardada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['evaluaciones-evaluador'] });
      onCancel();
    },
    onError: (error: any) => {
      toast.error(`Error al guardar evaluación: ${error.message}`);
    },
  });

  const colaboradores: Colaborador[] = colaboradoresData?.data?.colaboradores || [];

  const onSubmit = (data: any) => {
    if (!selectedColaborador) {
      toast.error('Debe seleccionar un colaborador para evaluar');
      return;
    }
    // Permitir guardar aunque falten subcriterios, pero mostrar advertencia
    if (Object.keys(subcriteriosRatings).length !== subcriteriosEstudiante.length) {
      toast.warning('Puedes guardar tu avance, pero debes calificar todos los subcriterios para finalizar.');
    }
    const now = new Date();
    const evaluacionDataToSend: any = {
      type: 'Estudiante-Docente',
      evaluatorId: user?.id,
      evaluatedId: parseInt(selectedColaborador),
      date: evaluacionData ? evaluacionData.date : now.toISOString().split('T')[0],
      time: evaluacionData ? evaluacionData.time : now.toTimeString().split(' ')[0],
      score: calculateTotalScore(),
      comments: data.comentarios || null,
      status: 'Pendiente',
      subcriteriosRatings
    };
    
    // Solo agregar id si estamos editando
    if (evaluacionData && evaluacionData.id) {
      evaluacionDataToSend.id = evaluacionData.id;
    }
    
    saveEvaluacionMutation.mutate(evaluacionDataToSend);
  };

  if (isLoadingColaboradores && !evaluacionData) {
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
          <h1 className="text-2xl font-bold">Evaluación del Docente por el Estudiante</h1>
          <p className="text-muted-foreground">Tu opinión es muy importante para ayudarnos a mejorar. Esta evaluación es anónima.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Evaluación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="colaborador">Profesor/a a evaluar</Label>
                {evaluacionData ? (
                  <div className="px-3 py-2 rounded bg-muted text-foreground font-semibold">{evaluacionData.evaluatedName}</div>
                ) : (
                  <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un profesor/a" />
                    </SelectTrigger>
                    <SelectContent>
                      {colaboradores.map((colaborador) => (
                        <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                          {colaborador.fullName} - {colaborador.roleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fecha</Label>
                  <Input value={evaluacionData ? new Date(evaluacionData.date).toLocaleDateString() : new Date().toLocaleDateString()} disabled />
                </div>
                <div>
                  <Label>Asignatura/Módulo</Label>
                  <Input placeholder="Nombre de la asignatura" {...form.register('asignatura')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="font-bold text-lg mb-3 text-purple-900 dark:text-purple-100">Escala de Valoración</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-semibold">1 punto:</span>
                  <br />Totalmente de Acuerdo / Siempre
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-semibold">0.5 puntos:</span>
                  <br />De Acuerdo Parcialmente / A Veces
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-semibold">0 puntos:</span>
                  <br />En Desacuerdo / Nunca
                </div>
              </div>
            </div>
          </div>

          {Object.entries(criteriosAgrupados).map(([criterioNombre, subcriteriosGrupo]) => (
            <Card key={criterioNombre} className="border-l-4 border-l-secondary">
              <CardHeader className="bg-gradient-to-r from-secondary/5 to-secondary/10 dark:from-secondary/10 dark:to-secondary/20">
                <CardTitle className="text-lg text-secondary">{criterioNombre}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {subcriteriosGrupo.map((subcriterio, index) => (
                    <div key={subcriterio.id} className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <Label className="text-base font-medium leading-relaxed cursor-pointer">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-secondary text-secondary-foreground rounded-full text-sm font-bold mr-3">
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

          <Card className="border-2 border-secondary">
            <CardHeader className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground">
              <CardTitle className="text-center">Puntaje Total Obtenido</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-bold text-center text-secondary">
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
                        placeholder="Lo que más valoro de este(a) profesor(a) y sugerencias para mejorar..."
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
              type="submit" 
              disabled={saveEvaluacionMutation.isPending || !selectedColaborador}
              className="flex-1 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
            >
              {saveEvaluacionMutation.isPending ? 'Guardando...' : 'Guardar Evaluación'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EvaluacionEstudianteForm;
