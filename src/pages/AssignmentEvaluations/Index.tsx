import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Search, Filter, TrendingUp, Users, GraduationCap, UserCheck, Eye, FileText, BarChart3, PieChart } from 'lucide-react';
import { toast } from 'sonner';

interface Evaluation {
  id: string;
  type: 'autoevaluacion' | 'supervision' | 'estudiante';
  title: string;
  evaluator: string;
  area: string;
  period: string;
  startDate: string;
  endDate: string;
  status: 'Activo' | 'Completada' | 'Pendiente' | 'Cancelada';
  score?: number;
  timeRange: string;
}

const mockEvaluations: Evaluation[] = [
  {
    id: '1',
    type: 'autoevaluacion',
    title: 'Autoevaluación',
    evaluator: 'María Ysabel Arangurí García',
    area: 'Administración de Empresas',
    period: '2024-01',
    startDate: '15/06/25',
    endDate: '17/06/25',
    status: 'Activo',
    timeRange: '00:20:00 - 00:20:00'
  },
  {
    id: '2',
    type: 'supervision',
    title: 'Supervisión Docente',
    evaluator: 'Dr. Carlos Mendoza',
    area: 'Ingeniería de Sistemas',
    period: '2024-01',
    startDate: '10/06/25',
    endDate: '15/06/25',
    status: 'Completada',
    score: 88,
    timeRange: '08:00:00 - 18:00:00'
  },
  {
    id: '3',
    type: 'estudiante',
    title: 'Evaluación Estudiante',
    evaluator: 'Estudiantes de Aula 401',
    area: 'Matemáticas',
    period: '2024-01',
    startDate: '05/06/25',
    endDate: '12/06/25',
    status: 'Completada',
    score: 92,
    timeRange: '14:00:00 - 16:00:00'
  },
  {
    id: '4',
    type: 'autoevaluacion',
    title: 'Autoevaluación',
    evaluator: 'Ana Lucía Martínez',
    area: 'Psicología',
    period: '2023-02',
    startDate: '20/12/24',
    endDate: '25/12/24',
    status: 'Pendiente',
    timeRange: '09:00:00 - 17:00:00'
  },
  {
    id: '5',
    type: 'supervision',
    title: 'Supervisión Docente',
    evaluator: 'Mg. Roberto Silva',
    area: 'Derecho',
    period: '2023-02',
    startDate: '15/12/24',
    endDate: '20/12/24',
    status: 'Cancelada',
    timeRange: '10:00:00 - 12:00:00'
  }
];

const AssignmentEvaluations = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations);
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>(mockEvaluations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  useEffect(() => {
    let filtered = evaluations;

    if (searchTerm) {
      filtered = filtered.filter(evaluation => 
        evaluation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.evaluator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.type === typeFilter);
    }

    if (periodFilter !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.period === periodFilter);
    }

    setFilteredEvaluations(filtered);
  }, [searchTerm, statusFilter, typeFilter, periodFilter, evaluations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-blue-500';
      case 'Completada': return 'bg-green-500';
      case 'Pendiente': return 'bg-yellow-500';
      case 'Cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'autoevaluacion': return <UserCheck className="h-5 w-5" />;
      case 'supervision': return <Users className="h-5 w-5" />;
      case 'estudiante': return <GraduationCap className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'autoevaluacion': return 'from-purple-500 to-purple-600';
      case 'supervision': return 'from-green-500 to-green-600';
      case 'estudiante': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const stats = {
    total: evaluations.length,
    completed: evaluations.filter(e => e.status === 'Completada').length,
    active: evaluations.filter(e => e.status === 'Activo').length,
    pending: evaluations.filter(e => e.status === 'Pendiente').length,
    avgScore: evaluations.filter(e => e.score).reduce((acc, e) => acc + (e.score || 0), 0) / evaluations.filter(e => e.score).length || 0
  };

  const periods = [...new Set(evaluations.map(e => e.period))];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Historial de Evaluaciones
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Gestiona y revisa todas tus evaluaciones asignadas
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Ver Estadísticas
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <PieChart className="h-4 w-4" />
              Generar Reporte
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold text-primary">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activas</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Promedio</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.avgScore.toFixed(1)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar evaluaciones..."
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
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="autoevaluacion">Autoevaluación</SelectItem>
                <SelectItem value="supervision">Supervisión</SelectItem>
                <SelectItem value="estudiante">Estudiante</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los periodos</SelectItem>
                {periods.map(period => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
                setPeriodFilter('all');
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvaluations.map((evaluation) => (
          <Card key={evaluation.id} className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-full bg-gradient-to-r ${getTypeColor(evaluation.type)}`}>
                  <div className="text-white">
                    {getTypeIcon(evaluation.type)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getStatusColor(evaluation.status)} text-white border-0`}>
                    {evaluation.status}
                  </Badge>
                  <Badge variant="secondary">
                    {evaluation.period}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {evaluation.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  Evaluación asignada para el periodo académico
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{evaluation.evaluator}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{evaluation.area}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{evaluation.startDate} - {evaluation.endDate}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{evaluation.timeRange}</span>
                </div>
              </div>

              {evaluation.score && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Puntuación:</span>
                    <span className="text-lg font-bold text-primary">{evaluation.score}%</span>
                  </div>
                  <Progress value={evaluation.score} className="h-2" />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {evaluation.status === 'Activo' && (
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    onClick={() => toast.info('Iniciando evaluación...')}
                  >
                    Iniciar Evaluación
                  </Button>
                )}
                
                {evaluation.status === 'Completada' && (
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={() => toast.info('Mostrando resultados...')}
                  >
                    <Eye className="h-4 w-4" />
                    Ver Resultados
                  </Button>
                )}
                
                {evaluation.status === 'Pendiente' && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    disabled
                  >
                    En Espera
                  </Button>
                )}
                
                {evaluation.status === 'Cancelada' && (
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    disabled
                  >
                    Cancelada
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvaluations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No se encontraron evaluaciones</h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setPeriodFilter('all');
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentEvaluations;
