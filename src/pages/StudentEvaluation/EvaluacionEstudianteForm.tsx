
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
import { subcriteriosEstudiante, getCriteriosAgrupados } from '@/data/evaluationCriteria';

interface Colaborador {
  id: number;
  fullName: string;
  roleName: string;
}

interface EvaluacionEstudianteFormProps {
  onCancel: () => void;
}

const EvaluacionEstudianteForm: React.FC<EvaluacionEstudianteFormProps> = ({ onCancel }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm();
  const { apiRequest } = useApiWithToken();
  const [selectedColaborador, setSelectedColaborador] = useState<string>('');
  const [subcriteriosRatings, setSubcriteriosRatings] = useState<Record<string, number>>({});

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

  // Agrupar subcriterios por criterio
  const criteriosAgrupados = getCriteriosAgrupados(subcriteriosEstudiante);

  const handleSubcriterioRating = (subcriterioId: string, rating: number) => {
    setSubcriteriosRatings(prev => ({
      ...prev,
      [subcriterioId]: rating
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(subcriteriosRatings).reduce((sum, rating) => sum + rating, 0);
  };

  const onSubmit = (data: any) => {
    if (!selectedColaborador) {
      toast.error('Debe seleccionar un colaborador para evaluar');
      return;
    }

    if (Object.keys(subcriteriosRatings).length !== subcriteriosEstudiante.length) {
      toast.error('Debe calificar todos los subcriterios');
      return;
    }

    const now = new Date();
    const evaluacionData = {
      type: 'Evaluacion estudiante-docente',
      evaluatorId: user?.id,
      evaluatedId: parseInt(selectedColaborador),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      score: calculateTotalScore(),
      comments: data.comentarios || null,
      status: 'Completada'
    };

    createEvaluacionMutation.mutate(evaluacionData);
  };

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fecha</Label>
                  <Input value={new Date().toLocaleDateString()} disabled />
                </div>
                <div>
                  <Label>Asignatura/Módulo</Label>
                  <Input placeholder="Nombre de la asignatura" {...form.register('asignatura')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Escala de Valoración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="font-semibold text-red-700">0 - En Desacuerdo</span>
                  </div>
                  <p className="text-sm text-red-600">Nunca / No se cumple</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="font-semibold text-yellow-700">0.5 - Parcialmente de Acuerdo</span>
                  </div>
                  <p className="text-sm text-yellow-600">A veces / Se cumple parcialmente</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-green-700">1 - Totalmente de Acuerdo</span>
                  </div>
                  <p className="text-sm text-green-600">Siempre / Se cumple totalmente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(criteriosAgrupados).map(([criterioNombre, subcriteriosGrupo], sectionIndex) => (
            <Card key={criterioNombre} className="border-l-4 border-l-purple-500">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                    {sectionIndex + 1}
                  </span>
                  {criterioNombre}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {subcriteriosGrupo.map((subcriterio, index) => (
                    <div key={subcriterio.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="mb-3">
                        <Label className="text-base font-medium text-gray-800">
                          <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-bold mr-2">
                            {index + 1}
                          </span>
                          {subcriterio.texto}
                        </Label>
                      </div>
                      <RadioGroup
                        value={subcriteriosRatings[subcriterio.id]?.toString() || ''}
                        onValueChange={(value) => handleSubcriterioRating(subcriterio.id, parseFloat(value))}
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-center space-x-2 bg-red-50 p-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                          <RadioGroupItem value="0" id={`${subcriterio.id}-0`} className="border-red-500 text-red-500" />
                          <Label htmlFor={`${subcriterio.id}-0`} className="text-red-700 font-medium cursor-pointer">
                            0 - En Desacuerdo
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-yellow-50 p-2 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors">
                          <RadioGroupItem value="0.5" id={`${subcriterio.id}-0.5`} className="border-yellow-500 text-yellow-500" />
                          <Label htmlFor={`${subcriterio.id}-0.5`} className="text-yellow-700 font-medium cursor-pointer">
                            0.5 - Parcialmente de Acuerdo
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-green-50 p-2 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                          <RadioGroupItem value="1" id={`${subcriterio.id}-1`} className="border-green-500 text-green-500" />
                          <Label htmlFor={`${subcriterio.id}-1`} className="text-green-700 font-medium cursor-pointer">
                            1 - Totalmente de Acuerdo
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-gradient-to-r from-green-50 to-purple-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 text-center">Puntaje Total Obtenido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center text-green-600">
                {calculateTotalScore()}/20
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-600">
                  Progreso: {Math.round((calculateTotalScore() / 20) * 100)}%
                </span>
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
                        className="min-h-[100px]"
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createEvaluacionMutation.isPending || !selectedColaborador}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {createEvaluacionMutation.isPending ? 'Guardando...' : 'Guardar Evaluación'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EvaluacionEstudianteForm;
