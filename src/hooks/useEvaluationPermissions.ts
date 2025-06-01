
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useApiWithToken } from '@/hooks/useApiWithToken';

interface UserAsignacion {
  id: number;
  areaId: number;
  areaNombre: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

export const useEvaluationPermissions = () => {
  const { user } = useAuth();
  const { apiRequest } = useApiWithToken();

  // Fetch user assignments to determine area permissions
  const { data: asignacionesData, isLoading } = useQuery({
    queryKey: ['user-asignaciones', user?.id],
    queryFn: () => apiRequest(`/user-asignaciones/${user?.id}`),
    enabled: !!user?.id && user?.role !== 'admin',
  });

  const userAsignaciones = asignacionesData?.data?.asignaciones || [];
  
  // Get current active assignments (currently open assignments)
  const activeAsignaciones = userAsignaciones.filter((asignacion: UserAsignacion) => 
    asignacion.estado === 'Abierta'
  );

  const getUserAreas = () => {
    if (user?.role === 'admin') {
      return null; // Admin can access all areas
    }
    return activeAsignaciones.map((a: UserAsignacion) => a.areaId);
  };

  const canAccessSelfEvaluation = () => {
    if (user?.role === 'admin') return true;
    if (user?.role !== 'evaluated') return false;
    
    // Docente role can access self-evaluation if they have active assignments
    return activeAsignaciones.length > 0;
  };

  const canAccessStudentEvaluation = () => {
    if (user?.role === 'admin') return true;
    if (user?.role !== 'student') return false;
    
    // Student can access evaluation if they have active assignments in an area
    return activeAsignaciones.length > 0;
  };

  const canAccessSupervisionEvaluation = () => {
    if (user?.role === 'admin') return true;
    if (user?.role !== 'evaluator') return false;
    
    // Evaluator can access supervision if they have active assignments
    return activeAsignaciones.length > 0;
  };

  return {
    isLoading,
    userAreas: getUserAreas(),
    activeAsignaciones,
    canAccessSelfEvaluation: canAccessSelfEvaluation(),
    canAccessStudentEvaluation: canAccessStudentEvaluation(),
    canAccessSupervisionEvaluation: canAccessSupervisionEvaluation(),
  };
};
