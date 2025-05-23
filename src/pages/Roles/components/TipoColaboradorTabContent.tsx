
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Edit, Trash, Plus, UserSquare2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TipoColaborador {
  id: number;
  name: string;
}

interface TipoColaboradorTabContentProps {
  tiposColaborador: TipoColaborador[];
  isLoading: boolean;
  searchQuery: string;
}

const TipoColaboradorTabContent: React.FC<TipoColaboradorTabContentProps> = ({ 
  tiposColaborador, 
  isLoading, 
  searchQuery 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipoColaboradorName, setTipoColaboradorName] = useState('');
  const [selectedTipoColaborador, setSelectedTipoColaborador] = useState<TipoColaborador | null>(null);
  const queryClient = useQueryClient();
  
  // Filtrar tipos de colaborador basado en la búsqueda
  const filteredTiposColaborador = tiposColaborador.filter(tipo => 
    tipo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Abrir diálogo para crear nuevo tipo de colaborador
  const handleCreateTipoColaborador = () => {
    setSelectedTipoColaborador(null);
    setTipoColaboradorName('');
    setIsDialogOpen(true);
  };
  
  // Abrir diálogo para editar tipo de colaborador
  const handleEditTipoColaborador = (tipoColaborador: TipoColaborador) => {
    setSelectedTipoColaborador(tipoColaborador);
    setTipoColaboradorName(tipoColaborador.name);
    setIsDialogOpen(true);
  };
  
  // Crear tipo de colaborador
  const createTipoColaborador = async (name: string) => {
    const response = await fetch('http://localhost:3306/api/tiposcolaborador', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('iesrfa_token')}`
      },
      body: JSON.stringify({ name })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error al crear tipo de colaborador');
    }
    
    return result;
  };
  
  // Actualizar tipo de colaborador
  const updateTipoColaborador = async ({ id, name }: { id: number; name: string }) => {
    const response = await fetch(`http://localhost:3306/api/tiposcolaborador/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('iesrfa_token')}`
      },
      body: JSON.stringify({ name })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error al actualizar tipo de colaborador');
    }
    
    return result;
  };
  
  // Eliminar tipo de colaborador
  const deleteTipoColaborador = async (id: number) => {
    const response = await fetch(`http://localhost:3306/api/tiposcolaborador/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('iesrfa_token')}`
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error al eliminar tipo de colaborador');
    }
    
    return result;
  };
  
  // Mutaciones
  const createMutation = useMutation({
    mutationFn: (name: string) => createTipoColaborador(name),
    onSuccess: () => {
      toast.success('Tipo de colaborador creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['tiposColaborador'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateTipoColaborador({ id, name }),
    onSuccess: () => {
      toast.success('Tipo de colaborador actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['tiposColaborador'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteTipoColaborador,
    onSuccess: () => {
      toast.success('Tipo de colaborador eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['tiposColaborador'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  // Guardar tipo de colaborador
  const handleSaveTipoColaborador = () => {
    if (tipoColaboradorName.trim() === '') {
      toast.error('El nombre del tipo de colaborador no puede estar vacío');
      return;
    }
    
    if (selectedTipoColaborador) {
      updateMutation.mutate({ id: selectedTipoColaborador.id, name: tipoColaboradorName });
    } else {
      createMutation.mutate(tipoColaboradorName);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Roles de Colaborador
        </CardTitle>
        <Button 
          size="sm" 
          className="h-8 gap-1" 
          onClick={handleCreateTipoColaborador}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nuevo</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredTiposColaborador.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <UserSquare2 className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No se encontraron tipos de colaborador que coincidan con la búsqueda' : 'No hay tipos de colaborador registrados'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTiposColaborador.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-medium">{tipo.id}</TableCell>
                  <TableCell>{tipo.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditTipoColaborador(tipo)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el rol de colaborador <strong>{tipo.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMutation.mutate(tipo.id)}
                            >
                              Eliminar
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
        )}
        
        {/* Diálogo para crear/editar tipo de colaborador */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedTipoColaborador ? 'Editar Rol de Colaborador' : 'Crear Nuevo Rol de Colaborador'}
              </DialogTitle>
              <DialogDescription>
                {selectedTipoColaborador 
                  ? 'Modifique el nombre del rol de colaborador seleccionado.' 
                  : 'Complete la información para crear un nuevo rol de colaborador en el sistema.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del Rol</Label>
                <Input 
                  id="name" 
                  placeholder="Ej: Docente" 
                  value={tipoColaboradorName}
                  onChange={(e) => setTipoColaboradorName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTipoColaborador}>
                {selectedTipoColaborador ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TipoColaboradorTabContent;
