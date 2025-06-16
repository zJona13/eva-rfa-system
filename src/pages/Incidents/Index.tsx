import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth, getToken, UserRole } from '@/contexts/AuthContext';
import { AlertTriangle, Calendar, Clock, Filter, Search, User, FileText, CheckCircle, AlertCircle, Users } from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const fetchIncidencias = async (userId: string, userRole: UserRole, userArea?: string) => {
  const token = getToken();
  console.log('Fetching incidents with:', { userId, userRole, userArea });
  
  const response = await fetch(`${API_BASE_URL}/incidencias/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const updateIncidenciaEstado = async ({ id, estado }: { id: number; estado: string }) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/incidencias/${id}/estado`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ estado })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const Incidents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  console.log('Usuario actual desde contexto:', user);
  if (user) {
    console.log('user.idArea:', user.idArea, 'typeof:', typeof user.idArea);
  }

  const userId = user?.id || '';
  const userRole = (user?.role || '') as UserRole;
  const userArea = user?.idArea !== undefined && user?.idArea !== null ? String(user.idArea) : undefined;

  // Validación antes de hacer la petición
  const needsArea = userRole === 'evaluator' || userRole === 'student';
  console.log('needsArea:', needsArea, 'userArea:', userArea);
  if (needsArea && !userArea) {
    console.warn('No tienes un área asignada. Contacta al administrador. user:', user);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-lg border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <p className="font-semibold">No tienes un área asignada. Contacta al administrador.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Parámetros para fetchIncidencias:', { userId, userRole, userArea });

  const { data: incidenciasData, isLoading, error } = useQuery({
    queryKey: ['incidencias', userId, userRole, userArea],
    queryFn: () => fetchIncidencias(userId, userRole, userArea),
    enabled: !!userId && !!userRole && (!needsArea || !!userArea),
  });

  const updateEstadoMutation = useMutation({
    mutationFn: updateIncidenciaEstado,
    onSuccess: () => {
      toast.success('Estado de incidencia actualizado');
      queryClient.invalidateQueries({ queryKey: ['incidencias'] });
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  const incidencias = incidenciasData?.incidencias || [];

  const handleEstadoChange = (incidenciaId: number, nuevoEstado: string) => {
    if (!['Pendiente', 'Completada'].includes(nuevoEstado)) {
      toast.error('Estado no válido');
      return;
    }
    updateEstadoMutation.mutate({ id: incidenciaId, estado: nuevoEstado });
  };

  // Verificar si el usuario puede modificar el estado
  const canModifyStatus = () => {
    if (!user?.role) {
      console.log('No hay rol de usuario'); // Debug log
      return false;
    }
    
    const userRole = user.role.toLowerCase();
    console.log('Rol del usuario (normalizado):', userRole); // Debug log
    
    // Solo evaluadores y administradores pueden modificar estados
    const allowedRoles = ['evaluador', 'administrador', 'admin', 'evaluator'];
    const canModify = allowedRoles.includes(userRole);
    
    console.log('¿Puede modificar estado?:', canModify); // Debug log
    
    return canModify;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'Pendiente':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Académica':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'Administrativa':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      case 'Técnica':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return <CheckCircle className="h-4 w-4" />;
      case 'Pendiente':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredIncidencias = incidencias.filter((incidencia: any) => {
    const matchesEstado = filterEstado === 'todos' || incidencia.estado === filterEstado;
    const matchesTipo = filterTipo === 'todos' || incidencia.tipo === filterTipo;
    const matchesSearch = searchTerm === '' || 
      incidencia.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incidencia.reportadorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incidencia.afectadoNombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesEstado && matchesTipo && matchesSearch;
  });

  if (error) {
    console.error('Error fetching incidents:', error);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20 flex items-center justify-center">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-lg font-medium">Cargando incidencias...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    total: incidencias.length,
    pendientes: incidencias.filter((i: any) => i.estado === 'Pendiente').length,
    completadas: incidencias.filter((i: any) => i.estado === 'Completada').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
      {/* Header Section Responsivo */}
      <div className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Gestión de Incidencias
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base">Administra y supervisa las incidencias del sistema</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Responsivas */}
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center lg:justify-end">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-center shadow-lg">
                <div className="text-lg md:text-2xl font-bold">{stats.completadas}</div>
                <div className="text-xs opacity-90">Completadas</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-center shadow-lg">
                <div className="text-lg md:text-2xl font-bold">{stats.pendientes}</div>
                <div className="text-xs opacity-90">Pendientes</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-center shadow-lg">
                <div className="text-lg md:text-2xl font-bold">{stats.total}</div>
                <div className="text-xs opacity-90">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6">
        {/* Filters Section Responsiva */}
        <Card className="mb-6 shadow-lg border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por descripción, reportador o afectado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Select value={filterEstado} onValueChange={setFilterEstado}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Completada">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger className="bg-background/50 border-border/50 flex-1">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    <SelectItem value="Académica">Académica</SelectItem>
                    <SelectItem value="Administrativa">Administrativa</SelectItem>
                    <SelectItem value="Técnica">Técnica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Incidents Grid Responsiva */}
        <div className="space-y-4">
          {filteredIncidencias.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
              <CardContent className="py-8 md:py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold">No se encontraron incidencias</h3>
                    <p className="text-muted-foreground text-sm">No hay incidencias que coincidan con los filtros seleccionados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredIncidencias.map((incidencia: any) => (
              <Card key={incidencia.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-card/90">
                <CardHeader className="pb-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg md:text-xl font-bold text-foreground truncate">
                              Incidencia #{incidencia.id}
                            </CardTitle>
                            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-muted-foreground text-xs md:text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                {new Date(incidencia.fecha).toLocaleDateString('es-ES', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                {incidencia.hora}
                              </div>
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end lg:justify-start">
                      <Badge className={`${getTipoColor(incidencia.tipo)} border font-medium text-xs`}>
                        {incidencia.tipo}
                      </Badge>
                      <Badge className={`${getEstadoColor(incidencia.estado)} border font-medium flex items-center gap-1 text-xs`}>
                        {getEstadoIcon(incidencia.estado)}
                        {incidencia.estado}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <div className="bg-muted/50 p-3 md:p-4 rounded-lg border border-border/50">
                    <p className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm md:text-base">
                      <FileText className="h-4 w-4" />
                      Descripción:
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{incidencia.descripcion}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 md:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm md:text-base">
                        <User className="h-4 w-4" />
                        Reportado por:
                      </p>
                      <p className="text-blue-600 dark:text-blue-300 font-medium text-sm md:text-base truncate">{incidencia.reportadorNombre}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-3 md:p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-2 text-sm md:text-base">
                        <Users className="h-4 w-4" />
                        Afectado:
                      </p>
                      <p className="text-purple-600 dark:text-purple-300 font-medium text-sm md:text-base truncate">{incidencia.afectadoNombre}</p>
                    </div>
                  </div>

                  {incidencia.accionTomada && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 md:p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2 text-sm md:text-base">
                        <CheckCircle className="h-4 w-4" />
                        Acción tomada:
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-300 text-sm md:text-base">{incidencia.accionTomada}</p>
                    </div>
                  )}

                  {canModifyStatus() && incidencia.estado === 'Pendiente' && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">Cambiar estado:</span>
                        <Select
                          value={incidencia.estado}
                          onValueChange={(value) => handleEstadoChange(incidencia.id, value)}
                        >
                          <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
                            <SelectValue placeholder="Cambiar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Completada" className="text-emerald-600 dark:text-emerald-400">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Completada
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Incidents;
