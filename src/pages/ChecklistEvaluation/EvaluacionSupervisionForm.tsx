import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EvaluacionSupervisionFormProps {
  onCancel: () => void;
  evaluacionDraft?: any;
}

interface FormData {
  [key: string]: string;
}

const EvaluacionSupervisionForm = ({ onCancel, evaluacionDraft }: EvaluacionSupervisionFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    nombreEvaluador: evaluacionDraft?.nombreEvaluador || '',
    nombreEvaluado: evaluacionDraft?.nombreEvaluado || '',
    fechaEvaluacion: evaluacionDraft?.fechaEvaluacion || '',
    observaciones: evaluacionDraft?.observaciones || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tipo: 'supervision',
          estado: 'pendiente'
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar la evaluación');
      }

      const result = await response.json();
      console.log('Evaluación guardada:', result);
      
      toast.success('Evaluación guardada exitosamente');
      onCancel();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la evaluación');
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-5">Formulario de Evaluación de Supervisión</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(formData);
      }} className="space-y-4">
        <div>
          <Label htmlFor="nombreEvaluador">Nombre del Evaluador:</Label>
          <Input
            type="text"
            id="nombreEvaluador"
            name="nombreEvaluador"
            value={formData.nombreEvaluador}
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="nombreEvaluado">Nombre del Evaluado:</Label>
          <Input
            type="text"
            id="nombreEvaluado"
            name="nombreEvaluado"
            value={formData.nombreEvaluado}
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="fechaEvaluacion">Fecha de Evaluación:</Label>
          <Input
            type="date"
            id="fechaEvaluacion"
            name="fechaEvaluacion"
            value={formData.fechaEvaluacion}
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="observaciones">Observaciones:</Label>
          <Textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Evaluación</Button>
        </div>
      </form>
    </div>
  );
};

export default EvaluacionSupervisionForm;
