import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Edit, Trash, Plus, UserSquare2 } from 'lucide-react';
import EstudianteDialog from './EstudianteDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import UserDialog from './UserDialog';

interface Estudiante {
  id: number;
  codigo: string;
  sexo: string;
  semestre: string;
  areaId: number;
  areaName: string;
  usuarioId: number;
  usuarioCorreo: string;
}

interface Area {
  id: number;
  name: string;
}

interface Usuario {
  id: number;
  correo: string;
}

interface EstudiantesTabContentProps {
  estudiantes: Estudiante[];
  isLoading: boolean;
  searchQuery: string;
  areas: Area[];
  usuarios: Usuario[];
}

const EstudiantesTabContent: React.FC<EstudiantesTabContentProps> = ({ 
  estudiantes, 
  isLoading, 
  searchQuery,
  areas,
  usuarios
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [createdEstudiante, setCreatedEstudiante] = useState<any>(null);
  const queryClient = useQueryClient();

  // Filtrar estudiantes basado en la búsqueda
  const filteredEstudiantes = estudiantes.filter(est => 
    est.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.usuarioCorreo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.areaName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Abrir diálogo para crear nuevo estudiante
  const handleCreateEstudiante = () => {
    setSelectedEstudiante(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar estudiante
  const handleEditEstudiante = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setIsDialogOpen(true);
  };

  // Crear estudiante
  const createEstudiante = async (data: any) => {
    const response = await fetch('http://localhost:3309/api/estudiantes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Error al crear estudiante');
    }
    return result;
  };

  // Actualizar estudiante
  const updateEstudiante = async ({ id, data }: { id: number; data: any }) => {
    const response = await fetch(`http://localhost:3309/api/estudiantes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Error al actualizar estudiante');
    }
    return result;
  };

  // Eliminar estudiante
  const deleteEstudiante = async (id: number) => {
    const response = await fetch(`http://localhost:3309/api/estudiantes/${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Error al eliminar estudiante');
    }
    return result;
  };

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: createEstudiante,
    onSuccess: () => {
      toast.success('Estudiante creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateEstudiante,
    onSuccess: () => {
      toast.success('Estudiante actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEstudiante,
    onSuccess: () => {
      toast.success('Estudiante eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Guardar estudiante
  const handleSaveEstudiante = async (data: any) => {
    if (selectedEstudiante) {
      updateMutation.mutate({ id: selectedEstudiante.id, data });
    } else {
      try {
        const result = await createEstudiante(data);
        if (result && result.estudianteId) {
          setCreatedEstudiante({
            ...data,
            id: result.estudianteId,
            areaId: data.areaId,
            areaName: areas.find(a => a.id === data.areaId)?.name || ''
          });
          setIsUserDialogOpen(true);
        }
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
        toast.success('Estudiante creado exitosamente');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  // Eliminar estudiante
  const handleDeleteEstudiante = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Estudiantes</CardTitle>
          <Button onClick={handleCreateEstudiante} variant="default" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Nuevo Estudiante
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Correo Usuario</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Semestre</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Cargando...</TableCell>
              </TableRow>
            ) : filteredEstudiantes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No hay estudiantes</TableCell>
              </TableRow>
            ) : (
              filteredEstudiantes.map(est => (
                <TableRow key={est.id}>
                  <TableCell>{est.codigo}</TableCell>
                  <TableCell>{est.usuarioCorreo}</TableCell>
                  <TableCell>{est.sexo}</TableCell>
                  <TableCell>{est.semestre}</TableCell>
                  <TableCell>{est.areaName}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => handleEditEstudiante(est)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Trash className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar estudiante?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. ¿Desea continuar?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEstudiante(est.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <EstudianteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveEstudiante}
        estudiante={selectedEstudiante}
        areas={areas}
        usuarios={usuarios}
      />
      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        areaId={createdEstudiante?.areaId}
        colaboradorId={null}
        estudianteId={createdEstudiante?.id}
        defaultEmail={''}
        onSave={() => {
          setIsUserDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['usuarios'] });
          queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
        }}
        roles={[]}
        areas={areas}
        tipoUsuarioId={4}
      />
    </Card>
  );
};

export default EstudiantesTabContent; 