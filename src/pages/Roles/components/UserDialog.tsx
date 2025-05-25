
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Types for the form - Esquema de validación corregido
const userFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Debe ser un correo electrónico válido' }),
  password: z.string().optional().refine((password) => {
    return !password || password.length >= 6;
  }, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  confirmPassword: z.string().optional(),
  roleId: z.string().min(1, { message: 'Seleccione un rol' }),
  colaboradorId: z.string().optional(),
  active: z.boolean().default(true),
}).superRefine((data, ctx) => {
  // Validación de confirmación de contraseña solo si hay contraseña
  if (data.password && data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    });
  }
});

export type UserFormValues = z.infer<typeof userFormSchema>;

// Types for the component props
interface Role {
  id: number;
  name: string;
}

interface Colaborador {
  id: number;
  fullName: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData?: {
    id?: number;
    name?: string;
    email?: string;
    roleId?: number;
    colaboradorId?: number;
    active?: boolean;
  } | null;
  roles: Role[];
  colaboradores: Colaborador[];
  onSubmit: (values: UserFormValues & { id?: number }) => void;
  isSubmitting: boolean;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onOpenChange,
  userData,
  roles,
  colaboradores,
  onSubmit,
  isSubmitting
}) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: '',
      colaboradorId: '',
      active: true,
    },
  });

  // Reset form when userData changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        name: userData?.name || '',
        email: userData?.email || '',
        password: '',
        confirmPassword: '',
        roleId: userData?.roleId ? String(userData.roleId) : '',
        colaboradorId: userData?.colaboradorId ? String(userData.colaboradorId) : '',
        active: userData?.active !== undefined ? userData.active : true,
      });
    }
  }, [open, userData, form]);

  const handleSubmit = (values: UserFormValues) => {
    console.log('Datos del formulario:', values);
    
    // Para nuevo usuario, la contraseña es requerida
    const isNewUser = !userData?.id;
    if (isNewUser && !values.password) {
      form.setError('password', { message: 'La contraseña es requerida para usuarios nuevos' });
      return;
    }

    // Enviar datos con id si existe
    onSubmit({
      ...values,
      id: userData?.id
    });
  };

  const isNewUser = !userData?.id;
  const title = isNewUser ? 'Crear Nuevo Usuario' : 'Editar Usuario';
  const description = isNewUser 
    ? 'Complete la información para crear un nuevo usuario en el sistema.' 
    : 'Modifique la información del usuario seleccionado.';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isNewUser ? 'Contraseña *' : 'Nueva Contraseña (opcional)'}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={isNewUser ? 'Contraseña' : 'Deje en blanco para mantener la actual'} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirme la contraseña" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
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
              name="colaboradorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colaborador (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un colaborador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {colaboradores.map((colaborador) => (
                        <SelectItem key={colaborador.id} value={String(colaborador.id)}>
                          {colaborador.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Asigne un colaborador al usuario si corresponde
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Usuario Activo</FormLabel>
                    <FormDescription>
                      Determina si el usuario puede iniciar sesión en el sistema
                    </FormDescription>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : isNewUser ? 'Crear' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
