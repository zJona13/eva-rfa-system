import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Building } from 'lucide-react';

// Función para formatear la fecha en formato DD-MM-YY
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

interface EvaluationCardProps {
  evaluacion: {
    idEvaluacion: number;
    periodo: string;
    fechaInicio: string;
    fechaFin: string;
    horaInicio: string;
    horaFin: string;
    areaNombre: string;
    nombreEvaluado: string;
    tipoEvaluacionNombre: string;
    estado: string;
  };
  onStartEvaluation: (idEvaluacion: number) => void;
  colorScheme: 'purple' | 'blue' | 'green';
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ 
  evaluacion, 
  onStartEvaluation, 
  colorScheme 
}) => {
  const colorClasses = {
    purple: {
      border: 'border-l-purple-500',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      button: 'bg-purple-500 hover:bg-purple-600'
    },
    blue: {
      border: 'border-l-blue-500',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      button: 'bg-blue-500 hover:bg-blue-600'
    },
    green: {
      border: 'border-l-green-500',
      badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      button: 'bg-green-500 hover:bg-green-600'
    }
  };

  const colors = colorClasses[colorScheme];

  const isWithinEvaluationPeriod = () => {
    const now = new Date();
    const startDate = new Date(evaluacion.fechaInicio);
    const endDate = new Date(evaluacion.fechaFin);
    return now >= startDate && now <= endDate;
  };

  return (
    <Card className={`shadow-lg ${colors.border} border-l-4`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={colors.badge}>
              Periodo {evaluacion.periodo}
            </Badge>
            <Badge variant="outline">
              {evaluacion.estado}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
          {evaluacion.tipoEvaluacionNombre}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Evaluación asignada para el periodo académico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span>{evaluacion.nombreEvaluado}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Building className="h-4 w-4" />
            <span>{evaluacion.areaNombre}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(evaluacion.fechaInicio)} - {formatDate(evaluacion.fechaFin)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{evaluacion.horaInicio} - {evaluacion.horaFin}</span>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => onStartEvaluation(evaluacion.idEvaluacion)}
            disabled={!isWithinEvaluationPeriod()}
            className={`${colors.button} text-white font-medium`}
          >
            {isWithinEvaluationPeriod() ? 'Iniciar Evaluación' : 'Fuera de Periodo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluationCard;
