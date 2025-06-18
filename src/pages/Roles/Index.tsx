import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users, UserCog, UserSquare2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '@/contexts/AuthContext';
import { API_URL } from '@/config/api';

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
  const res = await fetch(`${API_URL}/roles`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Error al obtener roles:', res.status, errText);
    throw new Error('Error al obtener roles');
  }
  return res.json();
};

const createRole = async (name: string): Promise<{ success: boolean, message: string }> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/roles`, {
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
  const res = await fetch(`${API_URL}/tiposcolaborador`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Error al obtener tipos de colaborador:', res.status, errText);
    throw new Error('Error al obtener tipos de colaborador');
  }
  return res.json();
};

const fetchTiposContrato = async (): Promise<TipoContrato[]> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/tiposcontrato`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Error al obtener tipos de contrato:', res.status, errText);
    throw new Error('Error al obtener tipos de contrato');
  }
  return res.json();
};

const fetchUsers = async (): Promise<User[]> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/users`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Error al obtener usuarios:', res.status, errText);
    throw new Error('Error al obtener usuarios');
  }
  return res.json();
};

const fetchColaboradores = async (): Promise<Colaborador[]> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/colaboradores`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Error al obtener colaboradores:', res.status, errText);
    throw new Error('Error al obtener colaboradores');
  }
  return res.json();
};

const fetchAreas = async (): Promise<Area[]> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/areas`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Error al obtener áreas:', res.status, errText);
    throw new Error('Error al obtener áreas');
  }
  return res.json();
};

const fetchEstudiantes = async (): Promise<Estudiante[]> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/estudiantes`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Error al obtener estudiantes:', res.status, errText);
    throw new Error('Error al obtener estudiantes');
  }
  return res.json();
};

const fetchUsuarios = async (): Promise<Usuario[]> => {
  const token = getToken();
  const res = await fetch(`${API_URL}/usuarios`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Error al obtener usuarios:', res.status, errText);
    throw new Error('Error al obtener usuarios');
  }
  return res.json();
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
    <div className="container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col space-y-2 sm:space-y-3 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Mantenimientos del Sistema
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gestione los roles, tipos de colaborador, tipos de contrato, usuarios y colaboradores en el sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
          {/* Tabs list - responsive grid */}
          <div className="w-full overflow-x-auto">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1 bg-background/50 p-1 h-auto min-w-fit">
              <TabsTrigger value="roles" className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Roles Usuario</span>
                <span className="sm:hidden">Roles</span>
              </TabsTrigger>
              <TabsTrigger value="tiposColaborador" className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <UserSquare2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Roles Colaborador</span>
                <span className="sm:hidden">R. Colab</span>
              </TabsTrigger>
              <TabsTrigger value="tiposContrato" className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Tipos Contrato</span>
                <span className="sm:hidden">Contrato</span>
              </TabsTrigger>
              <TabsTrigger value="colaboradores" className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <UserSquare2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Colaboradores</span>
                <span className="sm:hidden">Colab</span>
              </TabsTrigger>
              <TabsTrigger value="estudiantes" className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <UserSquare2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Estudiantes</span>
                <span className="sm:hidden">Estud</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <UserCog className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Usuarios</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="areas" className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <UserSquare2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Áreas</span>
                <span className="sm:hidden">Áreas</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Search input */}
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar en mantenimientos..." 
                className="pl-10 pr-4 bg-background/80 backdrop-blur-sm border-2 focus:border-primary text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tab content with responsive padding */}
        <div className="px-1 sm:px-0">
          {/* Tab de Roles de Usuario */}
          <TabsContent value="roles" className="space-y-4 mt-4 sm:mt-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <RolesTabContent 
                roles={roles} 
                isLoading={rolesLoading} 
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>

          {/* Tab de Tipos de Colaborador */}
          <TabsContent value="tiposColaborador" className="space-y-4 mt-4 sm:mt-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <TipoColaboradorTabContent 
                tiposColaborador={tiposColaborador}
                isLoading={tiposColabLoading}
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>

          {/* Tab de Tipos de Contrato */}
          <TabsContent value="tiposContrato" className="space-y-4 mt-4 sm:mt-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <TipoContratoTabContent 
                tiposContrato={tiposContrato}
                isLoading={tiposContratoLoading}
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>

          {/* Tab de Colaboradores */}
          <TabsContent value="colaboradores" className="space-y-4 mt-4 sm:mt-6">
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
          <TabsContent value="estudiantes" className="space-y-4 mt-4 sm:mt-6">
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
          <TabsContent value="users" className="space-y-4 mt-4 sm:mt-6">
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
          <TabsContent value="areas" className="space-y-4 mt-4 sm:mt-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-1">
              <AreaTabContent 
                areas={areas}
                isLoading={areasLoading}
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Roles;
