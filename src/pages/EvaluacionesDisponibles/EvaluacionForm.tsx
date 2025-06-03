
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { criteriosEvaluacion } from '@/data/evaluationCriteria';

const formSchema = z.object({
  score: z.number().min(1, 'Debe seleccionar una puntuación').max(20, 'La puntuación máxima es 20'),
  comments: z.string().min(10, 'Los comentarios deben tener al menos 10 caracteres'),
  subcriteriosRatings: z.record(z.number()).optional(),
});

interface EvaluacionFormProps {
  evaluacion: any;
  onComplete: (data: any) => Promise<void>;
  onCancel: () => void;
}

const EvaluacionForm: React.FC<EvaluacionFormProps> = ({ evaluacion, onComplete, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: 0,
      comments: '',
      subcriteriosRatings: {},
    },
  });

  // Prevenir salida accidental
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e: PopStateEvent) => {
      if (!form.formState.isSubmitted) {
        e.preventDefault();
        setShowExitWarning(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [form.formState.isSubmitted]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onComplete(values);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    if (form.formState.isDirty) {
      setShowExitWarning(true);
    } else {
      onCancel();
    }
  };

  const confirmExit = () => {
    onCancel();
  };

  const criterios = criteriosEvaluacion[evaluacion.type] || [];
  const watchedRatings = form.watch('subcriteriosRatings') || {};

  // Calcular puntaje automáticamente basado en subcriterios
  useEffect(() => {
    const ratings = Object.values(watchedRatings);
    if (ratings.length === criterios.length && ratings.every(r => r > 0)) {
      const totalScore = ratings.reduce((sum, rating) => sum + rating, 0);
      form.setValue('score', totalScore);
    }
  }, [watchedRatings, criterios.length, form]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Evaluación - {evaluacion.evaluatedName}
          </CardTitle>
          <CardDescription>
            Tipo: {evaluacion.type} | Fecha: {new Date(evaluacion.date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Una vez que inicie la evaluación, debe completarla antes de salir. 
              No se guardan borradores parciales.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {criterios.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Criterios de Evaluación</h3>
                  {criterios.map((criterio, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">{criterio.nombre}</CardTitle>
                        <CardDescription>{criterio.descripcion}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name={`subcriteriosRatings.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                                  value={field.value?.toString()}
                                  className="grid grid-cols-5 gap-4"
                                >
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <div key={rating} className="flex items-center space-x-2">
                                      <RadioGroupItem value={rating.toString()} id={`${index}-${rating}`} />
                                      <Label htmlFor={`${index}-${rating}`}>{rating}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puntaje Total (sobre 20)</FormLabel>
                    <div className="text-2xl font-bold text-primary">
                      {field.value || 0}/20
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comentarios y Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escriba sus comentarios y observaciones sobre la evaluación..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelClick}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Completando...' : 'Completar Evaluación'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showExitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>¿Salir sin completar?</CardTitle>
              <CardDescription>
                Si sale ahora, perderá todo el progreso de esta evaluación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowExitWarning(false)}>
                  Continuar Evaluando
                </Button>
                <Button variant="destructive" onClick={confirmExit}>
                  Salir sin Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EvaluacionForm;
