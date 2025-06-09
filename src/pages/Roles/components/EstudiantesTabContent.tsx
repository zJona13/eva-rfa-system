import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Edit, Trash, Plus, GraduationCap } from 'lucide-react';
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
  nombreEstudiante: string;
  apePaEstudiante: string;
  apeMaEstudiante: string;
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
  const filteredEstudiantes = estudiantes.filter(est => {
    const nombreCompleto = `${est.nombreEstudiante} ${est.apePaEstudiante} ${est.apeMaEstudiante}`.toLowerCase();
    return (
      est.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nombreCompleto.includes(searchQuery.toLowerCase()) ||
      est.usuarioCorreo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.areaName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
    <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg border-b-2 border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <GraduationCap className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-secondary">
                Gestión de Estudiantes
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Administra la información de todos los estudiantes
              </p>
            </div>
          </div>
          <Button 
            onClick={handleCreateEstudiante} 
            size="sm"
            className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Estudiante
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
              <div className="absolute inset-0 animate-ping h-8 w-8 border-4 border-secondary/20 rounded-full"></div>
            </div>
            <span className="ml-3 text-muted-foreground">Cargando estudiantes...</span>
          </div>
        ) : filteredEstudiantes.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-secondary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {searchQuery ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? 'Intenta ajustar los términos de búsqueda para encontrar estudiantes.'
                  : 'Comienza agregando el primer estudiante al sistema.'
                }
              </p>
            </div>
            {!searchQuery && (
              <Button 
                onClick={handleCreateEstudiante}
                className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Estudiante
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-secondary">
                  {filteredEstudiantes.length} estudiante{filteredEstudiantes.length !== 1 ? 's' : ''} encontrado{filteredEstudiantes.length !== 1 ? 's' : ''}
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Filtrado por: "{searchQuery}"
                  </Badge>
                )}
              </div>
            </div>

            <div className="overflow-x-auto bg-background rounded-lg border-2 border-secondary/10">
              <Table className="min-w-full">
                <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="font-semibold text-secondary">Código</TableHead>
                    <TableHead className="font-semibold text-secondary">Nombre</TableHead>
                    <TableHead className="font-semibold text-secondary">Correo Usuario</TableHead>
                    <TableHead className="font-semibold text-secondary">Sexo</TableHead>
                    <TableHead className="font-semibold text-secondary">Semestre</TableHead>
                    <TableHead className="font-semibold text-secondary">Área</TableHead>
                    <TableHead className="font-semibold text-secondary text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEstudiantes.map((est, index) => (
                    <TableRow 
                      key={est.id}
                      className={`hover:bg-gradient-to-r hover:from-secondary/5 hover:to-primary/5 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      }`}
                    >
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-secondary/5 border-secondary/30">
                          {est.codigo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-secondary">
                              {est.nombreEstudiante.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{`${est.nombreEstudiante} ${est.apePaEstudiante} ${est.apeMaEstudiante}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{est.usuarioCorreo}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${
                          est.sexo === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {est.sexo === 'M' ? 'Masculino' : 'Femenino'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {est.semestre}° Semestre
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{est.areaName}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleEditEstudiante(est)}
                            className="hover:bg-secondary/10 hover:text-secondary transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-2 border-destructive/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-destructive">¿Eliminar estudiante?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente al estudiante{' '}
                                  <strong className="text-foreground">
                                    {`${est.nombreEstudiante} ${est.apePaEstudiante} ${est.apeMaEstudiante}`}
                                  </strong> y todos sus datos asociados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteEstudiante(est.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar Estudiante
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <EstudianteDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveEstudiante}
          estudiante={selectedEstudiante}
          areas={areas}
          usuarios={usuarios}
        />
      </CardContent>
    </Card>
  );
};

export default EstudiantesTabContent;
