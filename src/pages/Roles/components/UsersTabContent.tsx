import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import UserDialog, { UserFormValues } from './UserDialog';

// Tipos
interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  role: string;
  roleId: number;
  colaboradorId?: number;
  colaboradorName?: string;
  areaId?: number;
  areaName?: string;
}

interface Role {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
  descripcion: string;
}

interface UsersTabContentProps {
  users: User[];
  isLoading: boolean;
  searchQuery: string;
  roles: Role[];
  areas: Area[];
}

// Servicios API - Fixed token name
const createUser = async (userData: UserFormValues): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('iesrfa_token');
  const response = await fetch('http://localhost:3306/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      name: userData.name,
      email: userData.email,
      password: userData.password,
      active: userData.active,
      roleId: parseInt(userData.roleId),
      colaboradorId: userData.colaboradorId && userData.colaboradorId !== 'none' 
        ? parseInt(userData.colaboradorId) 
        : null,
      areaId: userData.areaId && userData.areaId !== 'none'
        ? parseInt(userData.areaId)
        : null
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear usuario');
  }
  
  return data;
};

const updateUser = async (userData: UserFormValues & { id?: number }): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('iesrfa_token');
  const response = await fetch(`http://localhost:3306/api/users/${userData.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      name: userData.name,
      email: userData.email,
      password: userData.password,
      active: userData.active,
      roleId: parseInt(userData.roleId),
      colaboradorId: userData.colaboradorId && userData.colaboradorId !== 'none' 
        ? parseInt(userData.colaboradorId) 
        : null,
      areaId: userData.areaId && userData.areaId !== 'none'
        ? parseInt(userData.areaId)
        : null
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar usuario');
  }
  
  return data;
};

const deleteUser = async (id: number): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('iesrfa_token');
  const response = await fetch(`http://localhost:3306/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar usuario');
  }
  
  return data;
};

const UsersTabContent: React.FC<UsersTabContentProps> = ({ users, isLoading, searchQuery, roles, areas }) => {
  // State
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query client
  const queryClient = useQueryClient();

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado exitosamente');
      setIsUserDialogOpen(false);
      setSelectedUser(null);
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado exitosamente');
      setIsUserDialogOpen(false);
      setSelectedUser(null);
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Event handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este usuario?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSubmitUser = (values: UserFormValues & { id?: number }) => {
    setIsSubmitting(true);
    
    if (values.id) {
      updateUserMutation.mutate(values);
    } else {
      createUserMutation.mutate(values);
    }
  };

  const toggleUserStatus = (user: User) => {
    const updatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      active: !user.active,
      roleId: String(user.roleId),
      colaboradorId: user.colaboradorId ? String(user.colaboradorId) : undefined,
      areaId: user.areaId ? String(user.areaId) : undefined
    };
    
    updateUserMutation.mutate(updatedUser);
  };

  // Filtrado
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.colaboradorName && user.colaboradorName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateUser}>
          <PlusCircle className="h-4 w-4 mr-1" /> Nuevo Usuario
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Gestione los usuarios del sistema y sus roles asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo electrónico</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Administrador' ? 'destructive' : 'default'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.colaboradorName ? (
                          <span className="text-sm">{user.colaboradorName}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.areaName ? (
                          <span className="text-sm">{user.areaName}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin área</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={user.active} 
                          onCheckedChange={() => toggleUserStatus(user)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleEditUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.role === 'Administrador'}
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

      {/* Diálogo para crear/editar usuario */}
      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        userData={selectedUser}
        roles={roles}
        areas={areas}
        onSubmit={handleSubmitUser}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default UsersTabContent;
