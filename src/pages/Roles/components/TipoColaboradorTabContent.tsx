
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  PlusCircle, 
  Pencil, 
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Tipos
interface TipoColaborador {
  id: number;
  name: string;
}

// Servicios API
const createTipoColaborador = async (name: string): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/tiposcolaborador', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear tipo de colaborador');
  }
  
  return data;
};

const updateTipoColaborador = async ({ id, name }: { id: number, name: string }): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/tiposcolaborador/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar tipo de colaborador');
  }
  
  return data;
};

const deleteTipoColaborador = async (id: number): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/tiposcolaborador/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar tipo de colaborador');
  }
  
  return data;
};

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
  // Dialog state para tipos de colaborador
  const [showAddTipoColabDialog, setShowAddTipoColabDialog] = useState(false);
  const [editTipoColabId, setEditTipoColabId] = useState<number | null>(null);
  const [tipoColabName, setTipoColabName] = useState('');

  // Query client
  const queryClient = useQueryClient();

  // Mutations para tipos de colaborador
  const createTipoColabMutation = useMutation({
    mutationFn: createTipoColaborador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposColaborador'] });
      toast.success('Tipo de colaborador creado exitosamente');
      setShowAddTipoColabDialog(false);
      setTipoColabName('');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const updateTipoColabMutation = useMutation({
    mutationFn: updateTipoColaborador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposColaborador'] });
      toast.success('Tipo de colaborador actualizado exitosamente');
      setShowAddTipoColabDialog(false);
      setEditTipoColabId(null);
      setTipoColabName('');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const deleteTipoColabMutation = useMutation({
    mutationFn: deleteTipoColaborador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposColaborador'] });
      toast.success('Tipo de colaborador eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Event handlers para tipos de colaborador
  const handleAddTipoColab = () => {
    if (!tipoColabName.trim()) {
      toast.error('El nombre del tipo de colaborador no puede estar vacío');
      return;
    }
    
    if (editTipoColabId) {
      updateTipoColabMutation.mutate({ id: editTipoColabId, name: tipoColabName });
    } else {
      createTipoColabMutation.mutate(tipoColabName);
    }
  };
  
  const handleEditTipoColab = (id: number, currentName: string) => {
    setEditTipoColabId(id);
    setTipoColabName(currentName);
    setShowAddTipoColabDialog(true);
  };
  
  const handleDeleteTipoColab = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este tipo de colaborador?')) {
      deleteTipoColabMutation.mutate(id);
    }
  };

  // Filtrado
  const filteredTiposColaborador = tiposColaborador.filter(
    (tipo) => tipo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => {
            setEditTipoColabId(null);
            setTipoColabName('');
            setShowAddTipoColabDialog(true);
          }}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Nuevo Tipo
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Roles de Colaborador</CardTitle>
          <CardDescription>
            Gestione los tipos de colaborador existentes en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Cargando tipos de colaborador...
                  </TableCell>
                </TableRow>
              ) : filteredTiposColaborador.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTiposColaborador.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell>{tipo.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {tipo.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditTipoColab(tipo.id, tipo.name)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteTipoColab(tipo.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para agregar/editar Tipo de Colaborador */}
      <Dialog open={showAddTipoColabDialog} onOpenChange={setShowAddTipoColabDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTipoColabId ? 'Editar Tipo de Colaborador' : 'Crear Nuevo Tipo de Colaborador'}</DialogTitle>
            <DialogDescription>
              {editTipoColabId 
                ? 'Modifique la información del tipo de colaborador seleccionado.' 
                : 'Complete la información para crear un nuevo tipo de colaborador en el sistema.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipoColabName">Nombre del Tipo de Colaborador</Label>
              <Input 
                id="tipoColabName" 
                placeholder="Ej: Coordinador Académico" 
                value={tipoColabName}
                onChange={(e) => setTipoColabName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTipoColabDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTipoColab}>
              {editTipoColabId ? 'Actualizar' : 'Crear Tipo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TipoColaboradorTabContent;
