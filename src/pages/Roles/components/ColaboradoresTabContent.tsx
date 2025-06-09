
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Edit, Trash, Plus, UserSquare2 } from 'lucide-react';
import { format } from 'date-fns';
import ColaboradorDialog from './ColaboradorDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import UserDialog from './UserDialog';

interface TipoColaborador {
  id: number;
  name: string;
}

interface TipoContrato {
  id: number;
  name: string;
}

interface Colaborador {
  id: number;
  fullName: string;
  nombres: string;
  apePat: string;
  apeMat: string;
  birthDate: string;
  address: string;
  phone: string;
  dni: string;
  active: boolean;
  roleId: number;
  roleName: string;
  contractId: number;
  startDate: string;
  endDate: string;
  contractActive: boolean;
  contractTypeId: number;
  contractType: string;
  areaName: string;
  areaId: number;
}

interface ColaboradoresTabContentProps {
  colaboradores: Colaborador[];
  isLoading: boolean;
  searchQuery: string;
  tiposColaborador: TipoColaborador[];
  tiposContrato: TipoContrato[];
  roles?: any[];
  areas?: any[];
}

const ColaboradoresTabContent: React.FC<ColaboradoresTabContentProps> = ({ 
  colaboradores, 
  isLoading, 
  searchQuery,
  tiposColaborador,
  tiposContrato,
  roles = [],
  areas = []
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [createdColaborador, setCreatedColaborador] = useState<Colaborador | null>(null);
  const queryClient = useQueryClient();
  
  // Filtrar colaboradores basado en la búsqueda
  const filteredColaboradores = colaboradores.filter(colab => 
    colab.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    colab.dni.includes(searchQuery) ||
    colab.phone.includes(searchQuery) ||
    colab.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Abrir diálogo para crear nuevo colaborador
  const handleCreateColaborador = () => {
    setSelectedColaborador(null);
    setIsDialogOpen(true);
  };
  
  // Abrir diálogo para editar colaborador
  const handleEditColaborador = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsDialogOpen(true);
  };
  
  // Crear colaborador
  const createColaborador = async (data: any) => {
    const response = await fetch('http://localhost:3309/api/colaboradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Error al crear colaborador');
    }
    return result;
  };
  
  // Actualizar colaborador
  const updateColaborador = async ({ id, data }: { id: number; data: any }) => {
    const response = await fetch(`http://localhost:3309/api/colaboradores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error al actualizar colaborador');
    }
    
    return result;
  };
  
  // Eliminar colaborador
  const deleteColaborador = async (id: number) => {
    const response = await fetch(`http://localhost:3309/api/colaboradores/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error al eliminar colaborador');
    }
    
    return result;
  };
  
  // Mutaciones
  const createMutation = useMutation({
    mutationFn: createColaborador,
    onSuccess: () => {
      toast.success('Colaborador creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: updateColaborador,
    onSuccess: () => {
      toast.success('Colaborador actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteColaborador,
    onSuccess: () => {
      toast.success('Colaborador eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  // Guardar colaborador
  const handleSaveColaborador = async (data: any) => {
    // Normaliza los campos numéricos obligatorios
    const payload = {
      ...data,
      areaId: data.areaId ? Number(data.areaId) : undefined,
      roleId: data.roleId ? Number(data.roleId) : undefined,
      contractTypeId: data.contractTypeId ? Number(data.contractTypeId) : undefined,
    };
    console.log('Payload enviado:', payload);
    if (selectedColaborador) {
      updateMutation.mutate({ id: selectedColaborador.id, data: payload });
    } else {
      try {
        const result = await createColaborador(payload);
        if (result && result.colaboradorId) {
          setCreatedColaborador({ 
            ...payload, 
            id: result.colaboradorId, 
            fullName: `${payload.nombres} ${payload.apePat} ${payload.apeMat}`,
            areaId: Number(payload.areaId),
            areaName: areas.find(a => a.id === Number(payload.areaId))?.name || ''
          });
          setIsUserDialogOpen(true);
        }
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
        toast.success('Colaborador creado exitosamente');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };
  
  // Guardar usuario asociado
  const handleSaveUser = async (userData: any) => {
    try {
      const response = await fetch('http://localhost:3309/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, colaboradorId: createdColaborador?.id })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error al crear usuario');
      toast.success('Usuario creado exitosamente');
      setIsUserDialogOpen(false);
      setCreatedColaborador(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  return (
    <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <UserSquare2 className="h-5 w-5 text-primary" />
              Gestión de Colaboradores
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Administre el personal y sus contratos laborales
            </p>
          </div>
          <Button 
            onClick={handleCreateColaborador}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Colaborador
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Cargando colaboradores...</p>
          </div>
        ) : filteredColaboradores.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <UserSquare2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No hay colaboradores</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? 'No se encontraron colaboradores que coincidan con la búsqueda' : 'Comience agregando el primer colaborador al sistema'}
              </p>
            </div>
            {!searchQuery && (
              <Button onClick={handleCreateColaborador} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Colaborador
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border bg-background/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Colaborador</TableHead>
                  <TableHead className="font-semibold">DNI</TableHead>
                  <TableHead className="font-semibold">Rol</TableHead>
                  <TableHead className="font-semibold">Área</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">Contrato</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">Estado</TableHead>
                  <TableHead className="text-right font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColaboradores.map((colaborador, index) => (
                  <TableRow key={colaborador.id} className={`hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-background/50' : 'bg-muted/20'}`}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{colaborador.fullName}</div>
                        <div className="text-xs text-muted-foreground">{colaborador.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                        {colaborador.dni}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {colaborador.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {colaborador.areaName || 'Sin área asignada'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="text-xs font-medium">{colaborador.contractType}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(colaborador.startDate)} - {formatDate(colaborador.endDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge 
                        variant={colaborador.active && colaborador.contractActive ? "default" : "destructive"} 
                        className={colaborador.active && colaborador.contractActive ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                      >
                        {colaborador.active && colaborador.contractActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditColaborador(colaborador)}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente al colaborador <strong>{colaborador.fullName}</strong> del sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate(colaborador.id)}
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
          </div>
        )}
        
        <ColaboradorDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          colaborador={selectedColaborador}
          tiposColaborador={tiposColaborador}
          tiposContrato={tiposContrato}
          roles={roles}
          areas={areas}
          onSave={handleSaveColaborador}
        />
        
        {/* Diálogo de usuario asociado (paso 2) */}
        <UserDialog
          open={isUserDialogOpen}
          onOpenChange={setIsUserDialogOpen}
          userData={{
            name: createdColaborador?.fullName || '',
            email: '',
            roleId: '',
            colaboradorId: createdColaborador?.id,
            areaId: createdColaborador?.areaId ? String(createdColaborador.areaId) : '',
            active: true
          }}
          roles={roles}
          areas={areas}
          onSubmit={handleSaveUser}
          isSubmitting={false}
        />
      </CardContent>
    </Card>
  );
};

export default ColaboradoresTabContent;
