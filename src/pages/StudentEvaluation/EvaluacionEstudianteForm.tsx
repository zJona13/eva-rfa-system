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
  description: string;
}

interface Colaborador {
  id: number;
  fullName: string;
}

const EvaluacionEstudianteForm = () => {
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [selectedColaboradorId, setSelectedColaboradorId] = useState<number | null>(null);
  const [evaluacionData, setEvaluacionData] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchCriterios();
  }, []);

  const fetchCriterios = async () => {
    try {
      const response = await fetch('http://localhost:3309/api/criterios');
      const data = await response.json();
      setCriterios(data.criterios || []);
    } catch (error) {
      toast.error('Error al cargar criterios');
    }
  };

  const handleCriterioChange = (criterioId: number, value: boolean) => {
    setEvaluacionData(prevData => ({
      ...prevData,
      [criterioId]: value,
    }));
  };

  const handleSubmit = () => {
    if (!selectedColaboradorId) {
      toast.error('Por favor, seleccione un colaborador.');
      return;
    }

    const evaluacion = {
      colaboradorId: selectedColaboradorId,
      criterios: Object.keys(evaluacionData).map(key => ({
        criterioId: parseInt(key),
        cumple: evaluacionData[parseInt(key)],
      })),
    };

    console.log('Datos de la evaluación a enviar:', evaluacion);
    toast.success('Evaluación enviada exitosamente');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario de Evaluación a Estudiantes</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="colaborador">Seleccionar Estudiante</Label>
          <Select onValueChange={(value) => setSelectedColaboradorId(parseInt(value))}>
            <SelectTrigger id="colaborador">
              <SelectValue placeholder="Seleccione un estudiante" />
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

        <div className="grid gap-4">
          {criterios.map((criterio) => (
            <div key={criterio.id} className="flex items-center space-x-2">
              <Checkbox
                id={`criterio-${criterio.id}`}
                checked={evaluacionData[criterio.id] || false}
                onCheckedChange={(checked) => handleCriterioChange(criterio.id, !!checked)}
              />
              <div className="grid gap-1 leading-none">
                <Label htmlFor={`criterio-${criterio.id}`}>{criterio.name}</Label>
                <p className="text-sm text-muted-foreground">{criterio.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit}>Enviar Evaluación</Button>
      </CardContent>
    </Card>
  );
};

export default EvaluacionEstudianteForm;
