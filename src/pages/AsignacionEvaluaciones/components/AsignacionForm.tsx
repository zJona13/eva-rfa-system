
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
  areaId: z.string().min(1, 'Debe seleccionar un área'),
});

interface Area {
  id: number;
  name: string;
  description?: string;
}

interface Asignacion {
  id: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  areaNombre: string;
  areaId: number;
  estado: string;
  totalEvaluaciones: number;
  evaluacionesCompletadas: number;
}

interface AsignacionFormProps {
  asignacion?: Asignacion | null;
  areas: Area[];
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
}

const AsignacionForm: React.FC<AsignacionFormProps> = ({
  asignacion,
  areas,
  onSubmit,
  onCancel,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fechaInicio: '',
      fechaFin: '',
      areaId: '',
    },
  });

  useEffect(() => {
    if (asignacion) {
      const fechaInicio = asignacion.fechaInicio 
        ? format(new Date(asignacion.fechaInicio), 'yyyy-MM-dd') 
        : '';
      const fechaFin = asignacion.fechaFin 
        ? format(new Date(asignacion.fechaFin), 'yyyy-MM-dd') 
        : '';
      
      form.reset({
        fechaInicio,
        fechaFin,
        areaId: asignacion.areaId?.toString() || '',
      });
    } else {
      form.reset({
        fechaInicio: '',
        fechaFin: '',
        areaId: '',
      });
    }
  }, [asignacion, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const submissionData = {
      ...values,
      areaId: parseInt(values.areaId),
    };
    
    await onSubmit(submissionData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {asignacion ? 'Editar Asignación' : 'Nueva Asignación'}
          </DialogTitle>
          <DialogDescription>
            {asignacion 
              ? 'Modifica los datos de la asignación de evaluaciones.'
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas && areas.length > 0 ? (
                        areas.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-areas" disabled>
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {asignacion ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AsignacionForm;
