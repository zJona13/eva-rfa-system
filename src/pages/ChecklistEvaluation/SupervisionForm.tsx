
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
  docente: z.string().min(1, 'Nombre del docente es requerido'),
  unidadDidactica: z.string().min(1, 'Unidad didáctica es requerida'),
  programaEstudios: z.string().min(1, 'Programa de estudios es requerido'),
  periodoAcademico: z.string().min(1, 'Periodo académico es requerido'),
  turno: z.string().min(1, 'Turno es requerido'),
  periodoLectivo: z.string().min(1, 'Periodo lectivo es requerido'),
  fecha: z.string().min(1, 'Fecha es requerida'),
  horaInicio: z.string().min(1, 'Hora de inicio es requerida'),
  horaTermino: z.string().min(1, 'Hora de término es requerida'),
  comentarios: z.string().optional(),
});

const subcriterios = [
  // PROGRAMACIÓN (2 puntos)
  { id: 'prog_1', section: 'PROGRAMACIÓN', text: 'El sílabo de la UD se encuentra actualizado y disponible en la plataforma virtual (ej. Chamilo).' },
  { id: 'prog_2', section: 'PROGRAMACIÓN', text: 'La sesión de aprendizaje desarrollada corresponde a lo programado en el sílabo y presenta su ficha.' },
  
  // MATERIALES EDUCATIVOS (3 puntos)
  { id: 'mat_1', section: 'MATERIALES EDUCATIVOS', text: 'Los materiales educativos son pertinentes a la sesión de aprendizaje (antes, durante y después).' },
  { id: 'mat_2', section: 'MATERIALES EDUCATIVOS', text: 'Los materiales educativos son visibles, claros y están organizados en la plataforma.' },
  { id: 'mat_3', section: 'MATERIALES EDUCATIVOS', text: 'Los materiales para actividades posteriores (guías, instrucciones) son adecuados y promueven el aprendizaje.' },
  
  // DESARROLLO (10 puntos)
  { id: 'des_1', section: 'DESARROLLO', text: 'Inicia la sesión de aprendizaje con puntualidad y saluda a los alumnos.' },
  { id: 'des_2', section: 'DESARROLLO', text: 'Registra la asistencia de los estudiantes (según modalidad) en la plataforma o medio establecido.' },
  { id: 'des_3', section: 'DESARROLLO', text: 'Establece/recuerda orientaciones (netiquetas, normas de convivencia) para la participación.' },
  { id: 'des_4', section: 'DESARROLLO', text: 'Realiza una actividad de motivación eficaz para generar la atención de los estudiantes.' },
  { id: 'des_5', section: 'DESARROLLO', text: 'Declara el tema a desarrollar y el logro de aprendizaje esperado para la sesión.' },
  { id: 'des_6', section: 'DESARROLLO', text: 'Desarrolla el contenido utilizando metodologías activas y participativas.' },
  { id: 'des_7', section: 'DESARROLLO', text: 'Prioriza el trabajo colaborativo durante la sesión.' },
  { id: 'des_8', section: 'DESARROLLO', text: 'Emplea una voz clara, modulada y un lenguaje técnico apropiado.' },
  { id: 'des_9', section: 'DESARROLLO', text: 'Responde a las preguntas e inquietudes de los estudiantes de manera efectiva.' },
  { id: 'des_10', section: 'DESARROLLO', text: 'Fomenta el desarrollo de valores, actitudes positivas y la construcción de aprendizajes propios.' },
  
  // EVALUACIÓN (5 puntos)
  { id: 'eval_1', section: 'EVALUACIÓN', text: 'La evaluación aplicada responde a los indicadores de logro de la sesión.' },
  { id: 'eval_2', section: 'EVALUACIÓN', text: 'Utiliza instrumentos de evaluación variados y adecuados al objeto de evaluación.' },
  { id: 'eval_3', section: 'EVALUACIÓN', text: 'Los criterios de evaluación son claros y comunicados previamente a los estudiantes.' },
  { id: 'eval_4', section: 'EVALUACIÓN', text: 'Realiza la retroalimentación del proceso de aprendizaje de forma individual y/o grupal.' },
  { id: 'eval_5', section: 'EVALUACIÓN', text: 'Comunica los resultados de la evaluación de manera oportuna y comprensible.' },
];

interface SupervisionFormProps {
  onSubmit: (data: any) => void;
  colaboradores: any[];
  isLoading?: boolean;
}

const SupervisionForm: React.FC<SupervisionFormProps> = ({ onSubmit, colaboradores, isLoading = false }) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selectedColaborador, setSelectedColaborador] = useState<string>('');

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
    if (!selectedColaborador) {
      toast.error('Debe seleccionar un docente para evaluar');
      return;
    }

    const totalScore = calculateTotalScore();
    
    const evaluacionData = {
      ...values,
      evaluatedId: parseInt(selectedColaborador),
      type: 'Ficha de Supervisión de Aprendizaje',
      score: totalScore,
      subcriterios: Object.entries(scores).map(([id, puntaje]) => ({
        idSubCriterio: id,
        puntajeObtenido: puntaje,
        descripcion: subcriterios.find(s => s.id === id)?.text || ''
      })),
      time: `${values.horaInicio}-${values.horaTermino}`,
      date: values.fecha,
      comments: values.comentarios
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
        <CardTitle>FICHA DE SUPERVISIÓN DE APRENDIZAJE (Escala Modificada)</CardTitle>
        <CardDescription>
          Evaluación realizada por el evaluador al docente durante una sesión de aprendizaje
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="colaborador">Docente a Evaluar *</Label>
                <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar docente" />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradores.map((colaborador) => (
                      <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                        {colaborador.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="unidadDidactica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad Didáctica *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la unidad didáctica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="programaEstudios"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programa de Estudios *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del programa de estudios" {...field} />
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

              <FormField
                control={form.control}
                name="turno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turno *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mañana">Mañana</SelectItem>
                          <SelectItem value="Tarde">Tarde</SelectItem>
                          <SelectItem value="Noche">Noche</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodoLectivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodo Lectivo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Semana 1-16" {...field} />
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
                name="horaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Inicio *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horaTermino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Término *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                <div><strong>1:</strong> Cumple Totalmente / Observado Satisfactoriamente</div>
                <div><strong>0.5:</strong> Cumple Parcialmente / Observado con Áreas de Mejora</div>
                <div><strong>0:</strong> No Cumple / No Observado</div>
              </div>
            </div>

            {/* Criterios de Evaluación */}
            <div className="space-y-6">
              {Object.entries(groupedSubcriterios).map(([section, items]) => (
                <div key={section} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 text-primary">{section}</h3>
                  <div className="space-y-4">
                    {items.map((subcriterio, index) => (
                      <div key={subcriterio.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded">
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{index + 1}.</span> {subcriterio.text}
                          </p>
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

            {/* Comentarios */}
            <FormField
              control={form.control}
              name="comentarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones, sugerencias o comentarios adicionales..."
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
                {isLoading ? 'Guardando...' : 'Guardar Evaluación'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SupervisionForm;
