
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
  ShieldCheck,
  CheckCircle2, 
  XCircle
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
import { Switch } from '@/components/ui/switch';

const Roles = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');

  // Sample data
  const roles = [
    { id: 1, name: 'Administrador', description: 'Control total del sistema', users: 2, color: 'destructive' },
    { id: 2, name: 'Evaluador', description: 'Puede evaluar mediante listas de cotejo', users: 8, color: 'default' },
    { id: 3, name: 'Evaluado', description: 'Personal que puede autoevaluarse', users: 45, color: 'default' },
    { id: 4, name: 'Estudiante', description: 'Puede evaluar a sus docentes', users: 120, color: 'default' },
    { id: 5, name: 'Validador', description: 'Valida las evaluaciones realizadas', users: 4, color: 'secondary' },
  ];

  const users = [
    { id: 1, name: 'María Rodríguez', email: 'maria.rodriguez@iesrfa.edu', role: 'Administrador', status: 'Activo' },
    { id: 2, name: 'Carlos Santos', email: 'carlos.santos@iesrfa.edu', role: 'Evaluador', status: 'Activo' },
    { id: 3, name: 'Ana Méndez', email: 'ana.mendez@iesrfa.edu', role: 'Evaluado', status: 'Activo' },
    { id: 4, name: 'José Torres', email: 'jose.torres@iesrfa.edu', role: 'Estudiante', status: 'Inactivo' },
    { id: 5, name: 'Laura Vega', email: 'laura.vega@iesrfa.edu', role: 'Validador', status: 'Activo' },
  ];

  const permissions = [
    { id: 1, module: 'Autoevaluación', actions: ['ver', 'crear', 'editar', 'validar'] },
    { id: 2, module: 'Evaluación Estudiante', actions: ['ver', 'crear'] },
    { id: 3, module: 'Incidencias', actions: ['ver', 'crear', 'resolver'] },
    { id: 4, module: 'Listas de Cotejo', actions: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 5, module: 'Roles y Permisos', actions: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 6, module: 'Validación', actions: ['ver', 'aprobar', 'rechazar'] },
    { id: 7, module: 'Resultados', actions: ['ver', 'publicar'] },
  ];

  // Event handlers
  const handleAddRole = () => {
    setShowAddRoleDialog(false);
    toast.success('Rol creado exitosamente');
  };

  const handleEditRole = (roleId: number) => {
    toast.info(`Editar rol ${roleId}`);
  };

  const handleDeleteRole = (roleId: number) => {
    toast.success(`Rol eliminado exitosamente`);
  };

  const handleAddUser = () => {
    toast.info('Agregar usuario');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filtered data
  const filteredRoles = roles.filter(
    (role) => role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administración de Roles y Permisos</h1>
        <p className="text-muted-foreground mt-2">
          Gestione los roles de usuario y sus permisos en el sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Roles</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <UserCog className="h-4 w-4" />
              <span>Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Permisos</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="pl-8 pr-4"
                value={searchQuery}
                onChange={handleFilterChange}
              />
            </div>
            {activeTab === 'roles' ? (
              <Button onClick={() => setShowAddRoleDialog(true)} className="whitespace-nowrap">
                <PlusCircle className="h-4 w-4 mr-1" /> Nuevo Rol
              </Button>
            ) : activeTab === 'users' ? (
              <Button onClick={handleAddUser} className="whitespace-nowrap">
                <PlusCircle className="h-4 w-4 mr-1" /> Nuevo Usuario
              </Button>
            ) : null}
          </div>
        </div>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Lista de Roles</CardTitle>
              <CardDescription>
                Gestione los roles existentes en el sistema y sus descripciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-center">Usuarios</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Badge variant={role.color as any}>{role.name}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell className="text-center">{role.users}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditRole(role.id)}
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
                  ))}
                  {filteredRoles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No se encontraron resultados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
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
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Administrador' ? 'destructive' : user.role === 'Validador' ? 'secondary' : 'default'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {user.status === 'Activo' ? (
                            <Badge variant="outline" className="bg-ies-success-50 text-ies-success-500 border-ies-success-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              <XCircle className="h-3 w-3 mr-1" /> Inactivo
                            </Badge>
                          )}
                        </div>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron resultados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Matriz de Permisos</CardTitle>
              <CardDescription>
                Configure los permisos para cada rol en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Módulo / Acción</TableHead>
                      {roles.map(role => (
                        <TableHead key={role.id} className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge variant={role.color as any}>{role.name}</Badge>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <React.Fragment key={permission.id}>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium" colSpan={roles.length + 1}>
                            {permission.module}
                          </TableCell>
                        </TableRow>
                        {permission.actions.map((action, idx) => (
                          <TableRow key={`${permission.id}-${idx}`}>
                            <TableCell className="pl-6">
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </TableCell>
                            {roles.map(role => (
                              <TableCell key={`${permission.id}-${role.id}-${idx}`} className="text-center">
                                <Switch 
                                  checked={
                                    // Example logic for predefined permissions
                                    (role.name === 'Administrador') || 
                                    (role.name === 'Evaluador' && permission.module === 'Listas de Cotejo') ||
                                    (role.name === 'Validador' && permission.module === 'Validación') ||
                                    (role.name === 'Evaluado' && permission.module === 'Autoevaluación' && (action === 'ver' || action === 'crear')) ||
                                    (role.name === 'Estudiante' && permission.module === 'Evaluación Estudiante' && (action === 'ver' || action === 'crear'))
                                  } 
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Role Dialog */}
      <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Rol</DialogTitle>
            <DialogDescription>
              Complete la información para crear un nuevo rol en el sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Nombre del Rol</Label>
              <Input id="roleName" placeholder="Ej: Coordinador" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDescription">Descripción</Label>
              <Input id="roleDescription" placeholder="Descripción de las funciones del rol" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRoleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRole}>
              Crear Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roles;
