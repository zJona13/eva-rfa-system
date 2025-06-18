
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
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TipoContratoDialog from './TipoContratoDialog';
import { getToken } from '@/contexts/AuthContext';

// Tipos
interface TipoContrato {
  id: number;
  name: string;
}

// Servicios API
const createTipoContrato = async (name: string): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/tiposcontrato', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify({ name })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `Error ${response.status}: ${response.statusText}`
    }));
    throw new Error(errorData.message || 'Error al crear tipo de contrato');
  }
  const data = await response.json();
  return data;
};

const updateTipoContrato = async ({ id, name }: { id: number, name: string }): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`http://localhost:3309/api/tiposcontrato/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify({ name })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar tipo de contrato');
  }
  return data;
};

const deleteTipoContrato = async (id: number): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`http://localhost:3309/api/tiposcontrato/${id}`, {
    method: 'DELETE',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar tipo de contrato');
  }
  return data;
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
      <Card className="border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="bg-gradient-to-r from-accent/5 to-secondary/5 rounded-t-lg border-b-2 border-accent/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-accent">
                  Gestión de Tipos de Contrato
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Administra los tipos de contrato disponibles en el sistema
                </p>
              </div>
            </div>
            <Button 
              onClick={handleOpenCreateModal}
              size="sm"
              className="bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto text-xs sm:text-sm"
            >
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> 
              <span className="hidden sm:inline">Nuevo Tipo de Contrato</span>
              <span className="sm:hidden">Nuevo Tipo</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="relative">
                <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-accent border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 animate-ping h-6 w-6 sm:h-8 sm:w-8 border-4 border-accent/20 rounded-full"></div>
              </div>
              <span className="ml-3 text-sm sm:text-base text-muted-foreground">Cargando tipos de contrato...</span>
            </div>
          ) : filteredTiposContrato.length === 0 ? (
            <div className="text-center py-8 sm:py-12 space-y-4 px-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  {searchQuery ? 'No se encontraron tipos de contrato' : 'No hay tipos de contrato registrados'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery 
                    ? 'Intenta ajustar los términos de búsqueda para encontrar tipos de contrato.'
                    : 'Comienza agregando el primer tipo de contrato al sistema.'
                  }
                </p>
              </div>
              {!searchQuery && (
                <Button 
                  onClick={handleOpenCreateModal}
                  className="bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Primer Tipo
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-accent/5 to-secondary/5 rounded-lg border gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-accent">
                    {filteredTiposContrato.length} tipo{filteredTiposContrato.length !== 1 ? 's' : ''} encontrado{filteredTiposContrato.length !== 1 ? 's' : ''}
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">
                      Filtrado por: "{searchQuery}"
                    </Badge>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto bg-background rounded-lg border-2 border-accent/10">
                <Table className="min-w-full">
                  <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="font-semibold text-accent text-xs sm:text-sm px-2 sm:px-4">ID</TableHead>
                      <TableHead className="font-semibold text-accent text-xs sm:text-sm px-2 sm:px-4">Nombre</TableHead>
                      <TableHead className="text-right font-semibold text-accent text-xs sm:text-sm px-2 sm:px-4">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTiposContrato.map((tipo, index) => (
                      <TableRow 
                        key={tipo.id}
                        className={`hover:bg-gradient-to-r hover:from-accent/5 hover:to-secondary/5 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                      >
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {tipo.id}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium px-2 sm:px-4 py-2 sm:py-3">
                          <Badge variant="secondary" className="text-xs">
                            {tipo.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleOpenEditModal(tipo)}
                              className="hover:bg-accent/10 hover:text-accent transition-colors h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteTipoContrato(tipo.id)}
                              className="hover:bg-destructive/10 hover:text-destructive transition-colors h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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

          <TipoContratoDialog
            open={showDialog}
            onOpenChange={setShowDialog}
            tipoContrato={selectedTipoContrato}
            onSave={handleSaveTipoContrato}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default TipoContratoTabContent;
