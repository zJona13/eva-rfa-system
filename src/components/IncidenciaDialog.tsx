
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApiWithToken } from '@/hooks/useApiWithToken';

interface IncidenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluacionData: {
    evaluatedId: number;
    evaluatedName: string;
    score: number;
    type: string;
  };
}

const IncidenciaDialog: React.FC<IncidenciaDialogProps> = ({ open, onOpenChange, evaluacionData }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { apiRequest } = useApiWithToken();
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('Académica');

  console.log('IncidenciaDialog props:', { open, evaluacionData, user });

  const createIncidenciaMutation = useMutation({
    mutationFn: (incidenciaData: any) => apiRequest('/incidencias', {
      method: 'POST',
      body: incidenciaData
    }),
    onSuccess: (data) => {
      console.log('Incidencia creation success:', data);
      toast.success('Incidencia creada exitosamente. Se ha notificado al docente.');
      queryClient.invalidateQueries({ queryKey: ['incidencias'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      onOpenChange(false);
      setDescripcion('');
      setTipo('Académica');
    },
    onError: (error: any) => {
      console.error('Incidencia creation error:', error);
      toast.error(`Error al crear incidencia: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with:', { descripcion, tipo, evaluacionData, user });
    
    if (!descripcion.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    if (!user?.id) {
      toast.error('Usuario no identificado');
      return;
    }

    if (!evaluacionData.evaluatedId) {
      toast.error('ID del evaluado no disponible');
      return;
    }

    const now = new Date();
    const incidenciaData = {
      fecha: now.toISOString().split('T')[0],
      hora: now.toTimeString().split(' ')[0],
      descripcion: `Evaluación desaprobatoria (${evaluacionData.score}/20) - ${evaluacionData.type}: ${descripcion}`,
      estado: 'En proceso', // Estado por defecto
      tipo: tipo,
      reportadorId: user.id,
      afectadoId: evaluacionData.evaluatedId
    };

    console.log('Sending incidencia data:', incidenciaData);
    createIncidenciaMutation.mutate(incidenciaData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generar Incidencia por Evaluación Desaprobatoria</DialogTitle>
          <DialogDescription>
            El docente {evaluacionData.evaluatedName} obtuvo una calificación de {evaluacionData.score}/20 (menor a 11).
            Genere una incidencia para documentar esta situación.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Incidencia</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Académica">Académica</SelectItem>
                <SelectItem value="Administrativa">Administrativa</SelectItem>
                <SelectItem value="Técnica">Técnica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de la Incidencia</Label>
            <Textarea
              id="descripcion"
              placeholder="Describa los detalles de la incidencia..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Esta incidencia será creada con estado "En proceso" y enviada como notificación al docente evaluado.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createIncidenciaMutation.isPending}>
              {createIncidenciaMutation.isPending ? 'Creando...' : 'Crear Incidencia'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidenciaDialog;
