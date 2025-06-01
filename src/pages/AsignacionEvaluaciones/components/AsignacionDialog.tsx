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

const formSchema = z.object({
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fechaFin: z.string().min(1, 'La fecha de fin es obligatoria'),
  horaInicio: z.string().min(1, 'La hora de inicio es obligatoria'),
  horaFin: z.string().min(1, 'La hora de fin es obligatoria'),
  areaId: z.string().min(1, 'Debe seleccionar un área'),
  descripcion: z.string().optional(),
}).refine((data) => {
  const fechaInicio = new Date(data.fechaInicio);
  const fechaFin = new Date(data.fechaFin);
  return fechaFin >= fechaInicio;
}, {
  message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
  path: ["fechaFin"],
}).refine((data) => {
  if (data.fechaInicio === data.fechaFin) {
    return data.horaFin > data.horaInicio;
  }
  return true;
}, {
  message: "La hora de fin debe ser posterior a la hora de inicio",
  path: ["horaFin"],
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
    console.log('Areas recibidas en AsignacionDialog:', areas);
    console.log('Cantidad de áreas:', areas?.length || 0);
    
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
  }, [asignacionData, form, areas]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('Enviando datos:', values);
      
      const submissionData = {
        ...values,
        areaId: parseInt(values.areaId),
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error en handleSubmit:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {asignacionData ? 'Editar Asignación' : 'Nueva Asignación'}
          </DialogTitle>
          <DialogDescription>
            {asignacionData 
              ? 'Modifica los datos de la asignación de evaluaciones por área.'
              : 'Crea una nueva asignación de evaluaciones para un área específica. Esto habilitará automáticamente las tres evaluaciones: Autoevaluación, Evaluación Docente-Docente y Evaluación Estudiante-Docente.'
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border border-gray-300">
                        <SelectValue placeholder="Seleccionar área..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border shadow-lg max-h-[200px] overflow-y-auto z-[9999]">
                      {areas && areas.length > 0 ? (
                        areas.map((area) => {
                          console.log('Renderizando área:', area);
                          return (
                            <SelectItem 
                              key={area.id} 
                              value={area.id.toString()}
                              className="hover:bg-gray-100 cursor-pointer"
                            >
                              {area.nombre} ({area.totalDocentes || 0} docentes)
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="no-areas" disabled>
                          {areas?.length === 0 ? 'No hay áreas disponibles' : 'Cargando áreas...'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {areas && areas.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      No hay áreas con docentes disponibles para asignar evaluaciones.
                    </p>
                  )}
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
                        min={new Date().toISOString().split('T')[0]}
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
                        min={form.watch('fechaInicio') || new Date().toISOString().split('T')[0]}
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
                        min="06:00"
                        max="22:00"
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
                        min="06:00"
                        max="22:00"
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !areas || areas.length === 0}
              >
                {isSubmitting ? 'Creando...' : asignacionData ? 'Actualizar' : 'Crear Asignación'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AsignacionDialog;
