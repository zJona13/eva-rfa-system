
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users, UserCog, UserSquare2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';

// Import our separate tab content components
import RolesTabContent from './components/RolesTabContent';
import TipoColaboradorTabContent from './components/TipoColaboradorTabContent';
import UsersTabContent from './components/UsersTabContent';

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

// Servicios API - Updated port from 5000 to 3306
const fetchRoles = async (): Promise<Role[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3306/api/roles', {
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

const fetchTiposColaborador = async (): Promise<TipoColaborador[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3306/api/tiposcolaborador', {
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

const fetchUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3306/api/users', {
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
          </div>
        </div>

        {/* Tab de Roles de Usuario */}
        <TabsContent value="roles" className="space-y-4">
          <RolesTabContent 
            roles={roles} 
            isLoading={rolesLoading} 
            searchQuery={searchQuery}
          />
        </TabsContent>

        {/* Tab de Tipos de Colaborador */}
        <TabsContent value="tiposColaborador" className="space-y-4">
          <TipoColaboradorTabContent 
            tiposColaborador={tiposColaborador}
            isLoading={tiposColabLoading}
            searchQuery={searchQuery}
          />
        </TabsContent>

        {/* Tab de Usuarios */}
        <TabsContent value="users" className="space-y-4">
          <UsersTabContent 
            users={users}
            isLoading={usersLoading}
            searchQuery={searchQuery}
            roles={roles}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Roles;
