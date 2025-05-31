
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';

const asignacionSchema = z.object({
  fechaInicio: z.date({
    required_error: 'La fecha de inicio es requerida',
  }),
  fechaFin: z.date({
    required_error: 'La fecha de fin es requerida',
  }),
  horaInicio: z.string().min(1, 'La hora de inicio es requerida'),
  horaFin: z.string().min(1, 'La hora de fin es requerida'),
  evaluadorId: z.string().min(1, 'El evaluador responsable es requerido'),
  descripcion: z.string().optional(),
}).refine((data) => {
  return data.fechaFin >= data.fechaInicio;
}, {
  message: "La fecha de fin no puede ser anterior a la fecha de inicio",
  path: ["fechaFin"],
}).refine((data) => {
  if (data.fechaInicio.toDateString() === data.fechaFin.toDateString()) {
    return data.horaFin > data.horaInicio;
  }
  return true;
}, {
  message: "La hora de fin debe ser posterior a la hora de inicio en el mismo día",
  path: ["horaFin"],
});

interface AsignacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asignacionData?: any;
  evaluadores: any[];
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
}

const AsignacionDialog: React.FC<AsignacionDialogProps> = ({
  open,
  onOpenChange,
  asignacionData,
  evaluadores,
  onSubmit,
  isSubmitting,
}) => {
  const { apiRequest } = useApiWithToken();
  
  const form = useForm<z.infer<typeof asignacionSchema>>({
    resolver: zodResolver(asignacionSchema),
    defaultValues: {
      fechaInicio: new Date(),
      fechaFin: new Date(),
      horaInicio: '08:00',
      horaFin: '17:00',
      evaluadorId: '',
      descripcion: '',
    },
  });

  useEffect(() => {
    if (asignacionData && open) {
      form.reset({
        fechaInicio: new Date(asignacionData.fechaInicio),
        fechaFin: new Date(asignacionData.fechaFin),
        horaInicio: asignacionData.horaInicio,
        horaFin: asignacionData.horaFin,
        evaluadorId: asignacionData.evaluadorId?.toString() || '',
        descripcion: asignacionData.descripcion || '',
      });
    } else if (!asignacionData && open) {
      form.reset({
        fechaInicio: new Date(),
        fechaFin: new Date(),
        horaInicio: '08:00',
        horaFin: '17:00',
        evaluadorId: '',
        descripcion: '',
      });
    }
  }, [asignacionData, open, form]);

  const validateHorario = async (values: any) => {
    const response = await apiRequest('/asignaciones/validar-horario?' + new URLSearchParams({
      fechaInicio: format(values.fechaInicio, 'yyyy-MM-dd'),
      fechaFin: format(values.fechaFin, 'yyyy-MM-dd'),
      horaInicio: values.horaInicio,
      horaFin: values.horaFin,
      evaluadorId: values.evaluadorId,
      excludeId: asignacionData?.id || ''
    }));

    if (!response.success || !response.data.disponible) {
      toast.error(response.data?.message || 'Conflicto de horario detectado');
      return false;
    }
    return true;
  };

  const handleSubmit = async (values: z.infer<typeof asignacionSchema>) => {
    // Solo validar horario para nuevas asignaciones
    if (!asignacionData) {
      const isValidHorario = await validateHorario(values);
      if (!isValidHorario) return;
    }

    const formattedValues = {
      ...values,
      fechaInicio: format(values.fechaInicio, 'yyyy-MM-dd'),
      fechaFin: format(values.fechaFin, 'yyyy-MM-dd'),
      evaluadorId: parseInt(values.evaluadorId),
    };

    onSubmit(formattedValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {asignacionData ? 'Editar' : 'Nueva'} Asignación de Evaluaciones
          </DialogTitle>
          {!asignacionData && (
            <p className="text-sm text-muted-foreground">
              Se asignarán automáticamente las 3 evaluaciones: Autoevaluación, Evaluación de Estudiantes y Checklist
            </p>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaFin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const fechaInicio = form.getValues('fechaInicio');
                            return date < fechaInicio;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
              name="evaluadorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluador Responsable</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar evaluador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {evaluadores.map((evaluador) => (
                        <SelectItem key={evaluador.id} value={evaluador.id.toString()}>
                          {evaluador.nombre} ({evaluador.rol})
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
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción adicional para las asignaciones..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : asignacionData ? 'Actualizar' : 'Asignar las 3 Evaluaciones'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AsignacionDialog;
