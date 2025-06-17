
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, AlertTriangle, Star, TrendingUp, TrendingDown } from 'lucide-react';

const TopPerformersTable = () => {
  // Datos de ejemplo - tú implementarás la funcionalidad real
  const topPerformers = [
    { id: 1, nombre: 'María García López', area: 'Matemáticas', promedio: 18.5, evaluaciones: 12, trend: 'up' },
    { id: 2, nombre: 'Carlos Rodríguez Silva', area: 'Ciencias', promedio: 17.8, evaluaciones: 10, trend: 'up' },
    { id: 3, nombre: 'Ana Martínez Torres', area: 'Lengua', promedio: 17.2, evaluaciones: 14, trend: 'stable' },
    { id: 4, nombre: 'Luis Fernández Ruiz', area: 'Historia', promedio: 16.9, evaluaciones: 8, trend: 'up' },
    { id: 5, nombre: 'Elena Jiménez Morales', area: 'Inglés', promedio: 16.5, evaluaciones: 11, trend: 'down' },
  ];

  const topIncidents = [
    { id: 1, nombre: 'Pedro Sánchez Díaz', area: 'Ed. Física', incidencias: 5, tipo: 'Tardanzas' },
    { id: 2, nombre: 'Laura Vásquez Cano', area: 'Arte', incidencias: 4, tipo: 'Ausencias' },
    { id: 3, nombre: 'Miguel Torres Vega', area: 'Música', incidencias: 3, tipo: 'Quejas' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
    }
  };

  const getPerformanceBadge = (promedio: number) => {
    if (promedio >= 18) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excelente</Badge>;
    if (promedio >= 16) return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Muy Bueno</Badge>;
    if (promedio >= 14) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Bueno</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Regular</Badge>;
  };

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
      {/* Top Performers */}
      <Card className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Trophy className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
            Top 5 Mejores Promedios
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Colaboradores con los mejores promedios de evaluación
          </p>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 text-center">#</TableHead>
                  <TableHead className="min-w-[200px]">Colaborador</TableHead>
                  <TableHead className="hidden sm:table-cell">Área</TableHead>
                  <TableHead className="text-center">Promedio</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Eval.</TableHead>
                  <TableHead className="w-8 text-center">Tend.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((performer, index) => (
                  <TableRow key={performer.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <TableCell className="text-center font-medium">
                      {index === 0 && <Star className="h-4 w-4 text-yellow-500 mx-auto" />}
                      {index !== 0 && <span className="text-gray-500">{index + 1}</span>}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {performer.nombre}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                          {performer.area}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {performer.area}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold text-emerald-600">
                          {performer.promedio}
                        </span>
                        {getPerformanceBadge(performer.promedio)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center text-sm text-gray-600 dark:text-gray-400">
                      {performer.evaluaciones}
                    </TableCell>
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
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
            Más Incidencias
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Colaboradores que requieren mayor atención
          </p>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 text-center">#</TableHead>
                  <TableHead className="min-w-[200px]">Colaborador</TableHead>
                  <TableHead className="hidden sm:table-cell">Área</TableHead>
                  <TableHead className="text-center">Incidencias</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topIncidents.map((incident, index) => (
                  <TableRow key={incident.id} className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20">
                    <TableCell className="text-center font-medium text-gray-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {incident.nombre}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                          {incident.area}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {incident.area}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        {incident.incidencias}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {incident.tipo}
                      </span>
                    </TableCell>
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
