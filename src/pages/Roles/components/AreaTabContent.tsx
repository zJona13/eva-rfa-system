
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  PlusCircle, 
  Pencil, 
  Trash2,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Tipos
interface Area {
  id: number;
  name: string;
  descripcion: string;
}

// Servicios API
const createArea = async ({ name, descripcion }: { name: string; descripcion: string }): Promise<{ success: boolean, message: string }> => {
  const response = await fetch('http://localhost:3309/api/areas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: name.trim(), descripcion })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear área');
  }
  return data;
};

const updateArea = async ({ id, name, descripcion }: { id: number; name: string; descripcion: string }): Promise<{ success: boolean, message: string }> => {
  const response = await fetch(`http://localhost:3309/api/areas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: name.trim(), descripcion })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar área');
  }
  return data;
};

const deleteArea = async (id: number): Promise<{ success: boolean, message: string }> => {
  const response = await fetch(`http://localhost:3309/api/areas/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar área');
  }
  return data;
};

interface AreaTabContentProps {
  areas: Area[];
  isLoading: boolean;
  searchQuery: string;
}

const AreaTabContent: React.FC<AreaTabContentProps> = ({ areas, isLoading, searchQuery }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [areaName, setAreaName] = useState('');
  const [areaDesc, setAreaDesc] = useState('');
  const queryClient = useQueryClient();

  const createAreaMutation = useMutation({
    mutationFn: createArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Área creada exitosamente');
      setShowDialog(false);
      setAreaName('');
      setAreaDesc('');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const updateAreaMutation = useMutation({
    mutationFn: updateArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Área actualizada exitosamente');
      setShowDialog(false);
      setSelectedArea(null);
      setAreaName('');
      setAreaDesc('');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteAreaMutation = useMutation({
    mutationFn: deleteArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Área eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleOpenCreateModal = () => {
    setSelectedArea(null);
    setAreaName('');
    setAreaDesc('');
    setShowDialog(true);
  };

  const handleOpenEditModal = (area: Area) => {
    setSelectedArea(area);
    setAreaName(area.name);
    setAreaDesc(area.descripcion);
    setShowDialog(true);
  };

  const handleDeleteArea = (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar esta área?')) {
      deleteAreaMutation.mutate(id);
    }
  };

  const handleSaveArea = () => {
    if (!areaName.trim()) {
      toast.error('El nombre del área no puede estar vacío');
      return;
    }
    if (selectedArea) {
      updateAreaMutation.mutate({ id: selectedArea.id, name: areaName, descripcion: areaDesc });
    } else {
      createAreaMutation.mutate({ name: areaName, descripcion: areaDesc });
    }
  };

  const filteredAreas = areas.filter(
    (area) => area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card className="border-2 border-emerald-500/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-t-lg border-b-2 border-emerald-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-emerald-600">
                  Gestión de Áreas
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Administra las áreas disponibles en el sistema
                </p>
              </div>
            </div>
            <Button 
              onClick={handleOpenCreateModal}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> 
              Nueva Área
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 animate-ping h-8 w-8 border-4 border-emerald-500/20 rounded-full"></div>
              </div>
              <span className="ml-3 text-muted-foreground">Cargando áreas...</span>
            </div>
          ) : filteredAreas.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {searchQuery ? 'No se encontraron áreas' : 'No hay áreas registradas'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery 
                    ? 'Intenta ajustar los términos de búsqueda para encontrar áreas.'
                    : 'Comienza agregando la primera área al sistema.'
                  }
                </p>
              </div>
              {!searchQuery && (
                <Button 
                  onClick={handleOpenCreateModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Primera Área
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-emerald-600">
                    {filteredAreas.length} área{filteredAreas.length !== 1 ? 's' : ''} encontrada{filteredAreas.length !== 1 ? 's' : ''}
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">
                      Filtrado por: "{searchQuery}"
                    </Badge>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto bg-background rounded-lg border-2 border-emerald-500/10">
                <Table className="min-w-full">
                  <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="font-semibold text-emerald-600">ID</TableHead>
                      <TableHead className="font-semibold text-emerald-600">Nombre</TableHead>
                      <TableHead className="font-semibold text-emerald-600">Descripción</TableHead>
                      <TableHead className="text-right font-semibold text-emerald-600">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAreas.map((area, index) => (
                      <TableRow 
                        key={area.id}
                        className={`hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-teal-500/5 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                      >
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {area.id}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <Badge variant="secondary">
                            {area.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{area.descripcion}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleOpenEditModal(area)}
                              className="hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteArea(area.id)}
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

          {/* Dialog para agregar/editar Área */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedArea ? 'Editar Área' : 'Crear Nueva Área'}</DialogTitle>
                <DialogDescription>
                  {selectedArea 
                    ? 'Modifique la información del área seleccionada.' 
                    : 'Complete la información para crear una nueva área en el sistema.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="areaName">Nombre del Área</Label>
                  <Input 
                    id="areaName" 
                    placeholder="Ej: Recursos Humanos" 
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaDesc">Descripción</Label>
                  <Input 
                    id="areaDesc" 
                    placeholder="Descripción del área" 
                    value={areaDesc}
                    onChange={(e) => setAreaDesc(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveArea}>
                  {selectedArea ? 'Actualizar' : 'Crear Área'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};

export default AreaTabContent;
