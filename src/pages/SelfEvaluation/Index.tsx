
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const SelfEvaluation = () => {
  const [showEvaluation, setShowEvaluation] = React.useState(false);
  
  // Sample evaluation data
  const evaluationData = {
    title: 'Autoevaluación Docente - Periodo 2025-I',
    status: 'active',
    dueDate: '2025-06-30',
    progress: 0,
    criteria: [
      { id: 1, category: 'Pedagógico', text: 'Promuevo el pensamiento crítico y la resolución de problemas', value: '' },
      { id: 2, category: 'Pedagógico', text: 'Utilizo diversas estrategias de enseñanza adaptadas a diferentes estilos de aprendizaje', value: '' },
      { id: 3, category: 'Pedagógico', text: 'Diseño actividades que promueven el aprendizaje colaborativo y significativo', value: '' },
      { id: 4, category: 'Académico', text: 'Domino los contenidos de las asignaturas que imparto', value: '' },
      { id: 5, category: 'Académico', text: 'Actualizo regularmente los contenidos de mis cursos', value: '' },
      { id: 6, category: 'Gestión', text: 'Cumplo puntualmente con la documentación académica requerida', value: '' },
      { id: 7, category: 'Gestión', text: 'Participo activamente en reuniones académicas y de coordinación', value: '' },
    ]
  };

  const handleStartEvaluation = () => {
    setShowEvaluation(true);
  };

  const handleSaveDraft = () => {
    toast.success('Borrador guardado correctamente');
  };

  const handleSubmitEvaluation = () => {
    toast.success('Autoevaluación enviada correctamente');
    setShowEvaluation(false);
  };

  const renderEvaluationList = () => {
    return (
      <div className="space-y-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Autoevaluación Docente - Periodo 2025-I</CardTitle>
              <div className="flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Clock className="h-3 w-3 mr-1" /> Activo
              </div>
            </div>
            <CardDescription>Fecha límite: 30 de junio de 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">7 criterios</span> · Tiempo estimado: 15 minutos
              </div>
              <Button onClick={handleStartEvaluation}>Iniciar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Autoevaluación Docente - Periodo 2024-II</CardTitle>
              <div className="flex items-center px-2 py-1 rounded-full bg-ies-success-50 text-ies-success-500 text-xs font-medium">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Completado
              </div>
            </div>
            <CardDescription>Finalizado: 15 de enero de 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">7 criterios</span> · Calificación: 92/100
              </div>
              <Button variant="outline">Ver resultados</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEvaluationForm = () => {
    return (
      <Card>
        <CardHeader className="border-b bg-muted/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>{evaluationData.title}</CardTitle>
              <CardDescription className="mt-1">
                Complete todos los criterios para enviar su autoevaluación
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setShowEvaluation(false)}>
                Cancelar
              </Button>
              <Button variant="secondary" onClick={handleSaveDraft}>
                Guardar borrador
              </Button>
              <Button onClick={handleSubmitEvaluation}>
                Enviar evaluación
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            {['Pedagógico', 'Académico', 'Gestión'].map((category) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-medium">{category}</h3>
                <Separator />
                
                {evaluationData.criteria
                  .filter(c => c.category === category)
                  .map((criterion) => (
                    <div key={criterion.id} className="space-y-2">
                      <p className="text-sm font-medium">{criterion.text}</p>
                      <div className="flex flex-wrap gap-2">
                        {['Nunca', 'Raramente', 'A veces', 'Frecuentemente', 'Siempre'].map((option) => (
                          <label key={option} className="flex items-center space-x-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-muted">
                            <input 
                              type="radio" 
                              name={`criterion-${criterion.id}`} 
                              value={option} 
                              className="accent-primary"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                      <div className="pt-2">
                        <label className="text-sm text-muted-foreground">Comentarios (opcional):</label>
                        <textarea 
                          className="w-full mt-1 p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                          rows={2}
                          placeholder="Agregue comentarios o evidencias adicionales..."
                        ></textarea>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Autoevaluación del Personal</h1>
        <p className="text-muted-foreground mt-2">
          Complete su autoevaluación según los criterios establecidos para el periodo vigente.
        </p>
      </div>

      {showEvaluation ? renderEvaluationForm() : renderEvaluationList()}
    </div>
  );
};

export default SelfEvaluation;
