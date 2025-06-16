import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Plus, Calendar, Users, Clock, Filter, Search, Eye, Edit, Trash2, BookOpen, GraduationCap, UserCog } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { crearAsignacion, listarAsignaciones, actualizarAsignacion } from '@/services/asignacionApi';
import { getToken } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Función para formatear la fecha en formato DD-MM-YY
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

// Función para formatear la hora en formato 24 horas
const formatTime = (timeString: string) => {
  if (!timeString) return '';
  return timeString.split(':').slice(0, 2).join(':');
};

// Función para determinar si la asignación ya terminó
const isAssignmentFinished = (fechaFin, horaFin) => {
  if (!fechaFin || !horaFin) return false;
  const fin = new Date(`${fechaFin}T${horaFin}`);
  return new Date() > fin;
};

// Función para mostrar el estado visual
const mostrarEstado = (asignacion) => {
  if (asignacion.estado === 'Activo' && isAssignmentFinished(asignacion.fechaFin, asignacion.horaFin)) {
    return 'Finalizado';
  }
  return asignacion.estado;
};

const AssignmentEvaluations = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [filteredAsignaciones, setFilteredAsignaciones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [areas, setAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [form, setForm] = useState({
    idArea: '',
    periodo: '',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const queryClient = useQueryClient();

  // Cargar áreas y asignaciones
  useEffect(() => {
    const token = getToken();
    fetch(`${API_URL}/areas`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => setAreas(data.areas || []));
    cargarAsignaciones();
  }, []);

  // Filtrar asignaciones
  useEffect(() => {
    let filtered = asignaciones;

    if (searchTerm) {
      filtered = filtered.filter(asignacion =>
        asignacion.areaNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asignacion.periodo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asignacion => asignacion.estado === statusFilter);
    }

    if (areaFilter !== 'all') {
      filtered = filtered.filter(asignacion => asignacion.idArea === parseInt(areaFilter));
    }

    setFilteredAsignaciones(filtered);
  }, [asignaciones, searchTerm, statusFilter, areaFilter]);

  const cargarAsignaciones = async () => {
    try {
      const token = getToken();
      const data = await listarAsignaciones(token);
      setAsignaciones(data.asignaciones || []);
    } catch (e) {
      setError('Error al cargar asignaciones');
      toast.error('Error al cargar asignaciones');
    }
  };

  const handleInput = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      if (editMode && editId) {
        await actualizarAsignacion(editId, { ...form, idUsuario: 1, estado: 'Activo' }, token);
        toast.success('Asignación actualizada exitosamente');
      } else {
        await crearAsignacion({ ...form, idUsuario: 1 }, token);
        toast.success('Asignación creada exitosamente');
      }
      setModalOpen(false);
      setForm({ idArea: '', periodo: '', fechaInicio: '', fechaFin: '', horaInicio: '', horaFin: '' });
      setEditMode(false);
      setEditId(null);
      cargarAsignaciones();
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries({ queryKey: ['report'] });
    } catch (e) {
      setError(e.message || 'Error al guardar asignación');
      toast.error('Error al guardar asignación');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'bg-green-500 hover:bg-green-600';
      case 'Inactivo': return 'bg-red-500 hover:bg-red-600';
      case 'Pendiente': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getEvaluationIcon = (tipo: string) => {
    switch (tipo) {
      case 'Autoevaluación': return <BookOpen className="h-4 w-4" />;
      case 'Estudiante-Docente': return <GraduationCap className="h-4 w-4" />;
      case 'Supervisor-Docente': return <UserCog className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Header con diseño responsivo */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-secondary"></div>
          <div className="relative z-10 p-4 md:p-6 lg:p-8 text-primary-foreground">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                  Asignación de Evaluaciones
                </h1>
                <p className="text-primary-foreground/80 text-sm md:text-base lg:text-lg">
                  Administra y asigna evaluaciones a los colaboradores del instituto
                </p>
              </div>
              <Button 
                className="bg-background text-foreground hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto" 
                size="lg"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Nueva Asignación
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Cards responsivas */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium opacity-90">Total Asignaciones</CardTitle>
              <UserCheck className="h-4 w-4 md:h-6 md:w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{asignaciones.length}</div>
              <p className="text-xs opacity-80 mt-1">Registradas en total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium opacity-90">Activas</CardTitle>
              <Calendar className="h-4 w-4 md:h-6 md:w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{asignaciones.filter(a => a.estado === 'Activo').length}</div>
              <p className="text-xs opacity-80 mt-1">En curso</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium opacity-90">Áreas Cubiertas</CardTitle>
              <Users className="h-4 w-4 md:h-6 md:w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{new Set(asignaciones.map(a => a.idArea)).size}</div>
              <p className="text-xs opacity-80 mt-1">Diferentes áreas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium opacity-90">Pendientes</CardTitle>
              <Clock className="h-4 w-4 md:h-6 md:w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{asignaciones.filter(a => a.estado === 'Pendiente').length}</div>
              <p className="text-xs opacity-80 mt-1">Por completar</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda responsivos */}
        <Card className="shadow-lg bg-white/70 dark:bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Filter className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Filtros y Búsqueda
                </CardTitle>
                <CardDescription className="text-sm">Encuentra asignaciones rápidamente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por área o periodo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  {areas.map(area => (
                    <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setAreaFilter('all');
                }}
                className="w-full sm:w-auto bg-background/50 border-border/50"
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de asignaciones responsiva */}
        <Card className="shadow-lg bg-white/70 dark:bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl md:text-2xl">Asignaciones Recientes</CardTitle>
            <CardDescription className="text-sm">
              Lista de evaluaciones asignadas y su estado actual ({filteredAsignaciones.length} de {asignaciones.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAsignaciones.length === 0 && (
                <div className="text-center py-8 md:py-12">
                  <UserCheck className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-medium text-foreground mb-2">No hay asignaciones</h3>
                  <p className="text-sm text-muted-foreground mb-4 px-4">
                    {asignaciones.length === 0 
                      ? 'No hay asignaciones registradas.' 
                      : 'No se encontraron asignaciones con los filtros aplicados.'
                    }
                  </p>
                  {asignaciones.length === 0 && (
                    <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear primera asignación
                    </Button>
                  )}
                </div>
              )}
              
              {filteredAsignaciones.map(asignacion => (
                <Card key={asignacion.idAsignacion} className="transition-all duration-300 hover:shadow-md hover:scale-[1.01] bg-background/50 border-border/50">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {getEvaluationIcon('general')}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-base md:text-lg truncate">{asignacion.areaNombre}</h4>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                              Periodo: {asignacion.periodo}
                            </Badge>
                            <Badge 
                              className={`text-white text-xs ${getStatusColor(mostrarEstado(asignacion))}`}
                            >
                              {mostrarEstado(asignacion)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span className="truncate">
                              <strong>Fechas:</strong> {formatDate(asignacion.fechaInicio)} - {formatDate(asignacion.fechaFin)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span className="truncate">
                              <strong>Horario:</strong> {formatTime(asignacion.horaInicio)} - {formatTime(asignacion.horaFin)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end lg:justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => {
                            setForm({
                              idArea: asignacion.idArea?.toString() || '',
                              periodo: asignacion.periodo || '',
                              fechaInicio: asignacion.fechaInicio?.slice(0, 10) || '',
                              fechaFin: asignacion.fechaFin?.slice(0, 10) || '',
                              horaInicio: asignacion.horaInicio || '',
                              horaFin: asignacion.horaFin || ''
                            });
                            setEditId(asignacion.idAsignacion);
                            setEditMode(true);
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal responsivo */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-bold">
                {editMode ? 'Editar Asignación' : 'Nueva Asignación'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Área</label>
                <Select name="idArea" value={form.idArea} onValueChange={v => setForm(f => ({ ...f, idArea: v }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Periodo</label>
                <Input 
                  name="periodo" 
                  value={form.periodo} 
                  onChange={handleInput} 
                  placeholder="Ej: 202401" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha Inicio</label>
                  <Input 
                    name="fechaInicio" 
                    type="date" 
                    value={form.fechaInicio} 
                    onChange={handleInput} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha Fin</label>
                  <Input 
                    name="fechaFin" 
                    type="date" 
                    value={form.fechaFin} 
                    onChange={handleInput} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora Inicio</label>
                  <Input 
                    name="horaInicio" 
                    type="time" 
                    value={form.horaInicio} 
                    onChange={handleInput} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora Fin</label>
                  <Input 
                    name="horaFin" 
                    type="time" 
                    value={form.horaFin} 
                    onChange={handleInput} 
                    required 
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setModalOpen(false);
                  setEditMode(false);
                  setEditId(null);
                }} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Guardando...' : editMode ? 'Actualizar Asignación' : 'Crear Asignación'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AssignmentEvaluations;
