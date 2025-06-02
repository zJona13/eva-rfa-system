
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useApiWithToken from '@/hooks/useApiWithToken';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AsignacionDialog from './components/AsignacionDialog';
import AsignacionesTable from './components/AsignacionesTable';

interface Asignacion {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  tipoEvaluacion: string;
  estado: string;
  descripcion?: string;
  areaNombre: string;
  areaId: number;
  totalEvaluaciones: number;
  evaluacionesCompletadas: number;
  periodo: number;
}

interface Area {
  id: number;
  name: string;
  description?: string;
}

interface UserEvaluation {
  idEvaluacion: number;
  fechaEvaluacion: string;
  horaEvaluacion: string;
  tipo: string;
  estado: string;
  nombres: string;
  apePat: string;
  apeMat: string;
  areaNombre: string;
  fecha_inicio: string;
  fecha_fin: string;
}

const AsignacionEvaluaciones = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [userEvaluations, setUserEvaluations] = useState<UserEvaluation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<Asignacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<number | null>(null);
  const { apiRequest } = useApiWithToken();
  const { user } = useAuth();

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchAsignaciones();
    fetchAreas();
    if (!isAdmin) {
      fetchUserEvaluations();
    }
  }, [isAdmin]);

  const fetchAsignaciones = async () => {
    try {
      console.log('🔍 Fetching asignaciones...');
      const response = await apiRequest('/asignaciones');
      console.log('📋 Response asignaciones:', response);
      
      if (response.success && response.data) {
        const asignacionesData = response.data.asignaciones || [];
        console.log('✅ Asignaciones cargadas:', asignacionesData.length);
        setAsignaciones(asignacionesData);
      } else {
        console.log('⚠️ No se encontraron asignaciones');
        setAsignaciones([]);
        if (!response.success) {
          toast.error('Error al cargar las asignaciones');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching asignaciones:', error);
      toast.error('Error de conexión al cargar asignaciones');
      setAsignaciones([]);
    }
  };

  const fetchAreas = async () => {
    try {
      console.log('🔍 Fetching areas...');
      const response = await apiRequest('/areas');
      console.log('🏢 Response areas:', response);
      
      if (response.success && response.data) {
        const areasData = response.data.areas || [];
        console.log('✅ Áreas cargadas:', areasData.length);
        setAreas(areasData);
        
        if (areasData.length === 0) {
          toast.error('No hay áreas disponibles');
        }
      } else {
        console.error('❌ Error en la respuesta de áreas:', response);
        toast.error('Error al cargar las áreas');
        setAreas([]);
      }
    } catch (error) {
      console.error('❌ Error fetching areas:', error);
      toast.error('Error de conexión al cargar áreas');
      setAreas([]);
    }
  };

  const fetchUserEvaluations = async () => {
    try {
      console.log('🔍 Fetching user evaluations...');
      const response = await apiRequest('/evaluaciones/my-evaluations');
      console.log('📝 Response user evaluations:', response);
      
      if (response.success && response.data) {
        const evaluacionesData = response.data.evaluaciones || [];
        console.log('✅ Evaluaciones del usuario cargadas:', evaluacionesData.length);
        setUserEvaluations(evaluacionesData);
      } else {
        console.log('⚠️ No se encontraron evaluaciones para el usuario');
        setUserEvaluations([]);
      }
    } catch (error) {
      console.error('❌ Error fetching user evaluations:', error);
      toast.error('Error al cargar las evaluaciones');
      setUserEvaluations([]);
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      console.log('💾 Submitting asignacion:', values);
      
      const response = editingAsignacion
        ? await apiRequest(`/asignaciones/${editingAsignacion.id}`, {
            method: 'PUT',
            body: values,
          })
        : await apiRequest('/asignaciones', {
            method: 'POST',
            body: values,
          });

      console.log('📤 Submit response:', response);

      if (response.success) {
        toast.success(response.data?.message || 'Asignación guardada exitosamente');
        setIsDialogOpen(false);
        setEditingAsignacion(null);
        // Recargar asignaciones para mostrar la nueva
        await fetchAsignaciones();
        // Si no es admin, también recargar las evaluaciones del usuario
        if (!isAdmin) {
          await fetchUserEvaluations();
        }
      } else {
        toast.error(response.error || 'Error al guardar la asignación');
      }
    } catch (error) {
      console.error('❌ Error submitting:', error);
      toast.error('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asignacion: Asignacion) => {
    setEditingAsignacion(asignacion);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    try {
      const response = await apiRequest(`/asignaciones/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        toast.success('Asignación eliminada exitosamente');
        await fetchAsignaciones();
      } else {
        toast.error('Error al eliminar la asignación');
      }
    } catch (error) {
      console.error('❌ Error deleting:', error);
      toast.error('Error de conexión al eliminar');
    }
  };

  const handleNewAsignacion = () => {
    setEditingAsignacion(null);
    setIsDialogOpen(true);
  };

  const handleSelectAsignacion = (asignacion: Asignacion) => {
    setSelectedAsignacion(asignacion.id);
  };

  const getRoleSpecificTitle = () => {
    switch (user?.role) {
      case 'evaluator':
        return 'Supervisión de Docentes';
      case 'evaluated':
        return 'Mis Autoevaluaciones';
      case 'student':
        return 'Evaluación a Docentes';
      default:
        return 'Asignación de Evaluaciones por Área';
    }
  };

  const getRoleSpecificDescription = () => {
    switch (user?.role) {
      case 'evaluator':
        return 'Realiza la supervisión de los docentes asignados a tu área';
      case 'evaluated':
        return 'Completa tus autoevaluaciones programadas';
      case 'student':
        return 'Evalúa el desempeño de tus docentes';
      default:
        return 'Gestiona los períodos y horarios para las evaluaciones organizadas por área';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{getRoleSpecificTitle()}</h1>
          <p className="text-muted-foreground">
            {getRoleSpecificDescription()}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleNewAsignacion}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Asignación
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? 'Asignaciones de Evaluación' : 'Mis Evaluaciones Pendientes'}
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Lista de todas las asignaciones de evaluación programadas por área. Cada asignación crea automáticamente autoevaluaciones, evaluaciones evaluador-evaluado y evaluaciones estudiante-docente.'
              : 'Lista de evaluaciones asignadas según tu rol en el sistema.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdmin ? (
            <AsignacionesTable
              asignaciones={asignaciones}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleSelectAsignacion}
              selectedId={selectedAsignacion || 0}
            />
          ) : (
            <div className="space-y-4">
              {userEvaluations.length > 0 ? (
                <div className="grid gap-4">
                  {userEvaluations.map((evaluation) => (
                    <Card key={evaluation.idEvaluacion} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{evaluation.tipo}</h3>
                          <p className="text-sm text-muted-foreground">
                            {evaluation.tipo === 'Autoevaluacion' 
                              ? 'Autoevaluación' 
                              : `${evaluation.nombres} ${evaluation.apePat} ${evaluation.apeMat}`
                            }
                          </p>
                          <p className="text-sm">Área: {evaluation.areaNombre}</p>
                          <p className="text-sm">Período: {evaluation.fecha_inicio} - {evaluation.fecha_fin}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-sm ${
                            evaluation.estado === 'Pendiente' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {evaluation.estado}
                          </span>
                          {evaluation.estado === 'Pendiente' && (
                            <Button className="mt-2 w-full" size="sm">
                              Realizar Evaluación
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tienes evaluaciones pendientes</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <AsignacionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          asignacionData={editingAsignacion}
          areas={areas}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default AsignacionEvaluaciones;
