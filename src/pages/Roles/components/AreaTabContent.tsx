import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
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
    body: JSON.stringify({ name, descripcion })
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
    body: JSON.stringify({ name, descripcion })
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
      <div className="flex justify-end mb-4">
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="h-4 w-4 mr-1" /> Nueva Área
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Áreas</CardTitle>
          <CardDescription>
            Gestione las áreas disponibles en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Cargando áreas...
                    </TableCell>
                  </TableRow>
                ) : filteredAreas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAreas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>{area.id}</TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="secondary">
                          {area.name}
                        </Badge>
                      </TableCell>
                      <TableCell>{area.descripcion}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEditModal(area)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteArea(area.id)}
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
          </div>
        </CardContent>
      </Card>
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
    </>
  );
};

export default AreaTabContent; 