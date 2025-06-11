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

// Tipos
interface Role {
  id: number;
  name: string;
}

// Servicios API - Updated port from 5000 to 3309
const createRole = async (name: string): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/roles', {
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
  const response = await fetch(`http://localhost:3309/api/roles/${id}`, {
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
  const response = await fetch(`http://localhost:3309/api/roles/${id}`, {
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
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg border-b-2 border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-primary">
                  Gestión de Roles de Usuario
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
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
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> 
              Nuevo Rol de Usuario
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
              <span className="ml-3 text-muted-foreground">Cargando roles...</span>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {searchQuery ? 'No se encontraron roles' : 'No hay roles registrados'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
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
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Primer Rol
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary">
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
                      <TableHead className="font-semibold text-primary">ID</TableHead>
                      <TableHead className="font-semibold text-primary">Nombre</TableHead>
                      <TableHead className="text-right font-semibold text-primary">Acciones</TableHead>
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
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {role.id}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <Badge variant={role.name === "Administrador" ? "destructive" : "default"}>
                            {role.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditRole(role.id, role.name)}
                              className="hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteRole(role.id)}
                              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                              disabled={role.name === 'Administrador'}
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

          {/* Dialog para agregar/editar Rol */}
          <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editRoleId ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>

              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Nombre del Rol</Label>
                  <Input 
                    id="roleName" 
                    placeholder="Ej: Coordinador" 
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddRoleDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddRole}>
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
