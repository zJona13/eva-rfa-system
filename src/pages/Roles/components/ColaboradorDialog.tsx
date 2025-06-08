
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface TipoColaborador {
  id: number;
  name: string;
}

interface TipoContrato {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
}

interface Colaborador {
  id?: number;
  nombres: string;
  apePat: string;
  apeMat: string;
  birthDate: string;
  address: string;
  phone: string;
  dni: string;
  active: boolean;
  roleId: number;
  startDate: string;
  endDate: string;
  contractActive: boolean;
  contractTypeId: number;
  areaId?: number;
}

interface ColaboradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaborador: Colaborador | null;
  tiposColaborador: TipoColaborador[];
  tiposContrato: TipoContrato[];
  roles: { id: number; name: string }[];
  areas: Area[];
  onSave: (data: any) => void;
}

// Esquema de validación con Zod
const colaboradorSchema = z.object({
  nombres: z.string().min(2, { message: 'Los nombres deben tener al menos 2 caracteres' }),
  apePat: z.string().min(2, { message: 'El apellido paterno debe tener al menos 2 caracteres' }),
  apeMat: z.string().optional(),
  birthDate: z.string(),
  address: z.string().optional(),
  phone: z.string().regex(/^\d{9}$/, { message: 'El teléfono debe tener 9 dígitos' }),
  dni: z.string().regex(/^\d{8}$/, { message: 'El DNI debe tener 8 dígitos' }),
  active: z.boolean().default(true),
  roleId: z.number().positive({ message: 'Debe seleccionar un tipo de colaborador' }),
  startDate: z.string(),
  endDate: z.string(),
  contractActive: z.boolean().default(true),
  contractTypeId: z.number().positive({ message: 'Debe seleccionar un tipo de contrato' }),
  areaId: z.number().optional(),
});

type ColaboradorFormValues = z.infer<typeof colaboradorSchema>;

// Utilidad para formatear fecha a yyyy-MM-dd
function toDateInputValue(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = n => n < 10 ? '0' + n : n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const ColaboradorDialog = ({ 
  open, 
  onOpenChange, 
  colaborador, 
  tiposColaborador, 
  tiposContrato,
  roles,
  areas,
  onSave 
}: ColaboradorDialogProps) => {
  const isEditing = !!colaborador?.id;
  
  const form = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      nombres: '',
      apePat: '',
      apeMat: '',
      birthDate: new Date().toISOString().split('T')[0],
      address: '',
      phone: '',
      dni: '',
      active: true,
      roleId: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      contractActive: true,
      contractTypeId: 0,
      areaId: 0
    }
  });
  
  // Cuando el colaborador cambia, actualiza el formulario
  useEffect(() => {
    if (colaborador) {
      form.reset({
        nombres: colaborador.nombres,
        apePat: colaborador.apePat,
        apeMat: colaborador.apeMat || '',
        birthDate: toDateInputValue(colaborador.birthDate),
        address: colaborador.address || '',
        phone: colaborador.phone,
        dni: colaborador.dni,
        active: colaborador.active,
        roleId: colaborador.roleId,
        startDate: toDateInputValue(colaborador.startDate),
        endDate: toDateInputValue(colaborador.endDate),
        contractActive: colaborador.contractActive,
        contractTypeId: colaborador.contractTypeId,
        areaId: colaborador.areaId || 0
      });
    } else {
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);
      form.reset({
        nombres: '',
        apePat: '',
        apeMat: '',
        birthDate: toDateInputValue(today),
        address: '',
        phone: '',
        dni: '',
        active: true,
        roleId: 0,
        startDate: toDateInputValue(today),
        endDate: toDateInputValue(nextYear),
        contractActive: true,
        contractTypeId: 0,
        areaId: 0
      });
    }
  }, [colaborador, form]);
  
  const onSubmit = (values: ColaboradorFormValues) => {
    onSave(values);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Colaborador' : 'Crear Nuevo Colaborador'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifique la información del colaborador seleccionado.' 
              : 'Complete la información para crear un nuevo colaborador en el sistema.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="nombres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apePat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido Paterno</FormLabel>
                      <FormControl>
                        <Input placeholder="Apellido Paterno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apeMat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido Materno</FormLabel>
                      <FormControl>
                        <Input placeholder="Apellido Materno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" maxLength={8} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="987654321" maxLength={9} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Av. Ejemplo 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Colaborador</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value ? String(field.value) : undefined}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo de colaborador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposColaborador.map((tipo) => (
                            <SelectItem key={tipo.id} value={String(tipo.id)}>
                              {tipo.name}
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
                  name="areaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value ? String(field.value) : undefined}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un área" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area.id} value={String(area.id)}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Estado del Colaborador</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Un colaborador inactivo no podrá ser asignado a nuevas evaluaciones
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Información de Contrato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Fin</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="contractTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Contrato</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? String(field.value) : undefined}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo de contrato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposContrato.map((tipo) => (
                          <SelectItem key={tipo.id} value={String(tipo.id)}>
                            {tipo.name}
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
                name="contractActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Estado del Contrato</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Un contrato inactivo indica que el colaborador ya no está vinculado a la institución
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Actualizar' : 'Crear Colaborador'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ColaboradorDialog;
