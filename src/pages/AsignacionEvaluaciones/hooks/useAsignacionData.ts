
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Asignacion {
  id: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
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

interface AreaData {
  id: number;
  name: string;
  description?: string;
}

export const useAsignacionData = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('iesrfa_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAsignaciones = async () => {
    try {
      console.log('=== FRONTEND: Iniciando fetchAsignaciones ===');
      const response = await fetch('http://localhost:3306/api/asignaciones', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar asignaciones');
      }
      
      const data = await response.json();
      console.log('=== FRONTEND: Respuesta completa del servidor ===', data);
      
      if (data?.success && data?.data?.asignaciones && Array.isArray(data.data.asignaciones)) {
        const asignacionesData = data.data.asignaciones;
        console.log('=== FRONTEND: Asignaciones recibidas ===', asignacionesData.length);
        
        setAsignaciones(asignacionesData);
        console.log('=== FRONTEND: Estado actualizado con', asignacionesData.length, 'asignaciones ===');
      } else {
        console.warn('=== FRONTEND: La respuesta no contiene un array de asignaciones válido ===');
        console.warn('Estructura recibida:', data);
        setAsignaciones([]);
      }
    } catch (error) {
      console.error('=== FRONTEND: Error en fetchAsignaciones ===', error);
      setAsignaciones([]);
      toast.error('Error de conexión al cargar asignaciones');
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('=== FRONTEND: Obteniendo áreas ===');
      const response = await fetch('http://localhost:3306/api/areas', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar áreas');
      }
      
      const data = await response.json();
      
      if (data?.success && data?.data?.areas) {
        const areasData = data.data.areas.map((area: any) => ({
          id: area.id,
          name: area.name || area.nombre,
          description: area.description || area.descripcion
        }));
        setAreas(areasData);
        console.log('=== FRONTEND: Áreas cargadas ===', areasData.length);
      } else {
        console.error('=== FRONTEND: Error cargando áreas ===', data);
        toast.error('Error al cargar las áreas');
      }
    } catch (error) {
      console.error('=== FRONTEND: Error al obtener áreas ===', error);
      toast.error('Error de conexión al cargar áreas');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchAsignaciones(), fetchAreas()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any, editingAsignacion: Asignacion | null) => {
    try {
      console.log('=== FRONTEND: Enviando datos de asignación ===', values);
      
      // Verificar token antes de hacer la petición
      const token = localStorage.getItem('iesrfa_token');
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return { success: false };
      }

      const url = editingAsignacion
        ? `http://localhost:3306/api/asignaciones/${editingAsignacion.id}`
        : 'http://localhost:3306/api/asignaciones';

      const method = editingAsignacion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(values)
      });

      console.log('=== FRONTEND: Respuesta del servidor ===', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('=== FRONTEND: Error en respuesta ===', errorData);
        toast.error(errorData?.error || errorData?.message || 'Error al guardar la asignación');
        return { success: false };
      }

      const data = await response.json();
      console.log('=== FRONTEND: Datos de respuesta ===', data);

      if (data?.success) {
        toast.success(data.message || 'Asignación guardada exitosamente');
        await fetchAsignaciones();
        return { success: true };
      } else {
        toast.error(data?.error || data?.message || 'Error al guardar la asignación');
        return { success: false };
      }
    } catch (error) {
      console.error('=== FRONTEND: Error al enviar asignación ===', error);
      toast.error('Error de conexión');
      return { success: false };
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3306/api/asignaciones/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData?.message || 'Error al eliminar la asignación');
        return;
      }

      const data = await response.json();

      if (data?.success) {
        toast.success('Asignación eliminada exitosamente');
        await fetchAsignaciones();
      } else {
        toast.error('Error al eliminar la asignación');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error de conexión');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    asignaciones,
    areas,
    isLoading,
    fetchAsignaciones,
    handleSubmit,
    handleDelete,
  };
};

export type { Asignacion, AreaData };
