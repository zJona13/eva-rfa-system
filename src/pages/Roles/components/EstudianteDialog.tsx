
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';

interface Area {
  id: number;
  name: string;
}

interface Usuario {
  id: number;
  correo: string;
}

interface Estudiante {
  id?: number;
  codigo: string;
  sexo: string;
  semestre: string;
  areaId: number;
  usuarioId: number;
}

interface EstudianteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  estudiante: Estudiante | null;
  areas: Area[];
  usuarios: Usuario[];
}

const EstudianteDialog: React.FC<EstudianteDialogProps> = ({ open, onOpenChange, onSave, estudiante, areas, usuarios }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Estudiante>({
    defaultValues: estudiante || {
      codigo: '',
      sexo: '',
      semestre: '',
      areaId: undefined,
      usuarioId: undefined
    }
  });

  React.useEffect(() => {
    if (estudiante) {
      reset(estudiante);
    } else {
      reset({ codigo: '', sexo: '', semestre: '', areaId: undefined, usuarioId: undefined });
    }
  }, [estudiante, reset]);

  const onSubmit = (data: any) => {
    onSave({
      ...data,
      areaId: Number(data.areaId),
      usuarioId: Number(data.usuarioId)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{estudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Código</label>
            <Input {...register('codigo', { required: 'El código es obligatorio' })} />
            {errors.codigo && <span className="text-red-500 text-xs">{errors.codigo.message}</span>}
          </div>
          <div>
            <label className="block mb-1">Sexo</label>
            <Input {...register('sexo', { required: 'El sexo es obligatorio' })} maxLength={1} placeholder="M/F" />
            {errors.sexo && <span className="text-red-500 text-xs">{errors.sexo.message}</span>}
          </div>
          <div>
            <label className="block mb-1">Semestre</label>
            <Input {...register('semestre', { required: 'El semestre es obligatorio' })} />
            {errors.semestre && <span className="text-red-500 text-xs">{errors.semestre.message}</span>}
          </div>
          <div>
            <label className="block mb-1">Área</label>
            <Select value={String(watch('areaId') || '')} onValueChange={val => setValue('areaId', Number(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map(area => (
                  <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.areaId && <span className="text-red-500 text-xs">El área es obligatoria</span>}
          </div>
          <div>
            <label className="block mb-1">Usuario</label>
            <Select value={String(watch('usuarioId') || '')} onValueChange={val => setValue('usuarioId', Number(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un usuario" />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map(usuario => (
                  <SelectItem key={usuario.id} value={String(usuario.id)}>{usuario.correo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.usuarioId && <span className="text-red-500 text-xs">El usuario es obligatorio</span>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" variant="default">{estudiante ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EstudianteDialog;
