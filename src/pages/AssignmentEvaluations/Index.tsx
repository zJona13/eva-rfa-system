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
    fetch('http://localhost:3309/api/areas', {
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header con diseño mejorado */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-secondary"></div>
          <div className="relative z-10 p-8 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Asignación de Evaluaciones</h1>
                <p className="text-primary-foreground/80 text-lg">
                  Administra y asigna evaluaciones a los colaboradores del instituto
                </p>
              </div>
              <Button 
                className="bg-background text-foreground hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                size="lg"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva Asignación
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Cards mejoradas */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Asignaciones</CardTitle>
              <UserCheck className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{asignaciones.length}</div>
              <p className="text-xs opacity-80 mt-1">Registradas en total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Activas</CardTitle>
              <Calendar className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{asignaciones.filter(a => a.estado === 'Activo').length}</div>
              <p className="text-xs opacity-80 mt-1">En curso</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Áreas Cubiertas</CardTitle>
              <Users className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{new Set(asignaciones.map(a => a.idArea)).size}</div>
              <p className="text-xs opacity-80 mt-1">Diferentes áreas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Pendientes</CardTitle>
              <Clock className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{asignaciones.filter(a => a.estado === 'Pendiente').length}</div>
              <p className="text-xs opacity-80 mt-1">Por completar</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filtros y Búsqueda
                </CardTitle>
                <CardDescription>Encuentra asignaciones rápidamente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por área o periodo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
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
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de asignaciones */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Asignaciones Recientes</CardTitle>
            <CardDescription>
              Lista de evaluaciones asignadas y su estado actual ({filteredAsignaciones.length} de {asignaciones.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAsignaciones.length === 0 && (
                <div className="text-center py-12">
                  <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No hay asignaciones</h3>
                  <p className="text-muted-foreground mb-4">
                    {asignaciones.length === 0 
                      ? 'No hay asignaciones registradas.' 
                      : 'No se encontraron asignaciones con los filtros aplicados.'
                    }
                  </p>
                  {asignaciones.length === 0 && (
                    <Button onClick={() => setModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear primera asignación
                    </Button>
                  )}
                </div>
              )}
              
              {filteredAsignaciones.map(asignacion => (
                <Card key={asignacion.idAsignacion} className="transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getEvaluationIcon('general')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{asignacion.areaNombre}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                Periodo: {asignacion.periodo}
                              </Badge>
                              <Badge 
                                className={`text-white ${getStatusColor(mostrarEstado(asignacion))}`}
                              >
                                {mostrarEstado(asignacion)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              <strong>Fechas:</strong> {formatDate(asignacion.fechaInicio)} - {formatDate(asignacion.fechaFin)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              <strong>Horario:</strong> {formatTime(asignacion.horaInicio)} - {formatTime(asignacion.horaFin)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
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

        {/* Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Nueva Asignación</DialogTitle>
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setModalOpen(false);
                  setEditMode(false);
                  setEditId(null);
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
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
