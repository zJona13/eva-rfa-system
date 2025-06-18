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
  nombreEstudiante: string;
  apePaEstudiante: string;
  apeMaEstudiante: string;
  usuarioId?: number;
  user?: {
    email: string;
    password: string;
    confirmPassword: string;
  };
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
      nombreEstudiante: '',
      apePaEstudiante: '',
      apeMaEstudiante: '',
      user: { email: '', password: '', confirmPassword: '' }
    }
  });

  // Limpio el formulario al cerrar el modal
  const handleOpenChange = (openValue: boolean) => {
    onOpenChange(openValue);
    if (!openValue) {
      // Regenerar código y limpiar campos
      const now = new Date();
      const year = now.getFullYear();
      const codigosEsteAnio = Array.isArray(usuarios) ? usuarios.map(u => u.correo) : [];
      let maxCorrelativo = 0;
      codigosEsteAnio.forEach(c => {
        const match = c.match(/^EST\d{4}(\d{2})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxCorrelativo) maxCorrelativo = num;
        }
      });
      const correlativo = String(maxCorrelativo + 1).padStart(2, '0');
      const autoCodigo = `EST${year}${correlativo}`;
      reset({ codigo: autoCodigo, sexo: '', semestre: '', areaId: undefined, nombreEstudiante: '', apePaEstudiante: '', apeMaEstudiante: '', user: { email: '', password: '', confirmPassword: '' } });
    }
  };

  // Generar código correlativo para el año actual (al abrir para crear)
  React.useEffect(() => {
    if (estudiante) {
      reset({ ...estudiante, user: { email: '', password: '', confirmPassword: '' } });
    } else if (open) {
      const now = new Date();
      const year = now.getFullYear();
      const codigosEsteAnio = Array.isArray(usuarios) ? usuarios.map(u => u.correo) : [];
      let maxCorrelativo = 0;
      codigosEsteAnio.forEach(c => {
        const match = c.match(/^EST\d{4}(\d{2})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxCorrelativo) maxCorrelativo = num;
        }
      });
      const correlativo = String(maxCorrelativo + 1).padStart(2, '0');
      const autoCodigo = `EST${year}${correlativo}`;
      reset({ codigo: autoCodigo, sexo: '', semestre: '', areaId: undefined, nombreEstudiante: '', apePaEstudiante: '', apeMaEstudiante: '', user: { email: '', password: '', confirmPassword: '' } });
    }
  }, [estudiante, reset, usuarios, open]);

  // Validación de código único
  const codigoActual = watch('codigo');
  const codigoDuplicado = usuarios.some(u => u.correo === codigoActual);

  const onSubmit = (data: any) => {
    if (!estudiante) {
      // Solo validar usuario al crear
      if (!data.user.email || !data.user.password || !data.user.confirmPassword) {
        alert('Debe completar los datos de usuario');
        return;
      }
      if (data.user.password !== data.user.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      onSave({
        ...data,
        areaId: Number(data.areaId),
        user: {
          email: data.user.email,
          password: data.user.password
        }
      });
    } else {
      // Al editar, no enviar ni validar user
      const { user, ...rest } = data;
      onSave({
        ...rest,
        areaId: Number(data.areaId)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{estudiante ? 'Editar Estudiante' : 'Crear Nuevo Estudiante'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Código</label>
              <Input {...register('codigo', { required: 'El código es obligatorio' })} />
              {errors.codigo && <span className="text-red-500 text-xs">{errors.codigo.message}</span>}
              {codigoDuplicado && (
                <span className="text-red-500 text-xs">El código ya está en uso. No puede repetirse.</span>
              )}
            </div>
            <div>
              <label className="block mb-1">Nombres</label>
              <Input {...register('nombreEstudiante', { required: 'El nombre es obligatorio' })} />
              {errors.nombreEstudiante && <span className="text-red-500 text-xs">{errors.nombreEstudiante.message}</span>}
            </div>
            <div>
              <label className="block mb-1">Apellido Paterno</label>
              <Input {...register('apePaEstudiante', { required: 'El apellido paterno es obligatorio' })} />
              {errors.apePaEstudiante && <span className="text-red-500 text-xs">{errors.apePaEstudiante.message}</span>}
            </div>
            <div>
              <label className="block mb-1">Apellido Materno</label>
              <Input {...register('apeMaEstudiante', { required: 'El apellido materno es obligatorio' })} />
              {errors.apeMaEstudiante && <span className="text-red-500 text-xs">{errors.apeMaEstudiante.message}</span>}
            </div>
            <div>
              <label className="block mb-1">Sexo</label>
              <Select value={watch('sexo') || ''} onValueChange={val => setValue('sexo', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
              {errors.sexo && <span className="text-red-500 text-xs">{errors.sexo.message}</span>}
            </div>
            <div>
              <label className="block mb-1">Semestre</label>
              <Input {...register('semestre', { required: 'El semestre es obligatorio' })} />
              {errors.semestre && <span className="text-red-500 text-xs">{errors.semestre.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1">Área</label>
              <Select value={String(watch('areaId') || '')} onValueChange={val => setValue('areaId', Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un área" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(areas) ? areas.map(area => (
                    <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
              {errors.areaId && <span className="text-red-500 text-xs">El área es obligatoria</span>}
            </div>
          </div>
          {!estudiante && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-2">Datos de Usuario</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Correo electrónico</label>
                  <Input {...register('user.email', { required: 'El correo es obligatorio' })} type="email" />
                  {errors.user?.email && <span className="text-red-500 text-xs">{errors.user.email.message}</span>}
                </div>
                <div>
                  <label className="block mb-1">Contraseña</label>
                  <Input {...register('user.password', { required: 'La contraseña es obligatoria' })} type="password" />
                  {errors.user?.password && <span className="text-red-500 text-xs">{errors.user.password.message}</span>}
                </div>
                <div>
                  <label className="block mb-1">Repetir contraseña</label>
                  <Input {...register('user.confirmPassword', { required: 'Repita la contraseña' })} type="password" />
                  {errors.user?.confirmPassword && <span className="text-red-500 text-xs">{errors.user.confirmPassword.message}</span>}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" variant="default" disabled={codigoDuplicado}>{estudiante ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EstudianteDialog;
