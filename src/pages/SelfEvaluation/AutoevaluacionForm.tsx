
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3306/api';

interface Subcriterio {
  idSubCriterio: number;
  texto: string;
  puntaje: number;
  idCriterio: number;
  criterioNombre: string;
}

const fetchSubcriterios = async () => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/subcriterios`, {
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

interface AutoevaluacionFormProps {
  onCancel: () => void;
}

const AutoevaluacionForm: React.FC<AutoevaluacionFormProps> = ({ onCancel }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm();
  const [subcriteriosRatings, setSubcriteriosRatings] = useState<Record<number, number>>({});

  // Fetch subcriterios
  const { data: subcriteriosData, isLoading: isLoadingSubcriterios } = useQuery({
    queryKey: ['subcriterios'],
    queryFn: fetchSubcriterios,
  });

  const createEvaluacionMutation = useMutation({
    mutationFn: createEvaluacion,
    onSuccess: () => {
      toast.success('Autoevaluación creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['evaluaciones-colaborador'] });
      onCancel();
    },
    onError: (error: any) => {
      toast.error(`Error al crear autoevaluación: ${error.message}`);
    },
  });

  const subcriterios: Subcriterio[] = subcriteriosData?.subcriterios || [];

  // Agrupar subcriterios por criterio
  const criteriosAgrupados = subcriterios.reduce((acc, subcriterio) => {
    if (!acc[subcriterio.criterioNombre]) {
      acc[subcriterio.criterioNombre] = [];
    }
    acc[subcriterio.criterioNombre].push(subcriterio);
    return acc;
  }, {} as Record<string, Subcriterio[]>);

  const handleSubcriterioRating = (subcriterioId: number, rating: number) => {
    setSubcriteriosRatings(prev => ({
      ...prev,
      [subcriterioId]: rating
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(subcriteriosRatings).reduce((sum, rating) => sum + rating, 0);
  };

  const onSubmit = (data: any) => {
    if (Object.keys(subcriteriosRatings).length !== subcriterios.length) {
      toast.error('Debe calificar todos los subcriterios');
      return;
    }

    const now = new Date();
    const evaluacionData = {
      type: 'Autoevaluación Docente',
      evaluatorId: user?.id,
      evaluatedId: user?.colaboradorId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      score: calculateTotalScore(),
      comments: data.comentarios || null,
      status: 'Completada',
      subcriterios: Object.entries(subcriteriosRatings).map(([subcriterioId, puntaje]) => ({
        idSubCriterio: parseInt(subcriterioId),
        puntajeObtenido: puntaje,
        descripcion: null
      }))
    };

    createEvaluacionMutation.mutate(evaluacionData);
  };

  if (isLoadingSubcriterios) {
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
          <h1 className="text-2xl font-bold">Autoevaluación Docente</h1>
          <p className="text-muted-foreground">Reflexiona sobre tu desempeño y marca la opción que mejor describa tu práctica</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Autoevaluación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Docente</Label>
                  <Input value={user?.name || ''} disabled />
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input value={new Date().toLocaleDateString()} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(criteriosAgrupados).map(([criterioNombre, subcriteriosGrupo]) => (
            <Card key={criterioNombre}>
              <CardHeader>
                <CardTitle className="text-lg">{criterioNombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subcriteriosGrupo.map((subcriterio) => (
                    <div key={subcriterio.idSubCriterio} className="space-y-2">
                      <Label className="text-sm">{subcriterio.texto}</Label>
                      <RadioGroup
                        value={subcriteriosRatings[subcriterio.idSubCriterio]?.toString() || ''}
                        onValueChange={(value) => handleSubcriterioRating(subcriterio.idSubCriterio, parseFloat(value))}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id={`${subcriterio.idSubCriterio}-0`} />
                          <Label htmlFor={`${subcriterio.idSubCriterio}-0`} className="text-sm">
                            0 - No Logrado
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0.5" id={`${subcriterio.idSubCriterio}-0.5`} />
                          <Label htmlFor={`${subcriterio.idSubCriterio}-0.5`} className="text-sm">
                            0.5 - Logrado Parcialmente
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id={`${subcriterio.idSubCriterio}-1`} />
                          <Label htmlFor={`${subcriterio.idSubCriterio}-1`} className="text-sm">
                            1 - Logrado Totalmente
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
                        placeholder="Escriba sus reflexiones y áreas de mejora..."
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
              disabled={createEvaluacionMutation.isPending}
            >
              {createEvaluacionMutation.isPending ? 'Guardando...' : 'Guardar Autoevaluación'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AutoevaluacionForm;
