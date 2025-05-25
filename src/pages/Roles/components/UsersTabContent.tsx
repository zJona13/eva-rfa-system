
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
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
}

interface Role {
  id: number;
  name: string;
}

interface Colaborador {
  id: number;
  fullName: string;
}

interface UsersTabContentProps {
  users: User[];
  isLoading: boolean;
  searchQuery: string;
  roles: Role[];
}

// Servicios API
const fetchColaboradores = async (): Promise<Colaborador[]> => {
  const token = localStorage.getItem('iesrfa_token');
  const response = await fetch('http://localhost:3306/api/colaboradores', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Error al cargar colaboradores');
  }
  
  const data = await response.json();
  return data.colaboradores;
};

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
      colaboradorId: userData.colaboradorId ? parseInt(userData.colaboradorId) : null
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
      colaboradorId: userData.colaboradorId ? parseInt(userData.colaboradorId) : null
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

const UsersTabContent: React.FC<UsersTabContentProps> = ({ users, isLoading, searchQuery, roles }) => {
  // State
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query client
  const queryClient = useQueryClient();

  // Query para colaboradores
  const { 
    data: colaboradores = [], 
    isLoading: colaboradoresLoading 
  } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: fetchColaboradores
  });

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
    console.log('Enviando datos:', values);
    setIsSubmitting(true);
    
    // Preparar datos para envío
    const userData = {
      name: values.name,
      email: values.email,
      password: values.password || undefined, // No enviar cadena vacía
      active: values.active,
      roleId: parseInt(values.roleId),
      colaboradorId: values.colaboradorId && values.colaboradorId !== '' ? parseInt(values.colaboradorId) : undefined
    };
    
    console.log('Datos preparados:', userData);
    
    if (values.id) {
      updateUserMutation.mutate({ ...userData, id: values.id });
    } else {
      // Para usuarios nuevos, la contraseña es requerida
      if (!userData.password) {
        toast.error('La contraseña es requerida para usuarios nuevos');
        setIsSubmitting(false);
        return;
      }
      createUserMutation.mutate(userData);
    }
  };

  const toggleUserStatus = (user: User) => {
    const updatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      active: !user.active,
      roleId: user.roleId,
      colaboradorId: user.colaboradorId
    };
    
    updateUserMutation.mutate(updatedUser);
  };

  // Filtrado
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Función para obtener el nombre del colaborador
  const getColaboradorName = (colaboradorId?: number) => {
    if (!colaboradorId) return 'Sin asignar';
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    return colaborador ? colaborador.fullName : 'Sin asignar';
  };

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
                    <TableCell>{getColaboradorName(user.colaboradorId)}</TableCell>
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
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar usuario */}
      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        userData={selectedUser}
        roles={roles}
        colaboradores={colaboradores}
        onSubmit={handleSubmitUser}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default UsersTabContent;
