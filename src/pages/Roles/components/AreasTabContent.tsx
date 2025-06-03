
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import AreaDialog, { AreaFormValues } from './AreaDialog';

interface Area {
  id: number;
  name: string;
  description?: string;
}

interface AreasTabContentProps {
  areas: Area[];
  isLoading: boolean;
  searchQuery: string;
}

const createArea = async (areaData: AreaFormValues): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('iesrfa_token');
  const response = await fetch('http://localhost:3306/api/areas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(areaData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear área');
  }
  
  return data;
};

const updateArea = async (areaData: AreaFormValues & { id?: number }): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('iesrfa_token');
  const response = await fetch(`http://localhost:3306/api/areas/${areaData.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(areaData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar área');
  }
  
  return data;
};

const deleteArea = async (id: number): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('iesrfa_token');
  const response = await fetch(`http://localhost:3306/api/areas/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar área');
  }
  
  return data;
};

const AreasTabContent: React.FC<AreasTabContentProps> = ({ areas, isLoading, searchQuery }) => {
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const createAreaMutation = useMutation({
    mutationFn: createArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Área creada exitosamente');
      setIsAreaDialogOpen(false);
      setSelectedArea(null);
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  const updateAreaMutation = useMutation({
    mutationFn: updateArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Área actualizada exitosamente');
      setIsAreaDialogOpen(false);
      setSelectedArea(null);
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
      setIsSubmitting(false);
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

  const handleCreateArea = () => {
    setSelectedArea(null);
    setIsAreaDialogOpen(true);
  };

  const handleEditArea = (area: Area) => {
    setSelectedArea(area);
    setIsAreaDialogOpen(true);
  };

  const handleDeleteArea = (areaId: number) => {
    if (window.confirm('¿Está seguro que desea eliminar esta área?')) {
      deleteAreaMutation.mutate(areaId);
    }
  };

  const handleSubmitArea = (values: AreaFormValues & { id?: number }) => {
    setIsSubmitting(true);
    
    if (values.id) {
      updateAreaMutation.mutate(values);
    } else {
      createAreaMutation.mutate(values);
    }
  };

  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (area.description && area.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateArea}>
          <PlusCircle className="h-4 w-4 mr-1" /> Nueva Área
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Áreas</CardTitle>
          <CardDescription>
            Gestione las áreas de la organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Cargando áreas...
                  </TableCell>
                </TableRow>
              ) : filteredAreas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAreas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>
                      {area.description ? (
                        <span className="text-sm">{area.description}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin descripción</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditArea(area)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteArea(area.id)}
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

      <AreaDialog
        open={isAreaDialogOpen}
        onOpenChange={setIsAreaDialogOpen}
        areaData={selectedArea}
        onSubmit={handleSubmitArea}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default AreasTabContent;
