
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fechaFin: z.string().min(1, 'La fecha de fin es obligatoria'),
  horaInicio: z.string().min(1, 'La hora de inicio es obligatoria'),
  horaFin: z.string().min(1, 'La hora de fin es obligatoria'),
  areaId: z.string().min(1, 'Debe seleccionar un área'),
  descripcion: z.string().optional(),
});

interface Area {
  id: number;
  nombre: string;
  descripcion?: string;
  totalDocentes: number;
}

interface AsignacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asignacionData?: any;
  areas: Area[];
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

const AsignacionDialog: React.FC<AsignacionDialogProps> = ({
  open,
  onOpenChange,
  asignacionData,
  areas,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fechaInicio: '',
      fechaFin: '',
      horaInicio: '08:00',
      horaFin: '18:00',
      areaId: '',
      descripcion: '',
    },
  });

  useEffect(() => {
    if (asignacionData) {
      const fechaInicio = asignacionData.fechaInicio ? format(new Date(asignacionData.fechaInicio), 'yyyy-MM-dd') : '';
      const fechaFin = asignacionData.fechaFin ? format(new Date(asignacionData.fechaFin), 'yyyy-MM-dd') : '';
      
      form.reset({
        fechaInicio,
        fechaFin,
        horaInicio: asignacionData.horaInicio || '08:00',
        horaFin: asignacionData.horaFin || '18:00',
        areaId: asignacionData.areaId?.toString() || '',
        descripcion: asignacionData.descripcion || '',
      });
    } else {
      form.reset({
        fechaInicio: '',
        fechaFin: '',
        horaInicio: '08:00',
        horaFin: '18:00',
        areaId: '',
        descripcion: '',
      });
    }
  }, [asignacionData, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const submissionData = {
      ...values,
      areaId: parseInt(values.areaId),
    };
    
    await onSubmit(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {asignacionData ? 'Editar Asignación' : 'Nueva Asignación'}
          </DialogTitle>
          <DialogDescription>
            {asignacionData 
              ? 'Modifica los datos de la asignación de evaluaciones por área.'
              : 'Crea una nueva asignación de evaluaciones para un área específica.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="areaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área" />
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
                      <Input
                        type="date"
                        {...field}
                      />
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
                      <Input
                        type="date"
                        {...field}
                      />
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
                      <Input
                        type="time"
                        {...field}
                      />
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
                      <Input
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descripción de la asignación..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : asignacionData ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AsignacionDialog;
