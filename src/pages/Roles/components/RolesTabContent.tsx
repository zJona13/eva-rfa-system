import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Tipos
interface Role {
  id: number;
  name: string;
}

interface RolesTabContentProps {
  roles: Role[];
  isLoading: boolean;
  searchQuery: string;
}

const RolesTabContent: React.FC<RolesTabContentProps> = ({ roles, isLoading, searchQuery }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    async (newRoleName: string) => {
      const response = await fetch('http://localhost:3309/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName }),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el rol');
      }
      
      const data = await response.json();
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        toast.success('Rol creado exitosamente');
        setDialogOpen(false);
        setRoleName('');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Error al crear el rol');
      },
    }
  );

  const updateMutation = useMutation(
    async (updatedRole: Role) => {
      const response = await fetch(`http://localhost:3309/api/roles/${updatedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedRole.name }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el rol');
      }
      
      const data = await response.json();
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        toast.success('Rol actualizado exitosamente');
        setDialogOpen(false);
        setEditingRole(null);
        setRoleName('');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Error al actualizar el rol');
      },
    }
  );

  const deleteMutation = useMutation(
    async (roleId: number) => {
      const response = await fetch(`http://localhost:3309/api/roles/${roleId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el rol');
      }
      
      const data = await response.json();
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        toast.success('Rol eliminado exitosamente');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Error al eliminar el rol');
      },
    }
  );

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error('El nombre del rol no puede estar vacío');
      return;
    }

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, name: roleName });
    } else {
      createMutation.mutate(roleName);
    }
  };

  const handleDelete = async (roleId: number) => {
    deleteMutation.mutate(roleId);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(localSearchQuery.toLowerCase()) &&
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="bg-background/80 backdrop-blur-sm border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Cargando roles...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-2 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Gestión de Roles de Usuario</CardTitle>
              <CardDescription className="text-muted-foreground">
                Administra los roles existentes para los usuarios del sistema
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md"
                onClick={() => {
                  setEditingRole(null);
                  setRoleName('');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Rol de Usuario
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Editar Rol de Usuario' : 'Nuevo Rol de Usuario'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Nombre del Rol</Label>
                  <Input
                    id="role-name"
                    placeholder="Ingrese el nombre del rol"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={!roleName.trim() || createMutation.isPending || updateMutation.isPending}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar roles..." 
              className="pl-10 bg-background/50 border-2 focus:border-primary"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1 font-medium">
            {filteredRoles.length} roles encontrados
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">ID</TableHead>
                <TableHead className="font-semibold text-foreground">Nombre</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role, index) => (
                <TableRow key={role.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium">{role.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-start">
                      <Badge 
                        variant={
                          role.name === 'Administrador' ? 'destructive' :
                          role.name === 'Evaluador' ? 'default' :
                          role.name === 'Evaluado' ? 'secondary' :
                          'outline'
                        }
                        className="font-medium"
                      >
                        {role.name}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingRole(role);
                          setRoleName(role.name);
                          setDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar rol</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(role.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar rol</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredRoles.length === 0 && (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No se encontraron roles</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RolesTabContent;
