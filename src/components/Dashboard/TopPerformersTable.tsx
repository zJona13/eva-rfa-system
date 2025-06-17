
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, AlertTriangle, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const TopPerformersTable = () => {
  const isMobile = useIsMobile();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-performers'],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch('/api/reportes/personal-alta-calificacion', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Error al obtener mejores promedios');
      return res.json();
    }
  });

  if (isLoading) return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
      <Card className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Cargando tabla...</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Cargando tabla...</div>
        </CardContent>
      </Card>
    </div>
  );
  
  if (error) return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
      <Card className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex items-center justify-center h-32">
          <div className="text-sm text-red-500">Error al cargar tabla</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex items-center justify-center h-32">
          <div className="text-sm text-red-500">Error al cargar tabla</div>
        </CardContent>
      </Card>
    </div>
  );

  const topPerformers = data?.personal || [];

  const topIncidents = [
    { id: 1, nombre: 'Pedro Sánchez Díaz', area: 'Ed. Física', incidencias: 5, tipo: 'Tardanzas' },
    { id: 2, nombre: 'Laura Vásquez Cano', area: 'Arte', incidencias: 4, tipo: 'Ausencias' },
    { id: 3, nombre: 'Miguel Torres Vega', area: 'Música', incidencias: 3, tipo: 'Quejas' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />;
      default:
        return <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gray-400"></div>;
    }
  };

  const getPerformanceBadge = (promedio: number) => {
    const badgeClass = "text-xs px-1.5 py-0.5";
    if (promedio >= 18) return <Badge className={`${badgeClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Excelente</Badge>;
    if (promedio >= 16) return <Badge className={`${badgeClass} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>Muy Bueno</Badge>;
    if (promedio >= 14) return <Badge className={`${badgeClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>Bueno</Badge>;
    return <Badge className={`${badgeClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>Regular</Badge>;
  };

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Top Performers */}
      <Card className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-600 flex-shrink-0" />
            <span className="line-clamp-1">Top 5 Mejores Promedios</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            Colaboradores con los mejores promedios de evaluación
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 text-center text-xs">#</TableHead>
                  <TableHead className="min-w-[120px] text-xs">Colaborador</TableHead>
                  {!isMobile && <TableHead className="hidden sm:table-cell text-xs">Área</TableHead>}
                  <TableHead className="text-center text-xs">Promedio</TableHead>
                  {!isMobile && <TableHead className="hidden md:table-cell text-center text-xs">Eval.</TableHead>}
                  <TableHead className="w-8 text-center text-xs">Tend.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.slice(0, 5).map((performer, index) => (
                  <TableRow key={performer.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <TableCell className="text-center font-medium">
                      {index === 0 && <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mx-auto" />}
                      {index !== 0 && <span className="text-gray-500 text-sm">{index + 1}</span>}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {performer.nombre}
                        </p>
                        {isMobile && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {performer.area}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {performer.area}
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm sm:text-lg font-bold text-emerald-600">
                          {performer.promedio}
                        </span>
                        {getPerformanceBadge(performer.promedio)}
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell className="hidden md:table-cell text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {performer.evaluaciones}
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      {getTrendIcon(performer.trend)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Incidents */}
      <Card className="bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-600 flex-shrink-0" />
            <span className="line-clamp-1">Más Incidencias</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            Colaboradores que requieren mayor atención
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 text-center text-xs">#</TableHead>
                  <TableHead className="min-w-[120px] text-xs">Colaborador</TableHead>
                  {!isMobile && <TableHead className="hidden sm:table-cell text-xs">Área</TableHead>}
                  <TableHead className="text-center text-xs">Incidencias</TableHead>
                  {!isMobile && <TableHead className="hidden md:table-cell text-xs">Tipo</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {topIncidents.map((incident, index) => (
                  <TableRow key={incident.id} className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20">
                    <TableCell className="text-center font-medium text-gray-500 text-sm">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {incident.nombre}
                        </p>
                        {isMobile && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {incident.area}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {incident.area}
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <Badge className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        {incident.incidencias}
                      </Badge>
                    </TableCell>
                    {!isMobile && (
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {incident.tipo}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopPerformersTable;
