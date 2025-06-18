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
  Trash2,
  Users
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
import { getToken } from '@/contexts/AuthContext';
import { API_URL } from '@/config/api';

// Tipos
interface TipoColaborador {
  id: number;
  name: string;
}

// Servicios API
const createTipoColaborador = async (name: string): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/tiposcolaborador`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify({ name })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear tipo de colaborador');
  }
  return data;
};

const updateTipoColaborador = async ({ id, name }: { id: number; name: string }): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/tiposcolaborador/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify({ name })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar tipo de colaborador');
  }
  return data;
};

const deleteTipoColaborador = async (id: number): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/tiposcolaborador/${id}`, {
    method: 'DELETE',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
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
  const filteredTiposColaborador = Array.isArray(tiposColaborador) ? tiposColaborador.filter(
    (tipo) => tipo.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <>
      <Card className="border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-t-lg border-b-2 border-secondary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-secondary">
                  Gestión de Roles de Colaborador
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Administra los tipos de colaborador existentes en el sistema
                </p>
              </div>
            </div>
            <Button 
              onClick={() => {
                setEditTipoColabId(null);
                setTipoColabName('');
                setShowAddTipoColabDialog(true);
              }}
              size="sm"
              className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> 
              Nuevo Rol de Colaborador
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
              <span className="ml-3 text-muted-foreground">Cargando tipos de colaborador...</span>
            </div>
          ) : filteredTiposColaborador.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {searchQuery ? 'No se encontraron tipos de colaborador' : 'No hay tipos de colaborador registrados'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery 
                    ? 'Intenta ajustar los términos de búsqueda para encontrar tipos de colaborador.'
                    : 'Comienza agregando el primer tipo de colaborador al sistema.'
                  }
                </p>
              </div>
              {!searchQuery && (
                <Button 
                  onClick={() => {
                    setEditTipoColabId(null);
                    setTipoColabName('');
                    setShowAddTipoColabDialog(true);
                  }}
                  className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Primer Tipo
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-secondary">
                    {filteredTiposColaborador.length} tipo{filteredTiposColaborador.length !== 1 ? 's' : ''} encontrado{filteredTiposColaborador.length !== 1 ? 's' : ''}
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
                      <TableHead className="font-semibold text-secondary">ID</TableHead>
                      <TableHead className="font-semibold text-secondary">Nombre</TableHead>
                      <TableHead className="text-right font-semibold text-secondary">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTiposColaborador.map((tipo, index) => (
                      <TableRow 
                        key={tipo.id}
                        className={`hover:bg-gradient-to-r hover:from-secondary/5 hover:to-primary/5 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                      >
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {tipo.id}
                          </Badge>
                        </TableCell>
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
                              className="hover:bg-secondary/10 hover:text-secondary transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteTipoColab(tipo.id)}
                              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Dialog para agregar/editar Tipo de Colaborador */}
          <Dialog open={showAddTipoColabDialog} onOpenChange={setShowAddTipoColabDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editTipoColabId ? 'Editar Tipo de Colaborador' : 'Crear Nuevo Tipo de Colaborador'}</DialogTitle>

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
        </CardContent>
      </Card>
    </>
  );
};

export default TipoColaboradorTabContent;
