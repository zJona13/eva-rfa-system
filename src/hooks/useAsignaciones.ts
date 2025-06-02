
import { useState, useEffect } from 'react';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';

export interface AsignacionData {
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

export interface AreaData {
  id: number;
  name: string;
  description?: string;
}

export const useAsignaciones = () => {
  const [asignaciones, setAsignaciones] = useState<AsignacionData[]>([]);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { apiRequest } = useApiWithToken();

  const fetchAsignaciones = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Hook: Iniciando fetchAsignaciones...');
      const response = await apiRequest('/asignaciones');
      console.log('📥 Hook: Response asignaciones:', response);
      
      if (response.success && response.data) {
        // Asegurar que tenemos un array de asignaciones
        let asignacionesArray: AsignacionData[] = [];
        
        if (Array.isArray(response.data)) {
          asignacionesArray = response.data;
        } else if (response.data.asignaciones && Array.isArray(response.data.asignaciones)) {
          asignacionesArray = response.data.asignaciones;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          asignacionesArray = response.data.data;
        }
        
        console.log('✅ Hook: Asignaciones procesadas:', asignacionesArray.length);
        setAsignaciones(asignacionesArray);
        
        if (asignacionesArray.length > 0) {
          toast.success(`${asignacionesArray.length} asignaciones cargadas`);
        }
      } else {
        console.error('❌ Hook: Error en respuesta:', response);
        setAsignaciones([]);
        toast.error('Error al cargar asignaciones');
      }
    } catch (error) {
      console.error('💥 Hook: Error crítico:', error);
      setAsignaciones([]);
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('🔄 Hook: Iniciando fetchAreas...');
      const response = await apiRequest('/areas');
      console.log('📥 Hook: Response areas:', response);
      
      if (response.success && response.data) {
        let areasArray: AreaData[] = [];
        
        if (Array.isArray(response.data)) {
          areasArray = response.data;
        } else if (response.data.areas && Array.isArray(response.data.areas)) {
          areasArray = response.data.areas;
        }
        
        console.log('✅ Hook: Áreas procesadas:', areasArray.length);
        setAreas(areasArray);
      } else {
        console.error('❌ Hook: Error en areas:', response);
        setAreas([]);
        toast.error('Error al cargar áreas');
      }
    } catch (error) {
      console.error('💥 Hook: Error áreas:', error);
      setAreas([]);
    }
  };

  useEffect(() => {
    fetchAsignaciones();
    fetchAreas();
  }, []);

  return {
    asignaciones,
    areas,
    isLoading,
    refetchAsignaciones: fetchAsignaciones,
    refetchAreas: fetchAreas
  };
};
