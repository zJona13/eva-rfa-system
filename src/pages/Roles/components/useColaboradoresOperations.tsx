
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useColaboradoresOperations = () => {
  const queryClient = useQueryClient();

  // Crear colaborador
  const createColaborador = async (data: any) => {
    const response = await fetch('http://localhost:3309/api/colaboradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Error al crear colaborador');
    }
    return result;
  };

  // Actualizar colaborador
  const updateColaborador = async ({ id, data }: { id: number; data: any }) => {
    const response = await fetch(`http://localhost:3309/api/colaboradores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error al actualizar colaborador');
    }
    
    return result;
  };

  // Eliminar colaborador
  const deleteColaborador = async (id: number) => {
    const response = await fetch(`http://localhost:3309/api/colaboradores/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error al eliminar colaborador');
    }
    
    return result;
  };

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: createColaborador,
    onSuccess: () => {
      toast.success('Colaborador creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateColaborador,
    onSuccess: () => {
      toast.success('Colaborador actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteColaborador,
    onSuccess: () => {
      toast.success('Colaborador eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return {
    createColaborador,
    createMutation,
    updateMutation,
    deleteMutation
  };
};
