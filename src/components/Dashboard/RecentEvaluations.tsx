import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth, getToken } from '@/contexts/AuthContext';
import { ClipboardList, TrendingUp, TrendingDown } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3309';

const fetchRecentEvaluations = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/dashboard/recent-evaluations`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const RecentEvaluations = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-recent-evaluations'],
    queryFn: fetchRecentEvaluations,
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
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-3 pr-4">
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
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentEvaluations;
