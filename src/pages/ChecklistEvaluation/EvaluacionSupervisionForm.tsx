
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
import { ArrowLeft } from 'lucide-react';
import { subcriteriosSupervision, getCriteriosAgrupados } from '@/data/evaluationCriteria';

const API_BASE_URL = 'http://localhost:3306/api';

interface Colaborador {
  id: number;
  fullName: string;
  roleName: string;
}

const fetchColaboradores = async () => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/colaboradores-para-evaluar`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const createEvaluacion = async (evaluacionData: any) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/evaluaciones`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(evaluacionData),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

interface EvaluacionSupervisionFormProps {
  onCancel: () => void;
}

const EvaluacionSupervisionForm: React.FC<EvaluacionSupervisionFormProps> = ({ onCancel }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm();
  const [selectedColaborador, setSelectedColaborador] = useState<string>('');
  const [subcriteriosRatings, setSubcriteriosRatings] = useState<Record<string, number>>({});

  // Fetch colaboradores
  const { data: colaboradoresData, isLoading: isLoadingColaboradores } = useQuery({
    queryKey: ['colaboradores-para-evaluar'],
    queryFn: fetchColaboradores,
  });

  const createEvaluacionMutation = useMutation({
    mutationFn: createEvaluacion,
    onSuccess: () => {
      toast.success('Evaluación creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['evaluaciones-evaluador'] });
      onCancel();
    },
    onError: (error: any) => {
      toast.error(`Error al crear evaluación: ${error.message}`);
    },
  });

  const colaboradores: Colaborador[] = colaboradoresData?.colaboradores || [];

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

  const onSubmit = (data: any) => {
    if (!selectedColaborador) {
      toast.error('Debe seleccionar un colaborador para evaluar');
      return;
    }

    if (Object.keys(subcriteriosRatings).length !== subcriteriosSupervision.length) {
      toast.error('Debe calificar todos los subcriterios');
      return;
    }

    const now = new Date();
    const evaluacionData = {
      type: 'Ficha de Supervisión de Aprendizaje',
      evaluatorId: user?.id,
      evaluatedId: parseInt(selectedColaborador),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      score: calculateTotalScore(),
      comments: data.comentarios || null,
      status: 'Completada',
      subcriterios: Object.entries(subcriteriosRatings).map(([subcriterioId, puntaje]) => ({
        idSubCriterio: subcriterioId,
        puntajeObtenido: puntaje,
        descripcion: null
      }))
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
          <h1 className="text-2xl font-bold">Ficha de Supervisión de Aprendizaje</h1>
          <p className="text-muted-foreground">Evalúa el desempeño docente utilizando criterios predefinidos</p>
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
                <Label htmlFor="colaborador">Docente a evaluar</Label>
                <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un docente" />
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Fecha</Label>
                  <Input value={new Date().toLocaleDateString()} disabled />
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
            </CardContent>
          </Card>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Escala de Valoración por Subcriterio:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div><strong>1:</strong> Cumple Totalmente / Observado Satisfactoriamente</div>
              <div><strong>0.5:</strong> Cumple Parcialmente / Observado con Áreas de Mejora</div>
              <div><strong>0:</strong> No Cumple / No Observado</div>
            </div>
          </div>

          {Object.entries(criteriosAgrupados).map(([criterioNombre, subcriteriosGrupo]) => (
            <Card key={criterioNombre}>
              <CardHeader>
                <CardTitle className="text-lg">{criterioNombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subcriteriosGrupo.map((subcriterio, index) => (
                    <div key={subcriterio.id} className="space-y-2">
                      <Label className="text-sm">
                        <span className="font-medium">{index + 1}.</span> {subcriterio.texto}
                      </Label>
                      <RadioGroup
                        value={subcriteriosRatings[subcriterio.id]?.toString() || ''}
                        onValueChange={(value) => handleSubcriterioRating(subcriterio.id, parseFloat(value))}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id={`${subcriterio.id}-0`} />
                          <Label htmlFor={`${subcriterio.id}-0`} className="text-sm">
                            0 - No Cumple
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0.5" id={`${subcriterio.id}-0.5`} />
                          <Label htmlFor={`${subcriterio.id}-0.5`} className="text-sm">
                            0.5 - Cumple Parcialmente
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id={`${subcriterio.id}-1`} />
                          <Label htmlFor={`${subcriterio.id}-1`} className="text-sm">
                            1 - Cumple Totalmente
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Puntaje Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                {calculateTotalScore()}/20
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
            >
              {createEvaluacionMutation.isPending ? 'Guardando...' : 'Guardar Evaluación'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EvaluacionSupervisionForm;
