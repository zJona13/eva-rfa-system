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
  Trash2,
  UserCog
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import UserDialog, { UserFormValues } from './UserDialog';
import { getToken } from '@/contexts/AuthContext';

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
  estudianteName?: string;
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

const updateUser = async (userData: UserFormValues & { id?: number }): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`http://localhost:3309/api/users/${userData.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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

const deleteUser = async (userId: number): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`http://localhost:3309/api/users/${userId}`, {
    method: 'DELETE',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar usuario');
  }
  return data;
};

const createUser = async (userData: UserFormValues): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear usuario');
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

  // Solo mutación de actualización
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

  // Event handlers
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleSubmitUser = (values: UserFormValues & { id?: number }) => {
    setIsSubmitting(true);
    if (values.id) {
      updateUserMutation.mutate(values);
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
      <Card className="border-2 border-muted-foreground/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="bg-gradient-to-r from-muted-foreground/5 to-primary/5 rounded-t-lg border-b-2 border-muted-foreground/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted-foreground/10 rounded-lg">
                <UserCog className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-muted-foreground">
                  Gestión de Usuarios
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Administra los usuarios del sistema y sus roles asignados
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="relative">
                <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-muted-foreground border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 animate-ping h-6 w-6 sm:h-8 sm:w-8 border-4 border-muted-foreground/20 rounded-full"></div>
              </div>
              <span className="ml-3 text-sm sm:text-base text-muted-foreground">Cargando usuarios...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 sm:py-12 space-y-4 px-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-muted-foreground/20 to-primary/20 rounded-full flex items-center justify-center">
                <UserCog className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery 
                    ? 'Intenta ajustar los términos de búsqueda para encontrar usuarios.'
                    : 'Los usuarios se crean automáticamente al agregar colaboradores o estudiantes.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-muted-foreground/5 to-primary/5 rounded-lg border gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">
                      Filtrado por: "{searchQuery}"
                    </Badge>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto bg-background rounded-lg border-2 border-muted-foreground/10">
                <Table className="min-w-full">
                  <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="font-semibold text-muted-foreground text-xs sm:text-sm px-2 sm:px-4">Nombre</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-xs sm:text-sm px-2 sm:px-4 hidden sm:table-cell">Correo</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-xs sm:text-sm px-2 sm:px-4">Rol</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-xs sm:text-sm px-2 sm:px-4 hidden lg:table-cell">Colaborador</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-xs sm:text-sm px-2 sm:px-4 hidden lg:table-cell">Área</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-xs sm:text-sm px-2 sm:px-4">Estado</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground text-xs sm:text-sm px-2 sm:px-4">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow 
                        key={user.id}
                        className={`hover:bg-gradient-to-r hover:from-muted-foreground/5 hover:to-primary/5 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                      >
                        <TableCell className="font-medium px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-muted-foreground/20 to-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-muted-foreground">
                                {(user.colaboradorName || user.estudianteName || user.name).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-medium truncate">
                                {user.colaboradorName
                                  ? user.colaboradorName
                                  : (user.estudianteName ? user.estudianteName : user.name)
                                }
                              </div>
                              <div className="text-xs text-muted-foreground truncate sm:hidden">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                          <span className="text-xs sm:text-sm">{user.email}</span>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <Badge variant={user.role === 'Administrador' ? 'destructive' : 'default'} className="text-xs">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                          {user.colaboradorName ? (
                            <span className="text-xs sm:text-sm">{user.colaboradorName}</span>
                          ) : (
                            <span className="text-xs sm:text-sm text-muted-foreground">Sin asignar</span>
                          )}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                          {user.areaName ? (
                            <span className="text-xs sm:text-sm">{user.areaName}</span>
                          ) : (
                            <span className="text-xs sm:text-sm text-muted-foreground">Sin área</span>
                          )}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <Switch 
                            checked={user.active} 
                            onCheckedChange={() => toggleUserStatus(user)}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="text-right px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="hover:bg-muted-foreground/10 hover:text-muted-foreground transition-colors h-8 w-8 sm:h-10 sm:w-10"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
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

          {/* Diálogo solo para editar usuario */}
          <UserDialog
            open={isUserDialogOpen}
            onOpenChange={setIsUserDialogOpen}
            userData={selectedUser}
            roles={roles}
            areas={areas}
            onSubmit={handleSubmitUser}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default UsersTabContent;
