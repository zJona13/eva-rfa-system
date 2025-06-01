
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import useApiWithToken from '@/hooks/useApiWithToken';
import { CheckCircle, Clock, User, Users, GraduationCap } from 'lucide-react';

interface EvaluacionPorRol {
  tipo: 'Autoevaluacion' | 'Evaluador-Evaluado' | 'Estudiante-Docente';
  titulo: string;
  descripcion: string;
  ruta: string;
  icono: React.ReactNode;
  rolesPermitidos: string[];
}

interface EvaluacionesPorRolProps {
  areaId?: number;
  asignacionId?: number;
}

const EvaluacionesPorRol: React.FC<EvaluacionesPorRolProps> = ({ 
  areaId, 
  asignacionId 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { apiRequest } = useApiWithToken();
  const [evaluacionesDisponibles, setEvaluacionesDisponibles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const tiposEvaluacion: EvaluacionPorRol[] = [
    {
      tipo: 'Autoevaluacion',
      titulo: 'Autoevaluación',
      descripcion: 'Evaluación personal del docente sobre su propio desempeño',
      ruta: '/self-evaluation',
      icono: <User className="h-5 w-5" />,
      rolesPermitidos: ['admin', 'evaluated'] // Docentes
    },
    {
      tipo: 'Evaluador-Evaluado',
      titulo: 'Supervisión',
      descripcion: 'Evaluación realizada por supervisores a docentes',
      ruta: '/checklist-evaluation',
      icono: <Users className="h-5 w-5" />,
      rolesPermitidos: ['admin', 'evaluator'] // Evaluadores
    },
    {
      tipo: 'Estudiante-Docente',
      titulo: 'Evaluación al Docente',
      descripcion: 'Evaluación realizada por estudiantes a sus docentes',
      ruta: '/student-evaluation',
      icono: <GraduationCap className="h-5 w-5" />,
      rolesPermitidos: ['admin', 'student'] // Estudiantes
    }
  ];

  useEffect(() => {
    if (user && asignacionId) {
      fetchEvaluacionesAsignacion();
    }
  }, [user, asignacionId]);

  const fetchEvaluacionesAsignacion = async () => {
    if (!asignacionId) return;
    
    setLoading(true);
    try {
      const response = await apiRequest(`/asignaciones/${asignacionId}/evaluaciones`);
      if (response.success) {
        setEvaluacionesDisponibles(response.data.evaluaciones || []);
      }
    } catch (error) {
      console.error('Error al obtener evaluaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIrAEvaluacion = (ruta: string) => {
    navigate(ruta);
  };

  const getEstadoEvaluacion = (tipo: string) => {
    const evaluacion = evaluacionesDisponibles.find(e => e.tipo === tipo);
    return evaluacion?.estado || 'No disponible';
  };

  const getConteoEvaluaciones = (tipo: string) => {
    const evaluaciones = evaluacionesDisponibles.filter(e => e.tipo === tipo);
    const completadas = evaluaciones.filter(e => e.estado === 'Completada').length;
    return { total: evaluaciones.length, completadas };
  };

  const puedeAccederEvaluacion = (rolesPermitidos: string[]) => {
    return user && rolesPermitidos.includes(user.role);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Evaluaciones Disponibles</h3>
      
      {areaId && !asignacionId && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Selecciona una asignación para ver las evaluaciones disponibles
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiposEvaluacion.map((evaluacion) => {
          const puedeAcceder = puedeAccederEvaluacion(evaluacion.rolesPermitidos);
          const estado = getEstadoEvaluacion(evaluacion.tipo);
          const conteo = getConteoEvaluaciones(evaluacion.tipo);

          return (
            <Card 
              key={evaluacion.tipo}
              className={`${
                puedeAcceder ? 'border-primary/20 hover:shadow-md transition-shadow' : 'opacity-60'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {evaluacion.icono}
                    <CardTitle className="text-base">{evaluacion.titulo}</CardTitle>
                  </div>
                  
                  {asignacionId && (
                    <Badge 
                      variant={estado === 'Completada' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {estado === 'Completada' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {estado}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{evaluacion.descripcion}</p>
                
                {asignacionId && conteo.total > 0 && (
                  <div className="text-xs text-gray-500">
                    {conteo.completadas} de {conteo.total} completadas
                  </div>
                )}

                {puedeAcceder ? (
                  <Button 
                    onClick={() => handleIrAEvaluacion(evaluacion.ruta)}
                    size="sm" 
                    className="w-full"
                    disabled={!asignacionId || estado === 'No disponible'}
                  >
                    {estado === 'Completada' ? 'Ver Evaluación' : 'Realizar Evaluación'}
                  </Button>
                ) : (
                  <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
                    No tienes permisos para esta evaluación
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500 mt-4">
        <p><strong>Tu rol:</strong> {user.role === 'admin' ? 'Administrador' : 
          user.role === 'evaluator' ? 'Evaluador' : 
          user.role === 'evaluated' ? 'Docente' : 
          user.role === 'student' ? 'Estudiante' : user.role}</p>
      </div>
    </div>
  );
};

export default EvaluacionesPorRol;
