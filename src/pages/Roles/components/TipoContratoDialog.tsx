
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface TipoContratoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoContrato: { id: number; name: string } | null;
  onSave: (name: string) => void;
}

// Esquema de validación con Zod
const tipoContratoSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
});

type TipoContratoFormValues = z.infer<typeof tipoContratoSchema>;

const TipoContratoDialog = ({ open, onOpenChange, tipoContrato, onSave }: TipoContratoProps) => {
  const isEditing = !!tipoContrato;
  
  const form = useForm<TipoContratoFormValues>({
    resolver: zodResolver(tipoContratoSchema),
    defaultValues: {
      name: ''
    }
  });
  
  // Cuando el tipo de contrato cambia, actualiza el formulario
  useEffect(() => {
    if (tipoContrato) {
      form.reset({
        name: tipoContrato.name
      });
    } else {
      form.reset({
        name: ''
      });
    }
  }, [tipoContrato, form]);
  
  const onSubmit = (values: TipoContratoFormValues) => {
    onSave(values.name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Tipo de Contrato' : 'Crear Nuevo Tipo de Contrato'}</DialogTitle>

        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Tiempo Completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Actualizar' : 'Crear Tipo de Contrato'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TipoContratoDialog;
