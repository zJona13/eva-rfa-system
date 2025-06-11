import React, { useEffect, useState } from 'react';
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
import { getToken } from '@/contexts/AuthContext';

// Types for the form
// Actualizar el esquema para permitir valores especiales
const userFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Debe ser un correo electrónico válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }).optional(),
  confirmPassword: z.string().optional(),
  roleId: z.string().min(1, { message: 'Seleccione un rol' }),
  colaboradorId: z.string().optional(), // Cambiamos para permitir valor especial
  areaId: z.string().optional(), // Nuevo campo para área
  active: z.boolean().default(true),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
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

interface Area {
  id: number;
  name: string;
  descripcion: string;
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
    areaId?: number; // Nuevo campo
    active?: boolean;
  } | null;
  roles: Role[];
  areas: Area[]; // Nuevo prop
  onSubmit: (values: UserFormValues & { id?: number }) => void;
  isSubmitting: boolean;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onOpenChange,
  userData,
  roles,
  areas,
  onSubmit,
  isSubmitting
}) => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: '',
      colaboradorId: 'none', // Valor por defecto para "Sin colaborador"
      areaId: 'none', // Valor por defecto
      active: true,
    },
  });

  // Fetch available colaboradores
  const fetchColaboradores = async () => {
    try {
      setLoadingColaboradores(true);
      const excludeUserId = userData?.id ? `?excludeUserId=${userData.id}` : '';
      const token = getToken();
      const response = await fetch(`http://localhost:3309/api/users/available-colaboradores${excludeUserId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setColaboradores(data.colaboradores || []);
      }
    } catch (error) {
      console.error('Error al cargar colaboradores:', error);
    } finally {
      setLoadingColaboradores(false);
    }
  };

  // Reset form when userData changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        name: userData?.name || '',
        email: userData?.email || '',
        password: '',
        confirmPassword: '',
        roleId: userData?.roleId ? String(userData.roleId) : '',
        colaboradorId: userData?.colaboradorId ? String(userData.colaboradorId) : 'none',
        areaId: userData?.areaId ? String(userData.areaId) : 'none',
        active: userData?.active !== undefined ? userData.active : true,
      });
      
      fetchColaboradores();
    }
  }, [open, userData, form]);

  const handleSubmit = (values: UserFormValues) => {
    // Convertir 'none' a null antes de enviar
    const processedValues = {
      ...values,
      colaboradorId: values.colaboradorId === 'none' ? '' : values.colaboradorId,
      areaId: values.areaId === 'none' ? null : values.areaId,
      id: userData?.id
    };
    
    onSubmit(processedValues);
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
                  <FormLabel>{isNewUser ? 'Contraseña' : 'Nueva Contraseña (opcional)'}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={isNewUser ? 'Contraseña' : 'Deje en blanco para mantener la actual'} 
                      {...field} 
                      required={isNewUser}
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
                      required={isNewUser || !!form.watch('password')}
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
                        <SelectItem 
                          key={role.id} 
                          value={String(role.id)} // Asegúrate de que nunca sea cadena vacía
                        >
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
                  <FormLabel>Colaborador</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un colaborador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingColaboradores ? (
                        <SelectItem value="loading" disabled>
                          Cargando...
                        </SelectItem>
                      ) : (
                        <>
                          <SelectItem value="none">Sin colaborador</SelectItem>
                          {colaboradores.map((colaborador) => (
                            <SelectItem 
                              key={colaborador.id} 
                              value={String(colaborador.id)}
                            >
                              {colaborador.fullName}
                            </SelectItem>
                          ))}
                        </>
                      )}
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
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin área</SelectItem>
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
