
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useApiWithToken } from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import type { Assignment, Area } from '../Index';

const assignmentSchema = z.object({
  areaId: z.string().min(1, 'Debe seleccionar un área'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fechaFin: z.string().min(1, 'La fecha de fin es obligatoria'),
  horaInicio: z.string().min(1, 'La hora de inicio es obligatoria'),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  assignment?: Assignment | null;
  areas: Area[];
  onSuccess: () => void;
  onCancel: () => void;
}

const AssignmentForm = ({ assignment, areas, onSuccess, onCancel }: AssignmentFormProps) => {
  const { apiRequest, isLoading } = useApiWithToken();
  
  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      areaId: assignment?.areaId?.toString() || '',
      fechaInicio: assignment?.fechaInicio || '',
      fechaFin: assignment?.fechaFin || '',
      horaInicio: '08:00',
    },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      const payload = {
        areaId: parseInt(data.areaId),
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        horaInicio: data.horaInicio,
      };

      let response;
      if (assignment) {
        // Editar asignación existente
        response = await apiRequest(`/asignaciones/${assignment.id}`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        // Crear nueva asignación
        response = await apiRequest('/asignaciones', {
          method: 'POST',
          body: payload,
        });
      }

      if (response.success) {
        toast.success(
          assignment 
            ? 'Asignación actualizada exitosamente' 
            : 'Asignación creada exitosamente'
        );
        onSuccess();
      } else {
        toast.error(response.error || 'Error al guardar la asignación');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {assignment ? 'Editar Asignación' : 'Nueva Asignación'}
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="areaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.nombre} ({area.totalDocentes} docentes)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="horaInicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de Inicio</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaInicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Inicio</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaFin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Fin</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : assignment ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AssignmentForm;
