
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: any;
  onClose: () => void;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  open,
  onOpenChange,
  assignment,
  onClose,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    selectedUsers: [] as number[],
  });

  // Mock data para usuarios disponibles
  const mockUsers = [
    { id: 1, name: 'Juan Pérez', email: 'juan@ies.edu', role: 'Docente' },
    { id: 2, name: 'María González', email: 'maria@ies.edu', role: 'Docente' },
    { id: 3, name: 'Carlos López', email: 'carlos@ies.edu', role: 'Estudiante' },
    { id: 4, name: 'Ana Martínez', email: 'ana@ies.edu', role: 'Docente' },
    { id: 5, name: 'Luis Rodríguez', email: 'luis@ies.edu', role: 'Estudiante' },
  ];

  const evaluationTypes = [
    { value: 'autoevaluacion', label: 'Autoevaluación' },
    { value: 'evaluacion-estudiante', label: 'Evaluación Estudiante-Docente' },
    { value: 'lista-cotejo', label: 'Lista de Cotejo (Supervisión)' },
  ];

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title || '',
        description: assignment.description || '',
        type: assignment.type || '',
        startDate: assignment.startDate ? new Date(assignment.startDate) : undefined,
        endDate: assignment.endDate ? new Date(assignment.endDate) : undefined,
        selectedUsers: assignment.selectedUsers || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: '',
        startDate: undefined,
        endDate: undefined,
        selectedUsers: [],
      });
    }
  }, [assignment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validaciones
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      setIsLoading(false);
      return;
    }

    if (!formData.type) {
      toast.error('Debe seleccionar un tipo de evaluación');
      setIsLoading(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Las fechas de inicio y fin son requeridas');
      setIsLoading(false);
      return;
    }

    if (formData.endDate <= formData.startDate) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      setIsLoading(false);
      return;
    }

    if (formData.startDate < new Date()) {
      toast.error('La fecha de inicio no puede ser anterior a hoy');
      setIsLoading(false);
      return;
    }

    if (formData.selectedUsers.length === 0) {
      toast.error('Debe seleccionar al menos un usuario');
      setIsLoading(false);
      return;
    }

    try {
      // Aquí se implementará la llamada a la API con el token
      const token = localStorage.getItem('iesrfa_token');
      
      if (!token) {
        toast.error('Token de acceso requerido');
        setIsLoading(false);
        return;
      }

      const assignmentData = {
        ...formData,
        createdBy: user?.id,
      };

      // Simular llamada a API
      console.log('Datos a enviar:', assignmentData);
      console.log('Token disponible:', !!token);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(assignment ? 'Asignación actualizada correctamente' : 'Asignación creada correctamente');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la asignación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserToggle = (userId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: checked
        ? [...prev.selectedUsers, userId]
        : prev.selectedUsers.filter(id => id !== userId)
    }));
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isEndDateDisabled = (date: Date) => {
    if (!formData.startDate) return false;
    return date <= formData.startDate;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment ? 'Editar Asignación' : 'Nueva Asignación de Evaluación'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título de la Asignación</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Evaluación Semestral Docentes"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción opcional de la evaluación..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo de Evaluación</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {evaluationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    disabled={isDateDisabled}
                    initialFocus
                    className="bg-background"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Fecha de Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    disabled={isEndDateDisabled}
                    initialFocus
                    className="bg-background"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              Usuarios a Asignar ({formData.selectedUsers.length} seleccionados)
            </Label>
            <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={formData.selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleUserToggle(user.id, checked as boolean)}
                    />
                    <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">{user.role}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : assignment ? 'Actualizar' : 'Crear Asignación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;
