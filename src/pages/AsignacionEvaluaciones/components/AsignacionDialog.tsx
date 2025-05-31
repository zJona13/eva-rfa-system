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

// Validaciones comprehensivas para fechas y horas
const formSchema = z.object({
  fechaInicio: z.string()
    .min(1, 'La fecha de inicio es obligatoria')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'La fecha de inicio no puede ser anterior a hoy'),
  
  fechaFin: z.string()
    .min(1, 'La fecha de fin es obligatoria')
    .refine((date) => {
      const selectedDate = new Date(date);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      return selectedDate <= maxDate;
    }, 'La fecha de fin no puede ser mayor a un año desde hoy'),
  
  horaInicio: z.string()
    .min(1, 'La hora de inicio es obligatoria')
    .refine((time) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour >= 6 && hour <= 22;
    }, 'La hora de inicio debe estar entre 06:00 y 22:00'),
  
  horaFin: z.string()
    .min(1, 'La hora de fin es obligatoria')
    .refine((time) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour >= 6 && hour <= 22;
    }, 'La hora de fin debe estar entre 06:00 y 22:00'),
  
  areaId: z.string()
    .min(1, 'Debe seleccionar un área')
    .refine((val) => !isNaN(parseInt(val)), 'Área inválida'),
  
  descripcion: z.string().optional(),
}).refine((data) => {
  const fechaInicio = new Date(data.fechaInicio);
  const fechaFin = new Date(data.fechaFin);
  return fechaFin >= fechaInicio;
}, {
  message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
  path: ['fechaFin'],
}).refine((data) => {
  // Si es el mismo día, validar que la hora de fin sea posterior a la hora de inicio
  const fechaInicio = new Date(data.fechaInicio);
  const fechaFin = new Date(data.fechaFin);
  
  if (fechaInicio.toDateString() === fechaFin.toDateString()) {
    const [horaInicioHour, horaInicioMinute] = data.horaInicio.split(':').map(Number);
    const [horaFinHour, horaFinMinute] = data.horaFin.split(':').map(Number);
    
    const minutosInicio = horaInicioHour * 60 + horaInicioMinute;
    const minutosFin = horaFinHour * 60 + horaFinMinute;
    
    return minutosFin > minutosInicio + 30; // Mínimo 30 minutos de diferencia
  }
  return true;
}, {
  message: 'La hora de fin debe ser al menos 30 minutos posterior a la hora de inicio cuando es el mismo día',
  path: ['horaFin'],
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
  console.log('AsignacionDialog - Areas recibidas:', areas);
  console.log('AsignacionDialog - isSubmitting:', isSubmitting);
  console.log('AsignacionDialog - open:', open);
  
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
    console.log('AsignacionDialog - useEffect triggered, asignacionData:', asignacionData);
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
    console.log('🚀 Iniciando handleSubmit con valores:', values);
    
    try {
      const submissionData = {
        ...values,
        areaId: parseInt(values.areaId),
      };
      
      console.log('📤 Datos preparados para envío:', submissionData);
      
      // Llamar a la función onSubmit del componente padre
      await onSubmit(submissionData);
      
      console.log('✅ onSubmit completado exitosamente');
      
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      // No cerrar el diálogo si hay error
      throw error;
    }
  };

  // Prevenir el cierre del diálogo si ocurre un error
  const handleFormSubmit = form.handleSubmit(handleSubmit, (errors) => {
    console.error('❌ Errores de validación del formulario:', errors);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {asignacionData ? 'Editar Asignación' : 'Nueva Asignación de Evaluaciones'}
          </DialogTitle>
          <DialogDescription>
            {asignacionData 
              ? 'Modifica los datos de la asignación de evaluaciones por área.'
              : 'Crea una nueva asignación de evaluaciones para un área específica. Se crearán automáticamente todas las evaluaciones (autoevaluaciones, evaluaciones entre docentes y evaluaciones de estudiantes a docentes).'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="areaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      console.log('📋 Área seleccionada:', value);
                      field.onChange(value);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white z-50">
                      {areas && areas.length > 0 ? (
                        areas.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.nombre} ({area.totalDocentes} docentes)
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No hay áreas disponibles
                        </SelectItem>
                      )}
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
                    <FormLabel>Fecha de Inicio *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        max={format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}
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
                    <FormLabel>Fecha de Fin *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={form.watch('fechaInicio') || format(new Date(), 'yyyy-MM-dd')}
                        max={format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}
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
                    <FormLabel>Hora de Inicio *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        min="06:00"
                        max="22:00"
                        step="900" // 15 minutos
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
                    <FormLabel>Hora de Fin *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        min="06:00"
                        max="22:00"
                        step="900" // 15 minutos
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
                      maxLength={255}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
              <strong>Nota:</strong> Al crear esta asignación se generarán automáticamente:
              <ul className="mt-1 ml-4 list-disc">
                <li>Autoevaluaciones para cada docente del área</li>
                <li>Evaluaciones cruzadas entre docentes</li>
                <li>Evaluaciones de estudiantes a docentes</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log('❌ Cancelando diálogo');
                  onOpenChange(false);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={() => console.log('🔄 Click en botón submit, isSubmitting:', isSubmitting)}
              >
                {isSubmitting ? 'Guardando...' : asignacionData ? 'Actualizar' : 'Crear Asignación'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AsignacionDialog;
