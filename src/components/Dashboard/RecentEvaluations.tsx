
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, TrendingUp, TrendingDown } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3306/api';

// Función para obtener el token OAuth
const getOAuthToken = () => {
  return localStorage.getItem('oauth_access_token');
};

// Función para verificar si el token ha expirado
const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('oauth_expires_at');
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt);
};

// Función para refrescar el token
const refreshToken = async () => {
  const refresh_token = localStorage.getItem('oauth_refresh_token');
  if (!refresh_token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      localStorage.setItem('oauth_access_token', data.access_token);
      localStorage.setItem('oauth_refresh_token', data.refresh_token);
      localStorage.setItem('oauth_expires_at', (Date.now() + (data.expires_in * 1000)).toString());
      return true;
    } else {
      console.error('Error refreshing token:', data);
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Función para hacer requests autenticados
const authenticatedFetch = async (url: string) => {
  let token = getOAuthToken();
  
  if (!token) {
    throw new Error('No OAuth token available');
  }

  if (isTokenExpired()) {
    console.log('Token expired, attempting to refresh...');
    const refreshed = await refreshToken();
    if (!refreshed) {
      throw new Error('OAuth token expired and refresh failed');
    }
    token = getOAuthToken();
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error:', errorData);
    throw new Error(`Error ${response.status}: ${errorData.error_description || response.statusText}`);
  }

  return response.json();
};

const fetchRecentEvaluations = async () => {
  return authenticatedFetch(`${API_BASE_URL}/dashboard/recent-evaluations`);
};

const RecentEvaluations = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-recent-evaluations'],
    queryFn: fetchRecentEvaluations,
    retry: (failureCount, error: any) => {
      // No reintentar si es un error de autenticación
      if (error?.message?.includes('invalid_token') || error?.message?.includes('token_expired')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Evaluaciones Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading recent evaluations:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Evaluaciones Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error al cargar las evaluaciones</p>
        </CardContent>
      </Card>
    );
  }

  const evaluaciones = data?.evaluaciones || [];
  const isEvaluated = user?.role === 'evaluated';

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>;
      case 'Pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'En Revisión':
        return <Badge className="bg-blue-100 text-blue-800">En Revisión</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const getScoreIcon = (puntaje: number) => {
    if (puntaje >= 15) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (puntaje >= 11) return <TrendingUp className="h-4 w-4 text-blue-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {isEvaluated ? 'Mis Evaluaciones Recientes' : 'Evaluaciones Recientes del Sistema'}
        </CardTitle>
        <CardDescription>
          {isEvaluated 
            ? 'Últimas evaluaciones recibidas' 
            : 'Actividad reciente de evaluaciones'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {evaluaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay evaluaciones recientes</p>
        ) : (
          <div className="space-y-3">
            {evaluaciones.map((evaluacion: any) => (
              <div key={evaluacion.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getScoreIcon(evaluacion.puntaje)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{evaluacion.tipo}</span>
                      <span className="text-sm text-muted-foreground">
                        {evaluacion.puntaje}/20
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isEvaluated ? (
                        `Evaluado por: ${evaluacion.evaluadorNombre}`
                      ) : (
                        `${evaluacion.evaluadoNombre} - Evaluado por: ${evaluacion.evaluadorNombre}`
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(evaluacion.fecha).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(evaluacion.estado)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentEvaluations;
