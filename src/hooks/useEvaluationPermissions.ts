
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useApiWithToken } from '@/hooks/useApiWithToken';

interface AsignacionUsuario {
  id: number;
  areaId: number;
  areaNombre: string;
  estado: string;
}

interface EvaluationPermissions {
  canViewAllEvaluations: boolean;
  canPerformSelfEvaluation: boolean;
  canPerformStudentEvaluation: boolean;
  canPerformSupervision: boolean;
  allowedAreaIds: number[];
  userAreaId: number | null;
}

export const useEvaluationPermissions = () => {
  const { user, isAuthenticated } = useAuth();
  const { apiRequest } = useApiWithToken();

  // Obtener las asignaciones del usuario actual
  const { data: asignacionesData, isLoading } = useQuery({
    queryKey: ['user-asignaciones', user?.id],
    queryFn: () => apiRequest(`/asignaciones/usuario/${user?.id}`),
    enabled: !!user?.id && isAuthenticated,
  });

  const asignaciones: AsignacionUsuario[] = asignacionesData?.data?.asignaciones || [];

  const permissions = useMemo((): EvaluationPermissions => {
    if (!user) {
      return {
        canViewAllEvaluations: false,
        canPerformSelfEvaluation: false,
        canPerformStudentEvaluation: false,
        canPerformSupervision: false,
        allowedAreaIds: [],
        userAreaId: null,
      };
    }

    // Extraer IDs de áreas de las asignaciones activas
    const activeAsignaciones = asignaciones.filter(a => a.estado === 'Activa');
    const allowedAreaIds = activeAsignaciones.map(a => a.areaId);
    const userAreaId = allowedAreaIds.length > 0 ? allowedAreaIds[0] : null;

    // Validaciones por rol
    const isAdmin = user.role === 'admin';
    const isDocente = user.role === 'evaluated'; // Docente = rol 'evaluated'
    const isEstudiante = user.role === 'student';
    const isEvaluador = user.role === 'evaluator';

    return {
      // Admin ve todas las evaluaciones
      canViewAllEvaluations: isAdmin,
      
      // Autoevaluación: Solo docentes con asignación de área
      canPerformSelfEvaluation: isDocente && allowedAreaIds.length > 0,
      
      // Evaluación estudiante-docente: Solo estudiantes con asignación de área
      canPerformStudentEvaluation: isEstudiante && allowedAreaIds.length > 0,
      
      // Supervisión: Solo evaluadores con asignación de área
      canPerformSupervision: isEvaluador && allowedAreaIds.length > 0,
      
      // Áreas permitidas para el usuario
      allowedAreaIds,
      
      // Área principal del usuario
      userAreaId,
    };
  }, [user, asignaciones]);

  return {
    permissions,
    isLoading,
    userAsignaciones: asignaciones,
  };
};
