
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Plus, Calendar, Users, Clock, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { crearAsignacion, obtenerAsignaciones, type AsignacionData, type Asignacion } from '@/services/asignacionApi';

const AssignmentEvaluations = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    idUsuario: '',
    periodo: '',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: '',
    idArea: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar asignaciones
      const asignacionesRes = await obtenerAsignaciones();
      if (asignacionesRes.success) {
        setAsignaciones(asignacionesRes.asignaciones);
      }

      // Cargar áreas
      const areasRes = await fetch('/api/areas');
      if (areasRes.ok) {
        const areasData = await areasRes.json();
        setAreas(areasData.areas || []);
      }

      // Cargar usuarios
      const usuariosRes = await fetch('/api/users');
      if (usuariosRes.ok) {
        const usuariosData = await usuariosRes.json();
        setUsuarios(usuariosData.users || []);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAsignacion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const asignacionData: AsignacionData = {
        idUsuario: parseInt(formData.idUsuario),
        periodo: parseInt(formData.periodo),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        idArea: parseInt(formData.idArea)
      };

      const result = await crearAsignacion(asignacionData);
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message,
        });
        
        setShowCreateDialog(false);
        setFormData({
          idUsuario: '',
          periodo: '',
          fechaInicio: '',
          fechaFin: '',
          horaInicio: '',
          horaFin: '',
          idArea: ''
        });
        
        loadData(); // Recargar la lista
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la asignación",
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'default';
      case 'Inactivo':
        return 'secondary';
      case 'Pendiente':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asignación de Evaluaciones</h1>
          <p className="text-muted-foreground">
            Administra y asigna evaluaciones a los colaboradores del instituto
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Asignación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Asignación</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAsignacion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodo">Período</Label>
                  <Input
                    id="periodo"
                    type="number"
                    value={formData.periodo}
                    onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                    placeholder="2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="idArea">Área</Label>
                  <Select value={formData.idArea} onValueChange={(value) => setFormData({ ...formData, idArea: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area: any) => (
                        <SelectItem key={area.idArea} value={area.idArea.toString()}>
                          {area.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="idUsuario">Usuario Responsable</Label>
                <Select value={formData.idUsuario} onValueChange={(value) => setFormData({ ...formData, idUsuario: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((usuario: any) => (
                      <SelectItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horaInicio">Hora Inicio</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="horaFin">Hora Fin</Label>
                  <Input
                    id="horaFin"
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Crear Asignación
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asignaciones</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asignaciones.length}</div>
            <p className="text-xs text-muted-foreground">
              Asignaciones registradas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {asignaciones.filter(a => a.estado === 'Activo').length}
            </div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {asignaciones.filter(a => a.estado === 'Inactivo').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Finalizadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áreas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{areas.length}</div>
            <p className="text-xs text-muted-foreground">
              Con asignaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment List */}
      <Card>
        <CardHeader>
          <CardTitle>Asignaciones Registradas</CardTitle>
          <CardDescription>
            Lista de asignaciones de evaluaciones y su estado actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {asignaciones.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay asignaciones registradas
              </p>
            ) : (
              asignaciones.map((asignacion) => (
                <div key={asignacion.idAsignacion} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Período {asignacion.periodo}</h4>
                      <Badge variant="outline">{asignacion.areaNombre}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Responsable: {asignacion.nombreCompleto || asignacion.usuarioCorreo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {asignacion.fechaInicio} - {asignacion.fechaFin} | {asignacion.horaInicio} - {asignacion.horaFin}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={getBadgeVariant(asignacion.estado)}>
                      {asignacion.estado}
                    </Badge>
                    
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentEvaluations;
