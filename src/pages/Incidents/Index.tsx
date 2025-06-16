import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth, getToken } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3309/api';

const fetchIncidencias = async (userId: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/incidencias/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const updateIncidenciaEstado = async ({ id, estado }: { id: number; estado: string }) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/incidencias/${id}/estado`, {
    method: 'PUT',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: JSON.stringify({ estado }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const Incidents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userId = user?.id ? parseInt(user.id) : 0;
  const userRole = user?.role?.toLowerCase() || '';

  console.log('Datos del usuario:', { userId, userRole }); // Debug log

  const { data: incidenciasData, isLoading, error } = useQuery({
    queryKey: ['incidencias', userId, userRole],
    queryFn: () => fetchIncidencias(userId),
    enabled: !!userId,
  });

  if (error) {
    console.error('Error al cargar incidencias:', error);
    return <div className="text-red-500">Error al cargar las incidencias</div>;
  }

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
    updateEstadoMutation.mutate({ id: incidenciaId, estado: nuevoEstado });
  };

  // Verificar si el usuario puede modificar el estado
  const canModifyStatus = () => {
    return ['administrador', 'evaluador'].includes(userRole);
  };

  // Verificar si el usuario puede modificar esta incidencia específica
  const canModifyThisIncidencia = (incidencia: any) => {
    if (userRole === 'administrador') return true;
    if (userRole === 'evaluador') return true;
    return false;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
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

  if (isLoading) {
    return <div>Cargando incidencias...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Incidencias</h1>

      {incidencias.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No hay incidencias registradas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidencias.map((incidencia: any) => (
            <Card key={incidencia.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Incidencia #{incidencia.id}</CardTitle>
                    <CardDescription>
                      Reportado: {new Date(incidencia.fecha).toLocaleDateString()} - {incidencia.hora}
                    </CardDescription>
                    <div className="flex gap-2">
                      <Badge className={getTipoColor(incidencia.tipo)}>
                        {incidencia.tipo}
                      </Badge>
                      <Badge className={getEstadoColor(incidencia.estado)}>
                        {incidencia.estado}
                      </Badge>
                      <Badge variant="outline">
                        Área: {incidencia.areaNombre}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm whitespace-pre-line">{incidencia.descripcion}</p>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Reportado por:</strong> {incidencia.reportadorNombre}</p>
                    <p><strong>Afectado:</strong> {incidencia.afectadoNombre}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {canModifyStatus() && canModifyThisIncidencia(incidencia) ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Estado:</span>
                        <Select
                          value={incidencia.estado}
                          onValueChange={(nuevoEstado) => handleEstadoChange(incidencia.id, nuevoEstado)}
                          disabled={updateEstadoMutation.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendiente">Pendiente</SelectItem>
                            <SelectItem value="Completada">Completada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Estado:</span>
                        <span className="text-sm text-muted-foreground">{incidencia.estado}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Incidents;
