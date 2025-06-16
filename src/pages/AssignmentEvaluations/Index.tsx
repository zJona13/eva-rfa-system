
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth, getToken } from '@/contexts/AuthContext';
import { Calendar, Search, Users, UserCheck, Clock, CheckCircle2, XCircle, Plus, Filter } from 'lucide-react';

// API Functions
const fetchEvaluaciones = async () => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/evaluaciones', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error('Error al cargar evaluaciones');
  return response.json();
};

const fetchColaboradores = async () => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/colaboradores', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error('Error al cargar colaboradores');
  return response.json();
};

const fetchEvaluadores = async () => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/evaluadores', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error('Error al cargar evaluadores');
  return response.json();
};

const crearAsignacion = async (asignacionData: any) => {
  const token = getToken();
  const response = await fetch('http://localhost:3309/api/asignaciones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(asignacionData)
  });
  if (!response.ok) throw new Error('Error al crear asignación');
  return response.json();
};

const AssignmentEvaluations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEvaluacion, setSelectedEvaluacion] = useState('');
  const [selectedColaborador, setSelectedColaborador] = useState('');
  const [selectedEvaluador, setSelectedEvaluador] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Queries
  const { data: evaluacionesData, isLoading: evaluacionesLoading } = useQuery({
    queryKey: ['evaluaciones'],
    queryFn: fetchEvaluaciones
  });

  const { data: colaboradoresData, isLoading: colaboradoresLoading } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: fetchColaboradores
  });

  const { data: evaluadoresData, isLoading: evaluadoresLoading } = useQuery({
    queryKey: ['evaluadores'],
    queryFn: fetchEvaluadores
  });

  // Mutation para crear asignación
  const createAsignacionMutation = useMutation({
    mutationFn: crearAsignacion,
    onSuccess: () => {
      toast.success('Asignación creada exitosamente');
      setDialogOpen(false);
      // Reset form
      setSelectedEvaluacion('');
      setSelectedColaborador('');
      setSelectedEvaluador('');
      setFechaInicio('');
      setFechaFin('');
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['evaluaciones'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear la asignación');
    }
  });

  const handleCreateAsignacion = () => {
    if (!selectedEvaluacion || !selectedColaborador || !selectedEvaluador || !fechaInicio || !fechaFin) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    createAsignacionMutation.mutate({
      evaluacionId: parseInt(selectedEvaluacion),
      colaboradorId: parseInt(selectedColaborador),
      evaluadorId: parseInt(selectedEvaluador),
      fechaInicio,
      fechaFin,
      estado: 'pendiente'
    });
  };

  // Verificación de permisos
  const canCreateAssignments = () => {
    if (!user?.role) return false;
    const userRole = user.role.toLowerCase();
    return ['admin', 'administrador', 'evaluador', 'evaluator'].includes(userRole);
  };

  if (!canCreateAssignments()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-xl border-red-200 dark:border-red-800/50 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                <XCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground">Acceso Restringido</h3>
                <p className="text-sm md:text-base text-muted-foreground mt-2">Solo administradores y evaluadores pueden asignar evaluaciones.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const evaluaciones = evaluacionesData?.evaluaciones || [];
  const colaboradores = colaboradoresData?.colaboradores || [];
  const evaluadores = evaluadoresData?.evaluadores || [];

  // Filtros
  const filteredEvaluaciones = evaluaciones.filter((eval: any) => {
    const matchesSearch = eval.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         eval.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || eval.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950/20 dark:via-background dark:to-blue-950/20">
      {/* Header responsivo */}
      <div className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                  <UserCheck className="h-5 w-5 md:h-7 md:w-7" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Asignación de Evaluaciones
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
                    Asigne evaluaciones a colaboradores y evaluadores
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botón crear asignación */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto" size="lg">
                  <Plus className="h-4 w-4 md:h-5 md:w-5" />
                  Nueva Asignación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">Crear Nueva Asignación</DialogTitle>
                  <DialogDescription className="text-sm md:text-base">
                    Complete los campos para crear una nueva asignación de evaluación
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="evaluacion" className="text-sm font-medium">Evaluación</Label>
                    <Select value={selectedEvaluacion} onValueChange={setSelectedEvaluacion}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar evaluación" />
                      </SelectTrigger>
                      <SelectContent>
                        {evaluaciones.map((eval: any) => (
                          <SelectItem key={eval.id} value={eval.id.toString()}>
                            {eval.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colaborador" className="text-sm font-medium">Colaborador</Label>
                    <Select value={selectedColaborador} onValueChange={setSelectedColaborador}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {colaboradores.map((colab: any) => (
                          <SelectItem key={colab.id} value={colab.id.toString()}>
                            {colab.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evaluador" className="text-sm font-medium">Evaluador</Label>
                    <Select value={selectedEvaluador} onValueChange={setSelectedEvaluador}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar evaluador" />
                      </SelectTrigger>
                      <SelectContent>
                        {evaluadores.map((eval: any) => (
                          <SelectItem key={eval.id} value={eval.id.toString()}>
                            {eval.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fechaInicio" className="text-sm font-medium">Fecha Inicio</Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaFin" className="text-sm font-medium">Fecha Fin</Label>
                      <Input
                        id="fechaFin"
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button 
                      onClick={handleCreateAsignacion}
                      disabled={createAsignacionMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      {createAsignacionMutation.isPending ? 'Creando...' : 'Crear Asignación'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Filtros responsivos */}
        <Card className="shadow-xl border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                <Filter className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl font-bold text-foreground">
                  Filtros de Búsqueda
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Filtre las evaluaciones por diferentes criterios
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar evaluaciones..." 
                  className="pl-10 pr-4 bg-background/80 backdrop-blur-sm border-2 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-48 bg-background/80 backdrop-blur-sm border-2 focus:border-primary">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de evaluaciones responsiva */}
        <div>
          {evaluacionesLoading ? (
            <div className="flex items-center justify-center p-8 md:p-12">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="h-8 w-8 md:h-12 md:w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary mx-auto"></div>
                  <div className="absolute inset-0 h-8 w-8 md:h-12 md:w-12 animate-ping rounded-full border border-primary/20 mx-auto"></div>
                </div>
                <p className="text-base md:text-lg font-medium text-muted-foreground">Cargando evaluaciones...</p>
              </div>
            </div>
          ) : filteredEvaluaciones.length === 0 ? (
            <Card className="shadow-xl border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
              <CardContent className="text-center py-8 md:py-12">
                <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">No se encontraron evaluaciones</h3>
                <p className="text-sm md:text-base text-muted-foreground">No hay evaluaciones que coincidan con los filtros seleccionados.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredEvaluaciones.map((evaluacion: any) => (
                <Card key={evaluacion.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white shadow-lg group-hover:shadow-xl transition-shadow">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <Badge 
                        className={`text-xs font-medium transition-all ${
                          evaluacion.estado === 'activo' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-500' 
                            : evaluacion.estado === 'pendiente'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-500'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-500'
                        }`}
                      >
                        {evaluacion.estado === 'activo' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {evaluacion.estado === 'pendiente' && <Clock className="h-3 w-3 mr-1" />}
                        {evaluacion.estado === 'inactivo' && <XCircle className="h-3 w-3 mr-1" />}
                        {evaluacion.estado}
                      </Badge>
                    </div>
                    <CardTitle className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {evaluacion.titulo}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                      {evaluacion.descripcion}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Tipo:</span>
                        <span className="font-medium">{evaluacion.tipo}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Periodo:</span>
                        <span className="font-medium">{evaluacion.periodo}</span>
                      </div>
                      {evaluacion.fechaCreacion && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Creado:</span>
                          <span className="font-medium">
                            {new Date(evaluacion.fechaCreacion).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentEvaluations;
