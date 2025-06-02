
import React from 'react';
import { Calendar, Clock, Users, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AsignacionHistorial {
  id: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  fechaCreacion: string;
  areaId: number;
  areaNombre: string;
  usuarioCreador: string;
  estado: string;
  duracionDias: number;
  estadisticas: {
    totalEvaluaciones: number;
    evaluacionesCompletadas: number;
    evaluacionesPendientes: number;
    autoevaluaciones: number;
    evaluacionesEvaluador: number;
    evaluacionesEstudiante: number;
  };
  progreso: number;
}

interface AsignacionHistorialProps {
  asignaciones: AsignacionHistorial[];
  onEdit?: (asignacion: AsignacionHistorial) => void;
  onDelete?: (id: number) => void;
}

const AsignacionHistorial: React.FC<AsignacionHistorialProps> = ({
  asignaciones,
  onEdit,
  onDelete,
}) => {
  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Activa': 'secondary',
      'Abierta': 'default',
      'Cerrada': 'outline',
      'Inactiva': 'destructive',
    };
    
    const colors: Record<string, string> = {
      'Activa': 'bg-yellow-100 text-yellow-800',
      'Abierta': 'bg-green-100 text-green-800',
      'Cerrada': 'bg-gray-100 text-gray-800',
      'Inactiva': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge variant={variants[estado] || 'secondary'} className={colors[estado]}>
        {estado}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getProgressColor = (progreso: number) => {
    if (progreso >= 80) return 'bg-green-500';
    if (progreso >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (asignaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay asignaciones</h3>
        <p className="text-gray-500">No se encontraron asignaciones en el historial</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {asignaciones.map((asignacion) => (
        <Card key={asignacion.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  {asignacion.areaNombre}
                  <span className="text-sm font-normal text-gray-500">
                    (Período {asignacion.periodo})
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(asignacion.fechaInicio)} - {formatDate(asignacion.fechaFin)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {asignacion.duracionDias} días
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getEstadoBadge(asignacion.estado)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Creado por</p>
                <p className="text-sm text-gray-600">{asignacion.usuarioCreador}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Fecha de creación</p>
                <p className="text-sm text-gray-600">{formatDate(asignacion.fechaCreacion)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">ID Asignación</p>
                <p className="text-sm text-gray-600">#{asignacion.id}</p>
              </div>
            </div>

            {/* Progreso general */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Progreso General</p>
                <span className="text-sm text-gray-600">
                  {asignacion.estadisticas.evaluacionesCompletadas} / {asignacion.estadisticas.totalEvaluaciones}
                </span>
              </div>
              <Progress 
                value={asignacion.progreso} 
                className="h-2"
              />
              <p className="text-xs text-gray-500">{asignacion.progreso}% completado</p>
            </div>

            {/* Estadísticas detalladas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">Autoevaluaciones</span>
                </div>
                <p className="text-lg font-semibold text-blue-600">
                  {asignacion.estadisticas.autoevaluaciones}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-gray-700">Eval. Docente</span>
                </div>
                <p className="text-lg font-semibold text-purple-600">
                  {asignacion.estadisticas.evaluacionesEvaluador}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Eval. Estudiante</span>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {asignacion.estadisticas.evaluacionesEstudiante}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-medium text-gray-700">Pendientes</span>
                </div>
                <p className="text-lg font-semibold text-orange-600">
                  {asignacion.estadisticas.evaluacionesPendientes}
                </p>
              </div>
            </div>

            {/* Acciones (si se proporcionan) */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 pt-2 border-t">
                {onEdit && (
                  <button
                    onClick={() => onEdit(asignacion)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(asignacion.id)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AsignacionHistorial;
