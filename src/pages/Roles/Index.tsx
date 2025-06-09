
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users, UserCog, UserSquare2, FileText, Building2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const response = await fetch('http://localhost:3309/api/roles');
  
  if (!response.ok) {
    throw new Error('Error al cargar roles');
  }
  
  const data = await response.json();
  return data.roles;
};

const fetchTiposColaborador = async (): Promise<TipoColaborador[]> => {
  const response = await fetch('http://localhost:3309/api/tiposcolaborador');
  
  if (!response.ok) {
    throw new Error('Error al cargar tipos de colaborador');
  }
  
  const data = await response.json();
  return data.tiposColaborador;
};

const fetchTiposContrato = async (): Promise<TipoContrato[]> => {
  const response = await fetch('http://localhost:3309/api/tiposcontrato');
  
  if (!response.ok) {
    throw new Error('Error al cargar tipos de contrato');
  }
  
  const data = await response.json();
  return data.tiposContrato;
};

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('http://localhost:3309/api/users');
  
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
  const response = await fetch('http://localhost:3309/api/colaboradores');
  
  if (!response.ok) {
    throw new Error('Error al cargar colaboradores');
  }
  
  const data = await response.json();
  return data.colaboradores;
};

const fetchAreas = async (): Promise<Area[]> => {
  const response = await fetch('http://localhost:3309/api/areas');
  if (!response.ok) {
    throw new Error('Error al cargar áreas');
  }
  const data = await response.json();
  return data.areas;
};

const fetchEstudiantes = async (): Promise<Estudiante[]> => {
  const response = await fetch('http://localhost:3309/api/estudiantes');
  if (!response.ok) {
    throw new Error('Error al cargar estudiantes');
  }
  const data = await response.json();
  return data.estudiantes;
};

const fetchUsuarios = async (): Promise<Usuario[]> => {
  const response = await fetch('http://localhost:3309/api/users');
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

  // Configuración de tabs con iconos y descripciones mejoradas
  const tabsConfig = [
    {
      value: 'roles',
      label: 'Roles Usuario',
      icon: Users,
      description: 'Gestión de roles del sistema'
    },
    {
      value: 'tiposColaborador',
      label: 'Roles Colaborador',
      icon: UserSquare2,
      description: 'Tipos de colaboradores'
    },
    {
      value: 'tiposContrato',
      label: 'Tipos Contrato',
      icon: FileText,
      description: 'Modalidades contractuales'
    },
    {
      value: 'areas',
      label: 'Áreas',
      icon: Building2,
      description: 'Departamentos y áreas'
    },
    {
      value: 'colaboradores',
      label: 'Colaboradores',
      icon: UserSquare2,
      description: 'Personal de la institución'
    },
    {
      value: 'estudiantes',
      label: 'Estudiantes',
      icon: GraduationCap,
      description: 'Alumnos registrados'
    },
    {
      value: 'users',
      label: 'Usuarios',
      icon: UserCog,
      description: 'Usuarios del sistema'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Header mejorado */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <UserCog className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sistema de Mantenimientos
            </h1>
            <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
              Administre de forma integral todos los elementos del sistema: roles, usuarios, colaboradores y configuraciones
            </p>
          </div>
        </div>

        {/* Card principal con diseño mejorado */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-2xl font-semibold">Panel de Administración</CardTitle>
                <CardDescription className="text-base mt-2">
                  Seleccione una categoría para gestionar la información correspondiente
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar en mantenimientos..." 
                    className="pl-10 pr-4 w-full lg:w-80 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Tabs mejoradas con diseño de grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {tabsConfig.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`relative p-4 rounded-xl border transition-all duration-200 text-left group hover:shadow-md ${
                      activeTab === tab.value
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                        : 'bg-background/50 hover:bg-muted/50 border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-2 rounded-lg transition-colors ${
                        activeTab === tab.value
                          ? 'bg-primary-foreground/20'
                          : 'bg-muted group-hover:bg-primary/10'
                      }`}>
                        <tab.icon className={`h-5 w-5 ${
                          activeTab === tab.value
                            ? 'text-primary-foreground'
                            : 'text-foreground group-hover:text-primary'
                        }`} />
                      </div>
                      <div>
                        <div className={`font-medium text-sm ${
                          activeTab === tab.value
                            ? 'text-primary-foreground'
                            : 'text-foreground'
                        }`}>
                          {tab.label}
                        </div>
                        <div className={`text-xs mt-1 ${
                          activeTab === tab.value
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Contenido de las tabs */}
              <div className="mt-8">
                <TabsContent value="roles" className="mt-0">
                  <RolesTabContent 
                    roles={roles} 
                    isLoading={rolesLoading} 
                    searchQuery={searchQuery}
                  />
                </TabsContent>

                <TabsContent value="tiposColaborador" className="mt-0">
                  <TipoColaboradorTabContent 
                    tiposColaborador={tiposColaborador}
                    isLoading={tiposColabLoading}
                    searchQuery={searchQuery}
                  />
                </TabsContent>

                <TabsContent value="tiposContrato" className="mt-0">
                  <TipoContratoTabContent 
                    tiposContrato={tiposContrato}
                    isLoading={tiposContratoLoading}
                    searchQuery={searchQuery}
                  />
                </TabsContent>

                <TabsContent value="areas" className="mt-0">
                  <AreaTabContent 
                    areas={areas}
                    isLoading={areasLoading}
                    searchQuery={searchQuery}
                  />
                </TabsContent>

                <TabsContent value="colaboradores" className="mt-0">
                  <ColaboradoresTabContent 
                    colaboradores={colaboradores}
                    isLoading={colaboradoresLoading}
                    searchQuery={searchQuery}
                    tiposColaborador={tiposColaborador}
                    tiposContrato={tiposContrato}
                    roles={roles}
                    areas={areas}
                  />
                </TabsContent>
                
                <TabsContent value="estudiantes" className="mt-0">
                  <EstudiantesTabContent
                    estudiantes={estudiantes}
                    isLoading={estudiantesLoading}
                    searchQuery={searchQuery}
                    areas={areas}
                    usuarios={usuarios}
                  />
                </TabsContent>
                
                <TabsContent value="users" className="mt-0">
                  <UsersTabContent 
                    users={users}
                    isLoading={usersLoading}
                    searchQuery={searchQuery}
                    roles={roles}
                    areas={areas}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Roles;
