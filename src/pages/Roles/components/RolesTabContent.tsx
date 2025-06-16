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
  ShieldCheck
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

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Tipos
interface Role {
  id: number;
  name: string;
}

// Servicios API - Updated port from 5000 to 3309
const createRole = async (name: string): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear rol');
  }
  
  return data;
};

const updateRole = async ({ id, name }: { id: number, name: string }): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar rol');
  }
  
  return data;
};

const deleteRole = async (id: number): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/roles/${id}`, {
    method: 'DELETE',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar rol');
  }
  
  return data;
};

interface RolesTabContentProps {
  roles: Role[];
  isLoading: boolean;
  searchQuery: string;
}

const RolesTabContent: React.FC<RolesTabContentProps> = ({ roles, isLoading, searchQuery }) => {
  // State for Dialog
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState('');

  // Query client
  const queryClient = useQueryClient();

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol creado exitosamente');
      setShowAddRoleDialog(false);
      setRoleName('');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol actualizado exitosamente');
      setShowAddRoleDialog(false);
      setEditRoleId(null);
      setRoleName('');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Event handlers
  const handleAddRole = () => {
    if (!roleName.trim()) {
      toast.error('El nombre del rol no puede estar vacío');
      return;
    }
    
    if (editRoleId) {
      updateRoleMutation.mutate({ id: editRoleId, name: roleName });
    } else {
      createRoleMutation.mutate(roleName);
    }
  };
  
  const handleEditRole = (roleId: number, currentName: string) => {
    setEditRoleId(roleId);
    setRoleName(currentName);
    setShowAddRoleDialog(true);
  };
  
  const handleDeleteRole = async (roleId: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este rol?')) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  // Filtrado
  const filteredRoles = roles.filter(
    (role) => role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg border-b-2 border-primary/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-primary">
                  Gestión de Roles de Usuario
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Administra los roles existentes para los usuarios del sistema
                </p>
              </div>
            </div>
            <Button 
              onClick={() => {
                setEditRoleId(null);
                setRoleName('');
                setShowAddRoleDialog(true);
              }}
              size="sm"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto text-xs sm:text-sm"
            >
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> 
              <span className="hidden sm:inline">Nuevo Rol de Usuario</span>
              <span className="sm:hidden">Nuevo Rol</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="relative">
                <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 animate-ping h-6 w-6 sm:h-8 sm:w-8 border-4 border-primary/20 rounded-full"></div>
              </div>
              <span className="ml-3 text-sm sm:text-base text-muted-foreground">Cargando roles...</span>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-8 sm:py-12 space-y-4 px-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  {searchQuery ? 'No se encontraron roles' : 'No hay roles registrados'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery 
                    ? 'Intenta ajustar los términos de búsqueda para encontrar roles.'
                    : 'Comienza agregando el primer rol al sistema.'
                  }
                </p>
              </div>
              {!searchQuery && (
                <Button 
                  onClick={() => {
                    setEditRoleId(null);
                    setRoleName('');
                    setShowAddRoleDialog(true);
                  }}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Primer Rol
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {filteredRoles.length} rol{filteredRoles.length !== 1 ? 'es' : ''} encontrado{filteredRoles.length !== 1 ? 's' : ''}
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
                      <TableHead className="font-semibold text-primary text-xs sm:text-sm px-2 sm:px-4">ID</TableHead>
                      <TableHead className="font-semibold text-primary text-xs sm:text-sm px-2 sm:px-4">Nombre</TableHead>
                      <TableHead className="text-right font-semibold text-primary text-xs sm:text-sm px-2 sm:px-4">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role, index) => (
                      <TableRow 
                        key={role.id}
                        className={`hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                      >
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {role.id}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium px-2 sm:px-4 py-2 sm:py-3">
                          <Badge variant={role.name === "Administrador" ? "destructive" : "default"} className="text-xs">
                            {role.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditRole(role.id, role.name)}
                              className="hover:bg-primary/10 hover:text-primary transition-colors h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteRole(role.id)}
                              className="hover:bg-destructive/10 hover:text-destructive transition-colors h-8 w-8 sm:h-10 sm:w-10"
                              disabled={role.name === 'Administrador'}
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

          {/* Dialog para agregar/editar Rol */}
          <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
            <DialogContent className="sm:max-w-[425px] mx-4">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">{editRoleId ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName" className="text-sm">Nombre del Rol</Label>
                  <Input 
                    id="roleName" 
                    placeholder="Ej: Coordinador" 
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setShowAddRoleDialog(false)} className="text-sm">
                  Cancelar
                </Button>
                <Button onClick={handleAddRole} className="text-sm">
                  {editRoleId ? 'Actualizar' : 'Crear Rol'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};

export default RolesTabContent;
