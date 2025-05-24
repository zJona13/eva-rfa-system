
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const formSchema = z.object({
  asignaturaModulo: z.string().min(1, 'Asignatura/Módulo es requerido'),
  fecha: z.string().min(1, 'Fecha es requerida'),
  periodoAcademico: z.string().min(1, 'Periodo académico es requerido'),
  comentarios: z.string().optional(),
});

const subcriterios = [
  // I. PLANIFICACIÓN Y PROGRAMACIÓN (2 puntos)
  { id: 'plan_1', section: 'I. PLANIFICACIÓN Y PROGRAMACIÓN', text: '1.1. Mantengo el sílabo actualizado y fácilmente accesible para los estudiantes.' },
  { id: 'plan_2', section: 'I. PLANIFICACIÓN Y PROGRAMACIÓN', text: '1.2. Mis sesiones de aprendizaje se desarrollan conforme a lo planificado en el sílabo y cuento con la ficha de sesión.' },
  
  // II. MATERIALES EDUCATIVOS (3 puntos)
  { id: 'mat_1', section: 'II. MATERIALES EDUCATIVOS', text: '2.1. Selecciono y diseño materiales educativos pertinentes para los diferentes momentos de la sesión.' },
  { id: 'mat_2', section: 'II. MATERIALES EDUCATIVOS', text: '2.2. Aseguro que los materiales sean claros, visualmente adecuados y estén bien organizados en la plataforma.' },
  { id: 'mat_3', section: 'II. MATERIALES EDUCATIVOS', text: '2.3. Los materiales para actividades asincrónicas (guías, rúbricas) están bien estructurados y fomentan la autonomía.' },
  
  // III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA (10 puntos)
  { id: 'des_1', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.1. Inicio mis clases puntualmente y establezco un ambiente cordial.' },
  { id: 'des_2', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.2. Verifico la asistencia y las condiciones para la participación (normas, netiquetas).' },
  { id: 'des_3', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.3. Capto el interés de los estudiantes mediante estrategias de motivación efectivas.' },
  { id: 'des_4', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.4. Comunico con claridad el tema y los objetivos de aprendizaje de la sesión.' },
  { id: 'des_5', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.5. Aplico metodologías activas que involucran al estudiante en su proceso de aprendizaje.' },
  { id: 'des_6', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.6. Promuevo el trabajo colaborativo y la interacción entre estudiantes.' },
  { id: 'des_7', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.7. Mi expresión oral es clara, con volumen y modulación adecuados, utilizando un lenguaje preciso.' },
  { id: 'des_8', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.8. Atiendo y resuelvo las dudas de los estudiantes de forma paciente y clara.' },
  { id: 'des_9', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.9. Fomento la reflexión, el pensamiento crítico y la construcción autónoma del conocimiento.' },
  { id: 'des_10', section: 'III. DESARROLLO DE LA SESIÓN Y METODOLOGÍA', text: '3.10. Integro el desarrollo de valores y actitudes positivas en mis sesiones.' },
  
  // IV. EVALUACIÓN Y RETROALIMENTACIÓN (5 puntos)
  { id: 'eval_1', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.1. Diseño evaluaciones coherentes con los indicadores de logro propuestos.' },
  { id: 'eval_2', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.2. Utilizo diversidad de instrumentos y técnicas de evaluación apropiados.' },
  { id: 'eval_3', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.3. Doy a conocer los criterios de evaluación de forma anticipada y clara.' },
  { id: 'eval_4', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.4. Ofrezco retroalimentación continua, específica y constructiva a los estudiantes.' },
  { id: 'eval_5', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.5. Comunico los resultados de las evaluaciones en los plazos establecidos y de forma que faciliten la comprensión.' },
];

interface AutoevaluacionFormProps {
  onSubmit: (data: any) => void;
  docenteName: string;
  isLoading?: boolean;
}

const AutoevaluacionForm: React.FC<AutoevaluacionFormProps> = ({ onSubmit, docenteName, isLoading = false }) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
    },
  });

  const handleScoreChange = (subcriterioId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [subcriterioId]: score
    }));
  };

  const handleObservacionChange = (subcriterioId: string, observacion: string) => {
    setObservaciones(prev => ({
      ...prev,
      [subcriterioId]: observacion
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((total, score) => total + score, 0);
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const totalScore = calculateTotalScore();
    
    const evaluacionData = {
      ...values,
      type: 'Autoevaluación Docente',
      score: totalScore,
      subcriterios: Object.entries(scores).map(([id, puntaje]) => ({
        idSubCriterio: id,
        puntajeObtenido: puntaje,
        descripcion: `${subcriterios.find(s => s.id === id)?.text || ''} - Observaciones: ${observaciones[id] || 'Ninguna'}`
      })),
      time: new Date().toTimeString().split(' ')[0],
      date: values.fecha,
      comments: values.comentarios,
      observaciones: observaciones
    };

    onSubmit(evaluacionData);
  };

  const groupedSubcriterios = subcriterios.reduce((acc, subcriterio) => {
    if (!acc[subcriterio.section]) {
      acc[subcriterio.section] = [];
    }
    acc[subcriterio.section].push(subcriterio);
    return acc;
  }, {} as Record<string, typeof subcriterios>);

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>AUTOEVALUACIÓN DOCENTE (Escala Modificada)</CardTitle>
        <CardDescription>
          Reflexiona sobre tu desempeño y marca la opción que mejor describa tu práctica para cada subcriterio
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Docente</Label>
                <Input value={docenteName} disabled className="bg-muted" />
              </div>

              <FormField
                control={form.control}
                name="asignaturaModulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignatura/Módulo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la asignatura o módulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodoAcademico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodo Académico *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 2024-I" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Instrucciones */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Instrucciones:</h3>
              <p className="text-sm mb-4">Reflexiona sobre tu desempeño y marca la opción que mejor describa tu práctica para cada subcriterio.</p>
              
              <h4 className="font-semibold mb-2">Escala de Valoración por Subcriterio:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div><strong>1:</strong> Logrado Totalmente / Siempre</div>
                <div><strong>0.5:</strong> Logrado Parcialmente / A Veces</div>
                <div><strong>0:</strong> No Logrado / Nunca</div>
              </div>
            </div>

            {/* Criterios de Evaluación */}
            <div className="space-y-6">
              {Object.entries(groupedSubcriterios).map(([section, items]) => (
                <div key={section} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 text-primary">{section}</h3>
                  <div className="space-y-4">
                    {items.map((subcriterio) => (
                      <div key={subcriterio.id} className="space-y-3 p-3 bg-muted/50 rounded">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{subcriterio.text}</p>
                          </div>
                          <RadioGroup
                            value={scores[subcriterio.id]?.toString() || ''}
                            onValueChange={(value) => handleScoreChange(subcriterio.id, parseFloat(value))}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="0" id={`${subcriterio.id}_0`} />
                              <Label htmlFor={`${subcriterio.id}_0`}>0</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="0.5" id={`${subcriterio.id}_0.5`} />
                              <Label htmlFor={`${subcriterio.id}_0.5`}>0.5</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id={`${subcriterio.id}_1`} />
                              <Label htmlFor={`${subcriterio.id}_1`}>1</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label htmlFor={`obs_${subcriterio.id}`} className="text-xs text-muted-foreground">
                            Observaciones / Áreas de Mejora:
                          </Label>
                          <Textarea
                            id={`obs_${subcriterio.id}`}
                            placeholder="Reflexiones, observaciones o áreas identificadas para mejorar..."
                            value={observaciones[subcriterio.id] || ''}
                            onChange={(e) => handleObservacionChange(subcriterio.id, e.target.value)}
                            className="mt-1 min-h-[60px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Puntaje Total */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">PUNTAJE TOTAL OBTENIDO: {calculateTotalScore()}/20</h3>
            </div>

            {/* Comentarios */}
            <FormField
              control={form.control}
              name="comentarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Reflexiones generales, metas de mejora, o comentarios adicionales sobre tu desempeño..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Limpiar Formulario
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Autoevaluación'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AutoevaluacionForm;
