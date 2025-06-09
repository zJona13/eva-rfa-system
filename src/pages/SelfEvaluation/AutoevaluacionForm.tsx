import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Criterio {
  id: number;
  name: string;
  descripcion: string;
}

interface Colaborador {
  id: number;
  fullName: string;
}

const AutoevaluacionForm = () => {
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [selectedColaboradorId, setSelectedColaboradorId] = useState<number | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<{ [criterioId: number]: number }>({});
  const [comentarios, setComentarios] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCriterios();
    fetchColaboradores();
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

  const fetchColaboradores = async () => {
    try {
      const response = await fetch('http://localhost:3309/api/colaboradores');
      const data = await response.json();
      setColaboradores(data.colaboradores || []);
    } catch (error) {
      toast.error('Error al cargar colaboradores');
    }
  };

  const handleColaboradorChange = (colaboradorId: number) => {
    setSelectedColaboradorId(colaboradorId);
  };

  const handleEvaluacionChange = (criterioId: number, value: number) => {
    setEvaluaciones(prev => ({ ...prev, [criterioId]: value }));
  };

  const handleComentariosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComentarios(e.target.value);
  };

  const isFormValid = () => {
    if (!selectedColaboradorId) {
      toast.error('Por favor, seleccione un colaborador.');
      return false;
    }

    if (Object.keys(evaluaciones).length !== criterios.length) {
      toast.error('Por favor, evalúe todos los criterios.');
      return false;
    }

    return true;
  };

  const submitEvaluacion = async (evaluacionData: any) => {
    try {
      const response = await fetch('http://localhost:3309/api/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluacionData)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      toast.success('Autoevaluación enviada exitosamente');
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar autoevaluación');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    setIsLoading(true);
    try {
      const evaluacionData = {
        colaboradorId: selectedColaboradorId,
        evaluadorId: user?.colaboradorId,
        criteriosEvaluacion: Object.entries(evaluaciones).map(([criterioId, valor]) => ({
          criterioId: Number(criterioId),
          valor: Number(valor)
        })),
        comentarios: comentarios
      };

      await submitEvaluacion(evaluacionData);
      navigate('/self-evaluation');
    } catch (error) {
      console.error('Error al enviar la autoevaluación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Autoevaluación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="colaborador">Seleccione su nombre:</Label>
              <Select onValueChange={(value) => handleColaboradorChange(Number(value))}>
                <SelectTrigger id="colaborador">
                  <SelectValue placeholder="Seleccione un colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map(colaborador => (
                    <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                      {colaborador.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {criterios.map(criterio => (
              <div key={criterio.id}>
                <Label htmlFor={`criterio-${criterio.id}`}>{criterio.name}</Label>
                <p className="text-sm text-muted-foreground">{criterio.descripcion}</p>
                <div className="flex items-center space-x-4 mt-2">
                  {[1, 2, 3, 4, 5].map(valor => (
                    <div key={valor} className="flex items-center space-x-2">
                      <Input
                        type="radio"
                        id={`criterio-${criterio.id}-${valor}`}
                        name={`criterio-${criterio.id}`}
                        value={valor.toString()}
                        onChange={() => handleEvaluacionChange(criterio.id, valor)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`criterio-${criterio.id}-${valor}`}>{valor}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <Label htmlFor="comentarios">Comentarios Adicionales:</Label>
              <Textarea
                id="comentarios"
                value={comentarios}
                onChange={handleComentariosChange}
                placeholder="Ingrese aquí sus comentarios adicionales"
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Autoevaluación"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoevaluacionForm;
