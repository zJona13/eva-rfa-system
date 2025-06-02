
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Asignacion, AreaData } from '../hooks/useAsignacionData';

interface DebugInfoProps {
  asignaciones: Asignacion[];
  asignacionesAbiertas: Asignacion[];
  asignacionesCerradas: Asignacion[];
  areas: AreaData[];
  isLoading: boolean;
}

const DebugInfo: React.FC<DebugInfoProps> = ({
  asignaciones,
  asignacionesAbiertas,
  asignacionesCerradas,
  areas,
  isLoading,
}) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm text-blue-700">
            <strong>Debug Info:</strong>
          </p>
          <p className="text-xs text-blue-600">
            • Total asignaciones: {asignaciones.length}
          </p>
          <p className="text-xs text-blue-600">
            • Abiertas: {asignacionesAbiertas.length}
          </p>
          <p className="text-xs text-blue-600">
            • Cerradas: {asignacionesCerradas.length}
          </p>
          <p className="text-xs text-blue-600">
            • Áreas cargadas: {areas.length}
          </p>
          <p className="text-xs text-blue-600">
            • Loading: {isLoading ? 'Sí' : 'No'}
          </p>
          {asignaciones.length > 0 && (
            <div className="text-xs text-blue-600">
              <p>• Primera asignación: {asignaciones[0].areaNombre} - {asignaciones[0].estado}</p>
              <p>• Evaluaciones: {asignaciones[0].estadisticas.totalEvaluaciones}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugInfo;
