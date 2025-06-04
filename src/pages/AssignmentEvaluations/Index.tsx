
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import AssignmentDialog from './components/AssignmentDialog';

const AssignmentEvaluations = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);

  // Mock data para mostrar la interfaz
  const mockAssignments = [
    {
      id: 1,
      title: 'Evaluación Semestral Docentes',
      type: 'Autoevaluación',
      startDate: '2024-01-15',
      endDate: '2024-01-30',
      status: 'Activa',
      assignedUsers: 15,
      completedUsers: 8
    },
    {
      id: 2,
      title: 'Evaluación Estudiante-Docente',
      type: 'Evaluación Estudiante',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      status: 'Pendiente',
      assignedUsers: 25,
      completedUsers: 0
    },
    {
      id: 3,
      title: 'Supervisión Académica',
      type: 'Lista de Cotejo',
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      status: 'Finalizada',
      assignedUsers: 10,
      completedUsers: 10
    }
  ];

  const handleEdit = (assignment: any) => {
    setEditingAssignment(assignment);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    toast.info('Funcionalidad de eliminar será implementada próximamente');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Activa':
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
      case 'Pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'Finalizada':
        return <Badge className="bg-gray-100 text-gray-800">Finalizada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Autoevaluación':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Autoevaluación</Badge>;
      case 'Evaluación Estudiante':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Evaluación Estudiante</Badge>;
      case 'Lista de Cotejo':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Lista de Cotejo</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asignación de Evaluaciones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona y asigna evaluaciones a usuarios específicos con fechas límite.
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Asignación
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Asignaciones</CardTitle>
            <CardDescription>
              Estado actual de las evaluaciones asignadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">Activas</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {mockAssignments.filter(a => a.status === 'Activa').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">Pendientes</span>
                </div>
                <p className="text-2xl font-bold text-yellow-900 mt-2">
                  {mockAssignments.filter(a => a.status === 'Pendiente').length}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Total Usuarios</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {mockAssignments.reduce((sum, a) => sum + a.assignedUsers, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Asignaciones</CardTitle>
            <CardDescription>
              Todas las evaluaciones asignadas y su progreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{assignment.title}</h3>
                      <div className="flex gap-2 mt-2">
                        {getTypeBadge(assignment.type)}
                        {getStatusBadge(assignment.status)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(assignment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fecha Inicio:</span>
                      <p className="font-medium">{new Date(assignment.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha Fin:</span>
                      <p className="font-medium">{new Date(assignment.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Usuarios Asignados:</span>
                      <p className="font-medium">{assignment.assignedUsers}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completados:</span>
                      <p className="font-medium">
                        {assignment.completedUsers}/{assignment.assignedUsers}
                        <span className="text-muted-foreground ml-1">
                          ({Math.round((assignment.completedUsers / assignment.assignedUsers) * 100)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AssignmentDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        assignment={editingAssignment}
        onClose={() => {
          setShowDialog(false);
          setEditingAssignment(null);
        }}
      />
    </div>
  );
};

export default AssignmentEvaluations;
