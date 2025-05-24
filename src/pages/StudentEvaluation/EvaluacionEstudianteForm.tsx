
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const formSchema = z.object({
  profesor: z.string().min(1, 'Debe seleccionar un profesor'),
  asignaturaModulo: z.string().min(1, 'Asignatura/Módulo es requerido'),
  fecha: z.string().min(1, 'Fecha es requerida'),
  valoroMas: z.string().optional(),
  sugerencias: z.string().optional(),
});

const subcriterios = [
  // I. ORGANIZACIÓN DE LA ASIGNATURA (2 puntos)
  { id: 'org_1', section: 'I. ORGANIZACIÓN DE LA ASIGNATURA', text: '1.1. El profesor/a deja claro desde el inicio cómo se desarrollará la asignatura (sílabo, cronograma).' },
  { id: 'org_2', section: 'I. ORGANIZACIÓN DE LA ASIGNATURA', text: '1.2. Las clases siguen una estructura y planificación comprensible.' },
  
  // II. MATERIALES EDUCATIVOS (3 puntos)
  { id: 'mat_1', section: 'II. MATERIALES EDUCATIVOS', text: '2.1. Los materiales que usa el/la profesor/a (presentaciones, lecturas, etc.) me ayudan a entender los temas.' },
  { id: 'mat_2', section: 'II. MATERIALES EDUCATIVOS', text: '2.2. Los materiales son claros y están bien organizados en la plataforma del curso.' },
  { id: 'mat_3', section: 'II. MATERIALES EDUCATIVOS', text: '2.3. El profesor/a proporciona guías o instrucciones claras para las tareas o trabajos fuera de clase.' },
  
  // III. DESARROLLO DE LAS CLASES Y ENSEÑANZA (10 puntos)
  { id: 'des_1', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.1. El/La profesor/a es puntual y aprovecha bien el tiempo de la clase.' },
  { id: 'des_2', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.2. El/La profesor/a explica los temas de forma que los entiendo.' },
  { id: 'des_3', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.3. El/La profesor/a utiliza ejemplos o actividades que facilitan mi aprendizaje.' },
  { id: 'des_4', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.4. El/La profesor/a fomenta mi participación en clase.' },
  { id: 'des_5', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.5. Se promueve el trabajo en equipo y la colaboración entre compañeros.' },
  { id: 'des_6', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.6. El/La profesor/a se expresa con claridad (voz, lenguaje).' },
  { id: 'des_7', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.7. El/La profesor/a responde mis preguntas de manera clara y respetuosa.' },
  { id: 'des_8', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.8. El/La profesor/a muestra entusiasmo por los temas que enseña.' },
  { id: 'des_9', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.9. Siento un ambiente de respeto y confianza en sus clases.' },
  { id: 'des_10', section: 'III. DESARROLLO DE LAS CLASES Y ENSEÑANZA', text: '3.10. El/La profesor/a me anima a pensar por mí mismo/a y a ser crítico/a.' },
  
  // IV. EVALUACIÓN Y RETROALIMENTACIÓN (5 puntos)
  { id: 'eval_1', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.1. Las evaluaciones (exámenes, trabajos) se relacionan con lo que se enseña en clase.' },
  { id: 'eval_2', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.2. El/La profesor/a explica claramente cómo seremos evaluados.' },
  { id: 'eval_3', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.3. Considero que la forma de evaluar del profesor/a es justa.' },
  { id: 'eval_4', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.4. El/La profesor/a me da comentarios útiles (retroalimentación) sobre mis trabajos o mi desempeño.' },
  { id: 'eval_5', section: 'IV. EVALUACIÓN Y RETROALIMENTACIÓN', text: '4.5. El/La profesor/a entrega los resultados de las evaluaciones en un tiempo razonable.' },
];

interface EvaluacionEstudianteFormProps {
  onSubmit: (data: any) => void;
  colaboradores: any[];
  isLoading?: boolean;
}

const EvaluacionEstudianteForm: React.FC<EvaluacionEstudianteFormProps> = ({ onSubmit, colaboradores, isLoading = false }) => {
  const [scores, setScores] = useState<Record<string, number>>({});

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

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((total, score) => total + score, 0);
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const totalScore = calculateTotalScore();
    
    const evaluacionData = {
      ...values,
      evaluatedId: parseInt(values.profesor),
      type: 'Evaluación del Docente por el Estudiante',
      score: totalScore,
      subcriterios: Object.entries(scores).map(([id, puntaje]) => ({
        idSubCriterio: id,
        puntajeObtenido: puntaje,
        descripcion: subcriterios.find(s => s.id === id)?.text || ''
      })),
      time: new Date().toTimeString().split(' ')[0],
      date: values.fecha,
      comments: `Lo que más valoro: ${values.valoroMas || 'No especificado'}\n\nSugerencias: ${values.sugerencias || 'Ninguna'}`
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>EVALUACIÓN DEL DOCENTE POR EL ESTUDIANTE (Escala Modificada)</CardTitle>
        <CardDescription>
          Tu opinión es muy importante para ayudarnos a mejorar. Te pedimos que respondas con sinceridad. Esta evaluación es anónima.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="profesor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profesor(a) *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar profesor(a)" />
                        </SelectTrigger>
                        <SelectContent>
                          {colaboradores.map((colaborador) => (
                            <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                              {colaborador.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            {/* Escala de Valoración */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Escala de Valoración por Subcriterio:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div><strong>1:</strong> Totalmente de Acuerdo / Siempre</div>
                <div><strong>0.5:</strong> De Acuerdo Parcialmente / A Veces</div>
                <div><strong>0:</strong> En Desacuerdo / Nunca</div>
              </div>
            </div>

            {/* Criterios de Evaluación */}
            <div className="space-y-6">
              {Object.entries(groupedSubcriterios).map(([section, items]) => (
                <div key={section} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 text-primary">{section}</h3>
                  <div className="space-y-4">
                    {items.map((subcriterio) => (
                      <div key={subcriterio.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded">
                        <div className="flex-1">
                          <p className="text-sm">{subcriterio.text}</p>
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
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Puntaje Total */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">PUNTAJE TOTAL OBTENIDO: {calculateTotalScore()}/20</h3>
            </div>

            {/* Comentarios Adicionales */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="valoroMas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lo que más valoro de este(a) profesor(a) es:</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Comparte lo que más aprecias de este profesor..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sugerencias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sugerencias para que el/la profesor(a) pueda mejorar:</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Comparte sugerencias constructivas para ayudar al profesor a mejorar..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Limpiar Formulario
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Evaluación'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EvaluacionEstudianteForm;
