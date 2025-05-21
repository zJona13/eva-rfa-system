
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Search, 
  Users, 
  UserCog,
  UserSquare2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';

// Tipos
interface Role {
  id: number;
  name: string;
}

interface TipoColaborador {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  role: string;
  roleId: number;
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
  modality: string;
  contractActive: boolean;
  contractTypeId: number;
  contractType: string;
}

interface TipoContrato {
  id: number;
  name: string;
}

// Servicios API
const fetchRoles = async (): Promise<Role[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/roles', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Error al cargar roles');
  }
  
  const data = await response.json();
  return data.roles;
};

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

const fetchTiposColaborador = async (): Promise<TipoColaborador[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/tiposcolaborador', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Error al cargar tipos de colaborador');
  }
  
  const data = await response.json();
  return data.tiposColaborador;
};

const createTipoColaborador = async (name: string): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/tiposcolaborador', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear tipo de colaborador');
  }
  
  return data;
};

const updateTipoColaborador = async ({ id, name }: { id: number, name: string }): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/tiposcolaborador/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar tipo de colaborador');
  }
  
  return data;
};

const deleteTipoColaborador = async (id: number): Promise<{ success: boolean, message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/tiposcolaborador/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar tipo de colaborador');
  }
  
  return data;
};

const fetchUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Error al cargar usuarios');
  }
  
  const data = await response.json();
  return data.users;
};

// Componente principal
const Roles = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('roles');
  
  // Dialog state para roles
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState('');
  
  // Dialog state para tipos de colaborador
  const [showAddTipoColabDialog, setShowAddTipoColabDialog] = useState(false);
  const [editTipoColabId, setEditTipoColabId] = useState<number | null>(null);
  const [tipoColabName, setTipoColabName] = useState('');
  
  // Query client
  const queryClient = useQueryClient();
  
  // Queries
  const { 
    data: roles = [], 
    isLoading: rolesLoading,
    error: rolesError
  } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  });
  
  const { 
    data: tiposColaborador = [], 
    isLoading: tiposColabLoading,
    error: tiposColabError
  } = useQuery({
    queryKey: ['tiposColaborador'],
    queryFn: fetchTiposColaborador
  });
  
  const { 
    data: users = [], 
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
  
  // Mutations para roles
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
  
  // Mutations para tipos de colaborador
  const createTipoColabMutation = useMutation({
    mutationFn: createTipoColaborador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposColaborador'] });
      toast.success('Tipo de colaborador creado exitosamente');
      setShowAddTipoColabDialog(false);
      setTipoColabName('');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const updateTipoColabMutation = useMutation({
    mutationFn: updateTipoColaborador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposColaborador'] });
      toast.success('Tipo de colaborador actualizado exitosamente');
      setShowAddTipoColabDialog(false);
      setEditTipoColabId(null);
      setTipoColabName('');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const deleteTipoColabMutation = useMutation({
    mutationFn: deleteTipoColaborador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiposColaborador'] });
      toast.success('Tipo de colaborador eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  // Event handlers para roles
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
  
  // Event handlers para tipos de colaborador
  const handleAddTipoColab = () => {
    if (!tipoColabName.trim()) {
      toast.error('El nombre del tipo de colaborador no puede estar vacío');
      return;
    }
    
    if (editTipoColabId) {
      updateTipoColabMutation.mutate({ id: editTipoColabId, name: tipoColabName });
    } else {
      createTipoColabMutation.mutate(tipoColabName);
    }
  };
  
  const handleEditTipoColab = (id: number, currentName: string) => {
    setEditTipoColabId(id);
    setTipoColabName(currentName);
    setShowAddTipoColabDialog(true);
  };
  
  const handleDeleteTipoColab = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este tipo de colaborador?')) {
      deleteTipoColabMutation.mutate(id);
    }
  };
  
  // Filtrado
  const filteredRoles = roles.filter(
    (role) => role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTiposColaborador = tiposColaborador.filter(
    (tipo) => tipo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Manejo de errores
  if (rolesError && activeTab === 'roles') {
    toast.error('Error al cargar los roles');
  }
  
  if (tiposColabError && activeTab === 'tiposColaborador') {
    toast.error('Error al cargar los tipos de colaborador');
  }
  
  if (usersError && activeTab === 'users') {
    toast.error('Error al cargar los usuarios');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administración de Roles y Usuarios</h1>
        <p className="text-muted-foreground mt-2">
          Gestione los roles de usuario, tipos de colaborador, usuarios y colaboradores en el sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Roles Usuario</span>
            </TabsTrigger>
            <TabsTrigger value="tiposColaborador" className="flex items-center gap-1">
              <UserSquare2 className="h-4 w-4" />
              <span>Roles Colaborador</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <UserCog className="h-4 w-4" />
              <span>Usuarios</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="pl-8 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === 'roles' ? (
              <Button 
                onClick={() => {
                  setEditRoleId(null);
                  setRoleName('');
                  setShowAddRoleDialog(true);
                }} 
                className="whitespace-nowrap"
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Nuevo Rol
              </Button>
            ) : activeTab === 'tiposColaborador' ? (
              <Button 
                onClick={() => {
                  setEditTipoColabId(null);
                  setTipoColabName('');
                  setShowAddTipoColabDialog(true);
                }} 
                className="whitespace-nowrap"
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Nuevo Tipo
              </Button>
            ) : null}
          </div>
        </div>

        {/* Tab de Roles de Usuario */}
        <TabsContent value="roles" className="space-y-4">
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
                  {rolesLoading ? (
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
                          <div className="flex items-center gap-2">
                            <Badge variant={role.name === "Administrador" ? "destructive" : "default"}>
                              {role.name}
                            </Badge>
                          </div>
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
        </TabsContent>

        {/* Tab de Tipos de Colaborador */}
        <TabsContent value="tiposColaborador" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Lista de Roles de Colaborador</CardTitle>
              <CardDescription>
                Gestione los tipos de colaborador existentes en el sistema
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
                  {tiposColabLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Cargando tipos de colaborador...
                      </TableCell>
                    </TableRow>
                  ) : filteredTiposColaborador.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No se encontraron resultados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTiposColaborador.map((tipo) => (
                      <TableRow key={tipo.id}>
                        <TableCell>{tipo.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {tipo.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditTipoColab(tipo.id, tipo.name)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteTipoColab(tipo.id)}
                              className="text-muted-foreground hover:text-destructive"
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
        </TabsContent>

        {/* Tab de Usuarios */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                Gestione los usuarios del sistema y sus roles asignados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-1" /> Nuevo Usuario
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo electrónico</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Cargando usuarios...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
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
                          <Switch checked={user.active} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-destructive"
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
        </TabsContent>
      </Tabs>

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

      {/* Dialog para agregar/editar Tipo de Colaborador */}
      <Dialog open={showAddTipoColabDialog} onOpenChange={setShowAddTipoColabDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTipoColabId ? 'Editar Tipo de Colaborador' : 'Crear Nuevo Tipo de Colaborador'}</DialogTitle>
            <DialogDescription>
              {editTipoColabId 
                ? 'Modifique la información del tipo de colaborador seleccionado.' 
                : 'Complete la información para crear un nuevo tipo de colaborador en el sistema.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipoColabName">Nombre del Tipo de Colaborador</Label>
              <Input 
                id="tipoColabName" 
                placeholder="Ej: Coordinador Académico" 
                value={tipoColabName}
                onChange={(e) => setTipoColabName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTipoColabDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTipoColab}>
              {editTipoColabId ? 'Actualizar' : 'Crear Tipo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roles;
