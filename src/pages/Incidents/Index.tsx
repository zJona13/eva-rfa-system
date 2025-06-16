import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth, getToken, UserRole } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3309/api';

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
    return <div className="text-red-600 font-semibold">No tienes un área asignada. Contacta al administrador.</div>;
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
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Académica':
        return 'bg-blue-100 text-blue-800';
      case 'Administrativa':
        return 'bg-purple-100 text-purple-800';
      case 'Técnica':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    console.error('Error fetching incidents:', error);
  }

  if (isLoading) {
    return <div>Cargando incidencias...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Incidencias</h1>
      
      <div className="grid gap-4">
        {incidencias.map((incidencia: any) => (
          <Card key={incidencia.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Incidencia #{incidencia.id}
                  </CardTitle>
                  <CardDescription>
                    {new Date(incidencia.fecha).toLocaleDateString()} {incidencia.hora}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTipoColor(incidencia.tipo)}>
                    {incidencia.tipo}
                  </Badge>
                  <Badge className={getEstadoColor(incidencia.estado)}>
                    {incidencia.estado}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Descripción:</p>
                  <p className="text-gray-600">{incidencia.descripcion}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Reportado por:</p>
                    <p className="text-gray-600">{incidencia.reportadorNombre}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Afectado:</p>
                    <p className="text-gray-600">{incidencia.afectadoNombre}</p>
                  </div>
                </div>

                {incidencia.accionTomada && (
                  <div>
                    <p className="font-semibold">Acción tomada:</p>
                    <p className="text-gray-600">{incidencia.accionTomada}</p>
                  </div>
                )}

                {canModifyStatus() && incidencia.estado === 'Pendiente' && (
                  <div className="flex gap-2">
                    <Select
                      value={incidencia.estado}
                      onValueChange={(value) => handleEstadoChange(incidencia.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Cambiar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Completada">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Incidents;
