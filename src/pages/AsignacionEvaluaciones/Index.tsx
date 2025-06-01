
import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useApiWithToken from '@/hooks/useApiWithToken';
import { toast } from 'sonner';
import AsignacionForm from './components/AsignacionForm';
import AsignacionesTable from './components/AsignacionesTable';

interface Asignacion {
  id: number;
  periodo: number;
  fechaInicio: string;
  fechaFin: string;
  areaNombre: string;
  areaId: number;
  estado: string;
  totalEvaluaciones: number;
  evaluacionesCompletadas: number;
}

interface Area {
  id: number;
  name: string;
  description?: string;
}

const AsignacionEvaluaciones = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<Asignacion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { apiRequest } = useApiWithToken();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchAsignaciones(), fetchAreas()]);
    setIsLoading(false);
  };

  const fetchAsignaciones = async () => {
    try {
      const response = await apiRequest('/asignaciones');
      if (response.success && response.data) {
        setAsignaciones(response.data.asignaciones || []);
      } else {
        toast.error('Error al cargar las asignaciones');
      }
    } catch (error) {
      toast.error('Error de conexión al cargar asignaciones');
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await apiRequest('/areas');
      if (response.success && response.data) {
        setAreas(response.data.areas || []);
      } else {
        toast.error('Error al cargar las áreas');
      }
    } catch (error) {
      toast.error('Error de conexión al cargar áreas');
    }
  };

  const handleCreate = () => {
    setEditingAsignacion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (asignacion: Asignacion) => {
    setEditingAsignacion(asignacion);
    setIsFormOpen(true);
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
        fetchAsignaciones();
      } else {
        toast.error(response.error || 'Error al eliminar la asignación');
      }
    } catch (error) {
      toast.error('Error de conexión al eliminar');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const response = editingAsignacion
        ? await apiRequest(`/asignaciones/${editingAsignacion.id}`, {
            method: 'PUT',
            body: formData,
          })
        : await apiRequest('/asignaciones', {
            method: 'POST',
            body: formData,
          });

      if (response.success) {
        toast.success(
          editingAsignacion 
            ? 'Asignación actualizada exitosamente' 
            : 'Asignación creada exitosamente'
        );
        setIsFormOpen(false);
        setEditingAsignacion(null);
        fetchAsignaciones();
      } else {
        toast.error(response.error || 'Error al guardar la asignación');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Asignaciones de Evaluación</h1>
          <p className="text-muted-foreground">
            Administra las asignaciones de evaluación por área
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Asignación
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Asignaciones</CardTitle>
          <CardDescription>
            Visualiza y gestiona todas las asignaciones de evaluación del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AsignacionesTable
            asignaciones={asignaciones}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <AsignacionForm
          asignacion={editingAsignacion}
          areas={areas}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingAsignacion(null);
          }}
        />
      )}
    </div>
  );
};

export default AsignacionEvaluaciones;
