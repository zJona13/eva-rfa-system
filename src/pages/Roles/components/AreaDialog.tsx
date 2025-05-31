
import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';

const areaFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  description: z.string().optional(),
});

export type AreaFormValues = z.infer<typeof areaFormSchema>;

interface AreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaData?: {
    id?: number;
    name?: string;
    description?: string;
  } | null;
  onSubmit: (values: AreaFormValues & { id?: number }) => void;
  isSubmitting: boolean;
}

const AreaDialog: React.FC<AreaDialogProps> = ({
  open,
  onOpenChange,
  areaData,
  onSubmit,
  isSubmitting
}) => {
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: areaData?.name || '',
        description: areaData?.description || '',
      });
    }
  }, [open, areaData, form]);

  const handleSubmit = (values: AreaFormValues) => {
    onSubmit({
      ...values,
      id: areaData?.id
    });
  };

  const isNewArea = !areaData?.id;
  const title = isNewArea ? 'Crear Nueva Área' : 'Editar Área';
  const description = isNewArea 
    ? 'Complete la información para crear una nueva área.' 
    : 'Modifique la información del área seleccionada.';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Área</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el nombre del área" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ingrese una descripción del área"
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : isNewArea ? 'Crear' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AreaDialog;
