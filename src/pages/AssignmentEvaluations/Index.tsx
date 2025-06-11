import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Plus, Calendar, Users, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { crearAsignacion, listarAsignaciones } from '@/services/asignacionApi';

const AssignmentEvaluations = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [areas, setAreas] = useState([]);
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

  // Cargar áreas y asignaciones
  useEffect(() => {
    fetch('/api/areas')
      .then(res => res.json())
      .then(data => setAreas(data.areas || []));
    cargarAsignaciones();
  }, []);

  const cargarAsignaciones = async () => {
    try {
      const data = await listarAsignaciones();
      setAsignaciones(data.asignaciones || []);
    } catch (e) {
      setError('Error al cargar asignaciones');
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
      // El idUsuario debe ser el admin actual, aquí lo ponemos fijo 1 (ajustar según auth real)
      const res = await crearAsignacion({ ...form, idUsuario: 1 });
      setModalOpen(false);
      setForm({ idArea: '', periodo: '', fechaInicio: '', fechaFin: '', horaInicio: '', horaFin: '' });
      cargarAsignaciones();
    } catch (e) {
      setError(e.message || 'Error al crear asignación');
    } finally {
      setLoading(false);
    }
  };

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
        <Button className="flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      {/* Modal Nueva Asignación */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Asignación</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select name="idArea" value={form.idArea} onValueChange={v => setForm(f => ({ ...f, idArea: v }))} required>
              <SelectTrigger placeholder="Selecciona un área" />
              <SelectContent>
                {areas.map(area => (
                  <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input name="periodo" value={form.periodo} onChange={handleInput} placeholder="Periodo (ej: 202401)" required />
            <Input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleInput} required />
            <Input name="fechaFin" type="date" value={form.fechaFin} onChange={handleInput} required />
            <Input name="horaInicio" type="time" value={form.horaInicio} onChange={handleInput} required />
            <Input name="horaFin" type="time" value={form.horaFin} onChange={handleInput} required />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear Asignación'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asignaciones</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asignaciones.length}</div>
            <p className="text-xs text-muted-foreground">Total registradas</p>
          </CardContent>
        </Card>
        {/* Puedes agregar más cards de stats aquí si lo deseas */}
      </div>

      {/* Assignment List */}
      <Card>
        <CardHeader>
          <CardTitle>Asignaciones Recientes</CardTitle>
          <CardDescription>
            Lista de evaluaciones asignadas y su estado actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {asignaciones.length === 0 && <div>No hay asignaciones registradas.</div>}
            {asignaciones.map(asignacion => (
              <div key={asignacion.idAsignacion} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{asignacion.areaNombre}</h4>
                    <Badge variant="outline">Periodo: {asignacion.periodo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fechas: {asignacion.fechaInicio} a {asignacion.fechaFin}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Horario: {asignacion.horaInicio} - {asignacion.horaFin}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant={asignacion.estado === 'Activo' ? 'secondary' : 'outline'}>
                      {asignacion.estado}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentEvaluations;
