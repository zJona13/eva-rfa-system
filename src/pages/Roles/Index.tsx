import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users, UserCog, UserSquare2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '@/contexts/AuthContext';

// Import our separate tab content components
import RolesTabContent from './components/RolesTabContent';
import TipoColaboradorTabContent from './components/TipoColaboradorTabContent';
import TipoContratoTabContent from './components/TipoContratoTabContent';
import UsersTabContent from './components/UsersTabContent';
import ColaboradoresTabContent from './components/ColaboradoresTabContent';
import AreaTabContent from './components/AreaTabContent';
import EstudiantesTabContent from './components/EstudiantesTabContent';

// Tipos
interface Role {
  id: number;
  name: string;
}

interface TipoColaborador {
  id: number;
  name: string;
}

interface TipoContrato {
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
  colaboradorId?: number;
  colaboradorName?: string;
  areaId?: number;
  areaName?: string;
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
  contractActive: boolean;
  contractTypeId: number;
  contractType: string;
  areaName: string;
  areaId: number;
}

interface Area {
  id: number;
  name: string;
  descripcion: string;
}

interface Estudiante {
  id: number;
  codigo: string;
  sexo: string;
  semestre: string;
  areaId: number;
  areaName: string;
  usuarioId: number;
  usuarioCorreo: string;
  nombreEstudiante: string;
  apePaEstudiante: string;
  apeMaEstudiante: string;
}

interface Usuario {
  id: number;
  correo: string;
}

// Servicios API - Updated port from 5000 to 3309
const fetchRoles = async (): Promise<Role[]> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/roles', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  
  if (!response.ok) {
    throw new Error('Error al cargar roles');
  }
  
  const data = await response.json();
  return data.roles;
};

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

const fetchTiposColaborador = async (): Promise<TipoColaborador[]> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/tiposcolaborador', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  
  if (!response.ok) {
    throw new Error('Error al cargar tipos de colaborador');
  }
  
  const data = await response.json();
  return data.tiposColaborador;
};

const fetchTiposContrato = async (): Promise<TipoContrato[]> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/tiposcontrato', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  
  if (!response.ok) {
    throw new Error('Error al cargar tipos de contrato');
  }
  
  const data = await response.json();
  return data.tiposContrato;
};

const fetchUsers = async (): Promise<User[]> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/users', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  
  if (!response.ok) {
    throw new Error('Error al cargar usuarios');
  }
  
  const data = await response.json();
  return data.users.map((user: any) => ({
    ...user,
    areaId: user.areaId !== null && user.areaId !== undefined ? Number(user.areaId) : undefined,
    areaName: user.areaName || undefined
  }));
};

const fetchColaboradores = async (): Promise<Colaborador[]> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/colaboradores', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  
  if (!response.ok) {
    throw new Error('Error al cargar colaboradores');
  }
  
  const data = await response.json();
  return data.colaboradores;
};

const fetchAreas = async (): Promise<Area[]> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/areas', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) {
    throw new Error('Error al cargar áreas');
  }
  const data = await response.json();
  return data.areas;
};

const fetchEstudiantes = async (): Promise<Estudiante[]> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/estudiantes', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) {
    throw new Error('Error al cargar estudiantes');
  }
  const data = await response.json();
  return data.estudiantes;
};

