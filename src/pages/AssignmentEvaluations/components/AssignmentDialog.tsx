
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useApiWithToken } from '@/hooks/useApiWithToken';

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
import { Checkbox } from '@/components/ui/checkbox';

const assignmentSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  evaluationType: z.string().min(1, 'El tipo de evaluación es requerido'),
  startDate: z.date({
    required_error: 'La fecha de inicio es requerida',
  }),
  endDate: z.date({
    required_error: 'La fecha de fin es requerida',
  }),
  selectedUsers: z.array(z.number()).min(1, 'Debe seleccionar al menos un usuario'),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: any;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  open,
  onOpenChange,
  assignment,
}) => {
  const queryClient = useQueryClient();
  const { apiRequest } = useApiWithToken();

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: assignment?.title || '',
      description: assignment?.description || '',
      evaluationType: assignment?.evaluationType || '',
      startDate: assignment?.startDate ? new Date(assignment.startDate) : undefined,
      endDate: assignment?.endDate ? new Date(assignment.endDate) : undefined,
      selectedUsers: assignment?.selectedUsers || [],
    },
  });

  // Fetch evaluation types
  const { data: evaluationTypesData } = useQuery({
    queryKey: ['evaluation-types'],
    queryFn: () => apiRequest('/evaluation-types'),
  });

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiRequest('/users'),
  });

  const evaluationTypes = evaluationTypesData?.data?.types || [];
  const users = usersData?.data?.users || [];

  // Create/Update assignment mutation
  const saveMutation = useMutation({
    mutationFn: (data: AssignmentFormData) => {
      const payload = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      };

      if (assignment) {
        return apiRequest(`/assignments/${assignment.id}`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        return apiRequest('/assignments', {
          method: 'POST',
          body: payload,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success(
        assignment 
          ? 'Asignación actualizada exitosamente' 
          : 'Asignación creada exitosamente'
      );
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error('Error al guardar la asignación');
    },
  });

  const onSubmit = (data: AssignmentFormData) => {
    saveMutation.mutate(data);
  };

  const handleUserToggle = (userId: number, checked: boolean) => {
    const currentUsers = form.getValues('selectedUsers');
    if (checked) {
      form.setValue('selectedUsers', [...currentUsers, userId]);
    } else {
      form.setValue('selectedUsers', currentUsers.filter(id => id !== userId));
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment ? 'Editar Asignación' : 'Nueva Asignación de Evaluación'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título de la asignación" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evaluationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Evaluación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {evaluationTypes.map((type: any) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción de la asignación"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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
                          disabled={(date) => date < today}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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
                            const startDate = form.getValues('startDate');
                            return date < today || (startDate && date < startDate);
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="selectedUsers"
              render={() => (
                <FormItem>
                  <FormLabel>Usuarios Asignados</FormLabel>
                  <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                    {users.map((user: any) => (
                      <div key={user.id} className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={form.getValues('selectedUsers').includes(user.id)}
                          onCheckedChange={(checked) => 
                            handleUserToggle(user.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {user.name} ({user.email})
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? 'Guardando...'
                  : assignment
                  ? 'Actualizar'
                  : 'Crear Asignación'
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;
