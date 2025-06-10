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
        body: JSON.stringify({ 
          ...userData, 
          colaboradorId: createdColaborador?.id,
          areaId: Number(userData.areaId)
        })
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
    <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg border-b-2 border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserSquare2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-primary">
                Gestión de Colaboradores
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Administra la información de todos los colaboradores
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
            onClick={handleCreateColaborador}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Colaborador
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <div className="absolute inset-0 animate-ping h-8 w-8 border-4 border-primary/20 rounded-full"></div>
            </div>
            <span className="ml-3 text-muted-foreground">Cargando colaboradores...</span>
          </div>
        ) : filteredColaboradores.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <UserSquare2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {searchQuery ? 'No se encontraron colaboradores' : 'No hay colaboradores registrados'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? 'Intenta ajustar los términos de búsqueda para encontrar colaboradores.'
                  : 'Comienza agregando el primer colaborador al sistema.'
                }
              </p>
            </div>
            {!searchQuery && (
              <Button 
                onClick={handleCreateColaborador}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Colaborador
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">
                  {filteredColaboradores.length} colaborador{filteredColaboradores.length !== 1 ? 'es' : ''} encontrado{filteredColaboradores.length !== 1 ? 's' : ''}
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Filtrado por: "{searchQuery}"
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto bg-background rounded-lg border-2 border-primary/10">
              <Table className="min-w-full">
                <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="font-semibold text-primary">Nombre Completo</TableHead>
                    <TableHead className="font-semibold text-primary">DNI</TableHead>
                    <TableHead className="font-semibold text-primary">Rol</TableHead>
                    <TableHead className="font-semibold text-primary">Área</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-primary">Contrato</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-primary">Estado</TableHead>
                    <TableHead className="text-right font-semibold text-primary">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColaboradores.map((colaborador, index) => (
                    <TableRow 
                      key={colaborador.id} 
                      className={`hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {colaborador.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{colaborador.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {colaborador.dni}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {colaborador.roleName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {colaborador.areaName || (
                            <span className="text-muted-foreground italic">Sin área asignada</span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground font-mono">
                            {formatDate(colaborador.startDate)} - {formatDate(colaborador.endDate)}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {colaborador.contractType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge 
                          variant={colaborador.active && colaborador.contractActive ? "default" : "destructive"} 
                          className={`text-xs font-medium ${
                            colaborador.active && colaborador.contractActive 
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {colaborador.active && colaborador.contractActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditColaborador(colaborador)}
                            className="hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-2 border-destructive/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-destructive">
                                  ¿Confirmar eliminación?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente al colaborador{' '}
                                  <strong className="text-foreground">{colaborador.fullName}</strong> y todos sus datos asociados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteMutation.mutate(colaborador.id)}
                                >
                                  Eliminar Colaborador
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