const fetchUsuarios = async (): Promise<Usuario[]> => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/users', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) {
    throw new Error('Error al cargar usuarios');
  }
  const data = await response.json();
  return data.users.map((user: any) => ({ id: user.id, correo: user.email }));
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
    data: tiposContrato = [], 
    isLoading: tiposContratoLoading,
    error: tiposContratoError
  } = useQuery({
    queryKey: ['tiposContrato'],
    queryFn: fetchTiposContrato
  });
  
  const { 
    data: users = [], 
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
  
  const { 
    data: colaboradores = [], 
    isLoading: colaboradoresLoading,
    error: colaboradoresError
  } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: fetchColaboradores
  });
  
  const { 
    data: areas = [], 
    isLoading: areasLoading,
    error: areasError
  } = useQuery({
    queryKey: ['areas'],
    queryFn: fetchAreas
  });
  
  const { 
    data: estudiantes = [], 
    isLoading: estudiantesLoading,
    error: estudiantesError
  } = useQuery({
    queryKey: ['estudiantes'],
    queryFn: fetchEstudiantes
  });
  
  const { 
    data: usuarios = [], 
    isLoading: usuariosLoading,
    error: usuariosError
  } = useQuery({
    queryKey: ['usuarios'],
    queryFn: fetchUsuarios
  });
  
  // Manejo de errores
  if (rolesError && activeTab === 'roles') {
    toast.error('Error al cargar los roles');
  }
  
  if (tiposColabError && activeTab === 'tiposColaborador') {
    toast.error('Error al cargar los tipos de colaborador');
  }
  
  if (tiposContratoError && activeTab === 'tiposContrato') {
    toast.error('Error al cargar los tipos de contrato');
  }
  
  if (usersError && activeTab === 'users') {
    toast.error('Error al cargar los usuarios');
  }
  
  if (colaboradoresError && activeTab === 'colaboradores') {
    toast.error('Error al cargar los colaboradores');
  }
  
  if (areasError && activeTab === 'areas') {
    toast.error('Error al cargar las áreas');
  }
  
  if (estudiantesError && activeTab === 'estudiantes') {
    toast.error('Error al cargar los estudiantes');
  }
  
  if (usuariosError && activeTab === 'estudiantes') {
    toast.error('Error al cargar los usuarios');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950/20 dark:via-background dark:to-blue-950/20">
      {/* Header responsivo */}
      <div className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="p-2 md:p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg">
                  <Users className="h-5 w-5 md:h-7 md:w-7" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Mantenimientos del Sistema
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
                    Gestione los roles, tipos de colaborador, tipos de contrato, usuarios y colaboradores en el sistema
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navegación de tabs responsiva */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border p-4 space-y-4">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1 bg-background/50 p-1 h-auto w-full lg:w-auto">
                <TabsTrigger value="roles" className="flex flex-col items-center gap-1 px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs">Roles Usuario</span>
                </TabsTrigger>
                <TabsTrigger value="tiposColaborador" className="flex flex-col items-center gap-1 px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserSquare2 className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs">Roles Colaborador</span>
                </TabsTrigger>
                <TabsTrigger value="tiposContrato" className="flex flex-col items-center gap-1 px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs">Tipos Contrato</span>
                </TabsTrigger>
                <TabsTrigger value="colaboradores" className="flex flex-col items-center gap-1 px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserSquare2 className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs">Colaboradores</span>
                </TabsTrigger>
                <TabsTrigger value="estudiantes" className="flex flex-col items-center gap-1 px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserSquare2 className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs">Estudiantes</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex flex-col items-center gap-1 px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserCog className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs">Usuarios</span>
                </TabsTrigger>
                <TabsTrigger value="areas" className="flex flex-col items-center gap-1 px-2 md:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserSquare2 className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs">Áreas</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Buscador responsivo */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar en mantenimientos..." 
                    className="pl-10 pr-4 bg-background/80 backdrop-blur-sm border-2 focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tab de Roles de Usuario */}
          <TabsContent value="roles" className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <RolesTabContent 
                roles={roles} 
                isLoading={rolesLoading} 
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>

          {/* Tab de Tipos de Colaborador */}
          <TabsContent value="tiposColaborador" className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <TipoColaboradorTabContent 
                tiposColaborador={tiposColaborador}
                isLoading={tiposColabLoading}
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>

          {/* Tab de Tipos de Contrato */}
          <TabsContent value="tiposContrato" className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <TipoContratoTabContent 
                tiposContrato={tiposContrato}
                isLoading={tiposContratoLoading}
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>

          {/* Tab de Colaboradores */}
          <TabsContent value="colaboradores" className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <ColaboradoresTabContent 
                colaboradores={colaboradores}
                isLoading={colaboradoresLoading}
                searchQuery={searchQuery}
                tiposColaborador={tiposColaborador}
                tiposContrato={tiposContrato}
                roles={roles}
                areas={areas}
              />
            </div>
          </TabsContent>
          
          {/* Tab de Estudiantes */}
          <TabsContent value="estudiantes" className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <EstudiantesTabContent
                estudiantes={estudiantes}
                isLoading={estudiantesLoading}
                searchQuery={searchQuery}
                areas={areas}
                usuarios={usuarios}
              />
            </div>
          </TabsContent>
          
          {/* Tab de Usuarios */}
          <TabsContent value="users" className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <UsersTabContent 
                users={users}
                isLoading={usersLoading}
                searchQuery={searchQuery}
                roles={roles}
                areas={areas}
              />
            </div>
          </TabsContent>

          {/* Tab de Áreas */}
          <TabsContent value="areas" className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <AreaTabContent 
                areas={areas}
                isLoading={areasLoading}
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Roles;
