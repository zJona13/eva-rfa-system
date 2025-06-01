
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import useApiWithToken from '@/hooks/useApiWithToken';

const assignmentSchema = z.object({
  areaId: z.string().min(1, 'Selecciona un área'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fechaFin: z.string().min(1, 'La fecha de fin es requerida'),
  horaInicio: z.string().default('08:00'),
  horaFin: z.string().default('18:00'),
}).refine((data) => {
  const fechaInicio = new Date(data.fechaInicio);
  const fechaFin = new Date(data.fechaFin);
  return fechaFin >= fechaInicio;
}, {
  message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
  path: ['fechaFin'],
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface Area {
  id: number;
  nombre: string;
  totalDocentes: number;
}

interface Assignment {
  id: number;
  areaId: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
}

interface AssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assignment | null;
  areas: Area[];
  onSuccess: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  open,
  onOpenChange,
  assignment,
  areas,
  onSuccess,
}) => {
  const { apiRequest, isLoading } = useApiWithToken();
  const isEdit = !!assignment;

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      areaId: '',
      fechaInicio: '',
      fechaFin: '',
      horaInicio: '08:00',
      horaFin: '18:00',
    },
  });

  useEffect(() => {
    if (assignment) {
      form.reset({
        areaId: assignment.areaId.toString(),
        fechaInicio: assignment.fechaInicio,
        fechaFin: assignment.fechaFin,
        horaInicio: assignment.horaInicio || '08:00',
        horaFin: assignment.horaFin || '18:00',
      });
    } else {
      form.reset({
        areaId: '',
        fechaInicio: '',
        fechaFin: '',
        horaInicio: '08:00',
        horaFin: '18:00',
      });
    }
  }, [assignment, form]);

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      const payload = {
        areaId: parseInt(data.areaId),
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
      };

      let response;
      if (isEdit) {
        response = await apiRequest(`/asignaciones/${assignment.id}`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        response = await apiRequest('/asignaciones', {
          method: 'POST',
          body: payload,
        });
      }

      if (response.success) {
        toast.success(
          isEdit
            ? 'Asignación actualizada exitosamente'
            : 'Asignación creada exitosamente'
        );
        onSuccess();
      } else {
        toast.error(response.error || 'Error al procesar la asignación');
      }
    } catch (error) {
      toast.error('Error al procesar la asignación');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Asignación' : 'Nueva Asignación'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="areaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un área" />
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                name="horaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Procesando...'
                  : isEdit
                  ? 'Actualizar'
                  : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentForm;
