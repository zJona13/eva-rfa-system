
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
import TipoContratoDialog from './TipoContratoDialog';

// Tipos
interface TipoContrato {
  id: number;
  name: string;
}

// Servicios API
const createTipoContrato = async (name: string): Promise<{ success: boolean, message: string }> => {
  try {
    const token = localStorage.getItem('iesrfa_token');
    console.log('Creating tipo contrato with token:', token ? 'Token exists' : 'No token');
    const response = await fetch('http://localhost:3306/api/tiposcontrato', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    
    console.log('Create response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Error ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.message || 'Error al crear tipo de contrato');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating tipo contrato:', error);
    throw error;
  }
};

const updateTipoContrato = async ({ id, name }: { id: number, name: string }): Promise<{ success: boolean, message: string }> => {
  try {
    const token = localStorage.getItem('iesrfa_token');
    const response = await fetch(`http://localhost:3306/api/tiposcontrato/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Error ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.message || 'Error al actualizar tipo de contrato');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating tipo contrato:', error);
    throw error;
  }
};

const deleteTipoContrato = async (id: number): Promise<{ success: boolean, message: string }> => {
  try {
    const token = localStorage.getItem('iesrfa_token');
    const response = await fetch(`http://localhost:3306/api/tiposcontrato/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Error ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.message || 'Error al eliminar tipo de contrato');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting tipo contrato:', error);
    throw error;
  }
};

interface TipoContratoTabContentProps {
  tiposContrato: TipoContrato[];
  isLoading: boolean;
  searchQuery: string;
}

const TipoContratoTabContent: React.FC<TipoContratoTabContentProps> = ({ 
  tiposContrato, 
  isLoading, 
  searchQuery 
}) => {
  // State for Dialog and selected tipo contrato
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTipoContrato, setSelectedTipoContrato] = useState<TipoContrato | null>(null);

  // Query client
  const queryClient = useQueryClient();

  // Mutations
  const createTipoContratoMutation = useMutation({
    mutationFn: createTipoContrato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposContrato'] });
      toast.success('Tipo de contrato creado exitosamente');
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const updateTipoContratoMutation = useMutation({
    mutationFn: updateTipoContrato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposContrato'] });
      toast.success('Tipo de contrato actualizado exitosamente');
      setShowDialog(false);
      setSelectedTipoContrato(null);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const deleteTipoContratoMutation = useMutation({
    mutationFn: deleteTipoContrato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposContrato'] });
      toast.success('Tipo de contrato eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Event handlers
  const handleOpenCreateModal = () => {
    setSelectedTipoContrato(null);
    setShowDialog(true);
  };
  
  const handleOpenEditModal = (tipoContrato: TipoContrato) => {
    setSelectedTipoContrato(tipoContrato);
    setShowDialog(true);
  };
  
  const handleDeleteTipoContrato = (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este tipo de contrato?')) {
      deleteTipoContratoMutation.mutate(id);
    }
  };
  
  const handleSaveTipoContrato = (name: string) => {
    if (selectedTipoContrato) {
      updateTipoContratoMutation.mutate({ id: selectedTipoContrato.id, name });
    } else {
      createTipoContratoMutation.mutate(name);
    }
  };

  // Filtrado
  const filteredTiposContrato = tiposContrato.filter(
    (tipo) => tipo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="h-4 w-4 mr-1" /> Nuevo Tipo de Contrato
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Tipos de Contrato</CardTitle>
          <CardDescription>
            Gestione los tipos de contrato disponibles en el sistema
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
                    Cargando tipos de contrato...
                  </TableCell>
                </TableRow>
              ) : filteredTiposContrato.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTiposContrato.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell>{tipo.id}</TableCell>
                    <TableCell className="font-medium">
                      <Badge variant="secondary">
                        {tipo.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEditModal(tipo)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteTipoContrato(tipo.id)}
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

      <TipoContratoDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        tipoContrato={selectedTipoContrato}
        onSave={handleSaveTipoContrato}
      />
    </>
  );
};

export default TipoContratoTabContent;
