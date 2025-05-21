
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

// Tipos
interface Role {
  id: number;
  name: string;
}

// Servicios API
const createRole = async (name: string): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear rol');
  }
  
  return data;
};

const updateRole = async ({ id, name }: { id: number, name: string }): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/roles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar rol');
  }
  
  return data;
};

const deleteRole = async (id: number): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/roles/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
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
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => {
            setEditRoleId(null);
            setRoleName('');
            setShowAddRoleDialog(true);
          }}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Nuevo Rol
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Roles de Usuario</CardTitle>
          <CardDescription>
            Gestione los roles existentes para los usuarios del sistema
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
                    Cargando roles...
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.id}</TableCell>
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
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-muted-foreground hover:text-destructive"
                          disabled={role.name === 'Administrador'} // Prevent deleting admin role
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

      {/* Dialog para agregar/editar Rol */}
      <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRoleId ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
            <DialogDescription>
              {editRoleId 
                ? 'Modifique la información del rol seleccionado.' 
                : 'Complete la información para crear un nuevo rol en el sistema.'}
            </DialogDescription>
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
    </>
  );
};

export default RolesTabContent;
