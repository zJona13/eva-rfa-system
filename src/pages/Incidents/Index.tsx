import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3306/api';

const fetchIncidencias = async (userId: number) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/incidencias/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const updateIncidenciaEstado = async ({ id, estado }: { id: number; estado: string }) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/incidencias/${id}/estado`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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

  const { data: incidenciasData, isLoading } = useQuery({
    queryKey: ['incidencias', userId],
    queryFn: () => fetchIncidencias(userId),
    enabled: !!userId,
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
    updateEstadoMutation.mutate({ id: incidenciaId, estado: nuevoEstado });
  };

  // Verificar si el usuario puede modificar el estado (solo evaluadores y administradores)
  const canModifyStatus = () => {
    const userRole = user?.role?.toLowerCase();
    return userRole === 'evaluador' || userRole === 'administrador';
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Resuelto':
        return 'bg-green-100 text-green-800';
      case 'En proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente':
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
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Incidencias</h1>
          <p className="text-muted-foreground mt-2">
            Registre y haga seguimiento a incidencias del sistema o proceso evaluativo.
          </p>
        </div>
      </div>

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
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">{incidencia.descripcion}</p>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Reportado por:</strong> {incidencia.reportadorNombre}</p>
                    <p><strong>Afectado:</strong> {incidencia.afectadoNombre}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {canModifyStatus() ? (
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
                            <SelectItem value="En proceso">En proceso</SelectItem>
                            <SelectItem value="Resuelto">Resuelto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Estado:</span>
                        <span className="text-sm text-muted-foreground">{incidencia.estado}</span>
                        <span className="text-xs text-muted-foreground">(Solo evaluadores y administradores pueden modificar)</span>
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
