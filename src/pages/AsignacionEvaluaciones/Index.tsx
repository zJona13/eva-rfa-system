import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AsignacionDialog from './components/AsignacionDialog';
import AsignacionFilters from './components/AsignacionFilters';
import AsignacionTabs from './components/AsignacionTabs';
import { useAsignacionData } from './hooks/useAsignacionData';

const AsignacionEvaluaciones = () => {
  const { 
    asignaciones, 
    areas, 
    isLoading, 
    handleSubmit, 
    handleDelete 
  } = useAsignacionData();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroArea, setFiltroArea] = useState<string>('todas');

  const handleEdit = (asignacion: any) => {
    setEditingAsignacion(asignacion);
    setIsDialogOpen(true);
  };

  const handleNewAsignacion = () => {
    setEditingAsignacion(null);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    const result = await handleSubmit(values, editingAsignacion);
    if (result.success) {
      setIsDialogOpen(false);
      setEditingAsignacion(null);
    }
    setIsSubmitting(false);
  };

  // Filtrar asignaciones
  const asignacionesFiltradas = asignaciones.filter(asignacion => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || asignacion.estado.toLowerCase() === filtroEstado.toLowerCase();
    const cumpleFiltroArea = filtroArea === 'todas' || asignacion.areaId.toString() === filtroArea;
    return cumpleFiltroEstado && cumpleFiltroArea;
  });

  // Agrupar asignaciones por estado
  const asignacionesAbiertas = asignacionesFiltradas.filter(a => a.estado.toLowerCase() === 'abierta');
  const asignacionesCerradas = asignacionesFiltradas.filter(a => a.estado.toLowerCase() === 'cerrada');
  const todasAsignaciones = asignacionesFiltradas;

  console.log('=== FRONTEND: Estado actual del componente ===');
  console.log('isLoading:', isLoading);
  console.log('Total asignaciones en estado:', asignaciones.length);
  console.log('Asignaciones sin filtrar:', asignaciones);
  console.log('Filtradas:', asignacionesFiltradas.length);
  console.log('Abiertas:', asignacionesAbiertas.length);
  console.log('Cerradas:', asignacionesCerradas.length);
  console.log('Estados únicos:', [...new Set(asignaciones.map(a => a.estado))]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando asignaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Historial de Asignaciones</h1>
          <p className="text-muted-foreground">
            Gestiona y revisa el historial completo de asignaciones de evaluación por área
          </p>
        </div>
        <Button onClick={handleNewAsignacion}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      <AsignacionFilters
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
        filtroArea={filtroArea}
        setFiltroArea={setFiltroArea}
        areas={areas}
      />

      <AsignacionTabs
        todasAsignaciones={todasAsignaciones}
        asignacionesAbiertas={asignacionesAbiertas}
        asignacionesCerradas={asignacionesCerradas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNewAsignacion={handleNewAsignacion}
      />

      <AsignacionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        asignacionData={editingAsignacion}
        areas={areas}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AsignacionEvaluaciones;
