import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Criterio {
  id: number;
  name: string;
}

interface Colaborador {
  id: number;
  fullName: string;
}

const EvaluacionSupervisionForm = () => {
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [selectedColaboradorId, setSelectedColaboradorId] = useState<number | null>(null);
  const [evaluacionData, setEvaluacionData] = useState<{ [criterioId: number]: boolean }>({});

  useEffect(() => {
    fetchCriterios();
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const response = await fetch('http://localhost:3309/api/colaboradores');
      const data = await response.json();
      setColaboradores(data.colaboradores || []);
    } catch (error) {
      toast.error('Error al cargar colaboradores');
    }
  };

  const fetchCriterios = async () => {
    try {
      const response = await fetch('http://localhost:3309/api/criterios');
      const data = await response.json();
      setCriterios(data.criterios || []);
    } catch (error) {
      toast.error('Error al cargar criterios');
    }
  };

  const handleCriterioChange = (criterioId: number, checked: boolean) => {
    setEvaluacionData(prevData => ({
      ...prevData,
      [criterioId]: checked,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedColaboradorId) {
      toast.error('Por favor, seleccione un colaborador.');
      return;
    }

    const evaluacion = {
      colaboradorId: selectedColaboradorId,
      resultados: Object.entries(evaluacionData)
        .filter(([_, value]) => value)
        .map(([criterioId, _]) => ({
          criterioId: parseInt(criterioId),
          cumple: true,
        })),
    };

    try {
      const response = await fetch('http://localhost:3309/api/evaluaciones/supervision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluacion),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la evaluación');
      }

      toast.success('Evaluación enviada con éxito.');
      setEvaluacionData({});
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario de Evaluación de Supervisión</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <Label htmlFor="colaborador">Colaborador a evaluar</Label>
          <Select onValueChange={(value) => setSelectedColaboradorId(parseInt(value))} defaultValue={selectedColaboradorId ? selectedColaboradorId.toString() : ''}>
            <SelectTrigger id="colaborador">
              <SelectValue placeholder="Seleccione un colaborador" />
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
        <div className="grid gap-2">
          {criterios.map((criterio) => (
            <div key={criterio.id} className="flex items-center space-x-2">
              <Checkbox
                id={`criterio-${criterio.id}`}
                checked={evaluacionData[criterio.id] || false}
                onCheckedChange={(checked) => handleCriterioChange(criterio.id, !!checked)}
              />
              <Label htmlFor={`criterio-${criterio.id}`}>{criterio.name}</Label>
            </div>
          ))}
        </div>
        <Button onClick={handleSubmit}>Enviar Evaluación</Button>
      </CardContent>
    </Card>
  );
};

export default EvaluacionSupervisionForm;
