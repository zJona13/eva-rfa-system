import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth, getToken } from '@/contexts/AuthContext';
import { FileText, Download, BarChart3, TrendingUp, AlertTriangle, Users, Calendar, Building2, Sparkles, Target, Award } from 'lucide-react';
import ReportTable from './components/ReportTable';
import { generatePDF } from './utils/pdfGenerator';

const API_BASE_URL = 'http://localhost:3309';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  endpoint: string;
  color: string;
  gradient: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'evaluaciones-aprobadas',
    title: 'Evaluaciones Aprobadas',
    description: 'Listado de evaluaciones con puntaje ≥ 11',
    icon: Award,
    endpoint: '/api/reportes/evaluaciones-aprobadas',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-green-600'
  },
  {
    id: 'evaluaciones-desaprobadas',
    title: 'Evaluaciones Desaprobadas',
    description: 'Listado de evaluaciones con puntaje < 11',
    icon: AlertTriangle,
    endpoint: '/api/reportes/evaluaciones-desaprobadas',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    gradient: 'from-red-500 to-rose-600'
  },
  {
    id: 'evaluados-con-incidencias',
    title: 'Evaluados con Incidencias',
    description: 'Personal que tiene incidencias registradas',
    icon: AlertTriangle,
    endpoint: '/api/reportes/evaluados-con-incidencias',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'personal-de-baja',
    title: 'Personal de Baja',
    description: 'Colaboradores que ya no están activos',
    icon: Users,
    endpoint: '/api/reportes/personal-de-baja',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    gradient: 'from-gray-500 to-slate-600'
  },
  {
    id: 'personal-alta-calificacion',
    title: 'Personal con Alta Calificación',
    description: 'Colaboradores con promedio ≥ 15',
    icon: Target,
    endpoint: '/api/reportes/personal-alta-calificacion',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'evaluaciones-por-semestre',
    title: 'Evaluaciones por Semestre',
    description: 'Estadísticas de evaluaciones agrupadas por semestre',
    icon: Calendar,
    endpoint: '/api/reportes/evaluaciones-por-semestre',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    id: 'evaluaciones-por-area',
    title: 'Evaluaciones por Área',
    description: 'Estadísticas de evaluaciones agrupadas por tipo de colaborador',
    icon: Building2,
    endpoint: '/api/reportes/evaluaciones-por-area',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    gradient: 'from-indigo-500 to-blue-600'
  }
];

const fetchReportData = async (endpoint: string) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const Reports = () => {
  const { user } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedReport = reportTypes.find(report => report.id === selectedReportType);

  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['report', selectedReportType],
    queryFn: () => fetchReportData(selectedReport?.endpoint || ''),
    enabled: !!selectedReport,
    refetchInterval: 5000,
  });

  const handleGeneratePDF = async () => {
    if (!selectedReport || !reportData) {
      toast.error('No hay datos para generar el PDF');
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDF(selectedReport, reportData);
      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  // Verificar si el usuario puede ver reportes (solo evaluadores y administradores)
  const canViewReports = () => {
    if (!user?.role) return false;
    const userRole = user.role.toLowerCase();
    const allowedRoles = ['evaluador', 'administrador', 'admin', 'evaluator'];
    return allowedRoles.includes(userRole);
  };

  // Filtrar reportTypes según el rol del usuario
  const getVisibleReportTypes = () => {
    if (!user?.role) return [];
    const userRole = user.role.toLowerCase();
    if (userRole === 'admin' || userRole === 'administrador') {
      return reportTypes;
    }
    // Si es evaluador, ocultar 'evaluaciones-por-area'
    return reportTypes.filter(r => r.id !== 'evaluaciones-por-area');
  };

  const visibleReportTypes = getVisibleReportTypes();

  if (!canViewReports()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl border-red-200 dark:border-red-800/50 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Acceso Restringido</h3>
                <p className="text-muted-foreground mt-2">Solo evaluadores y administradores pueden ver los reportes.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950/20 dark:via-background dark:to-blue-950/20">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Reportes del Sistema
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Genere y descargue reportes detallados del sistema de evaluaciones
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">Análisis Avanzado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Selector de tipo de reporte */}
        <Card className="shadow-xl border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Seleccionar Tipo de Reporte
                </CardTitle>
                <CardDescription className="text-base">
                  Elija el tipo de reporte que desea generar y analizar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleReportTypes.map((report) => {
                const IconComponent = report.icon;
                const isSelected = selectedReportType === report.id;
                return (
                  <Card
                    key={report.id}
                    className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 ${
                      isSelected 
                        ? 'ring-2 ring-primary shadow-xl scale-105 border-primary/50' 
                        : 'border-border/30 hover:border-primary/30'
                    } bg-white/50 dark:bg-card/50 backdrop-blur-sm`}
                    onClick={() => setSelectedReportType(report.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${report.gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <Badge className={`${report.color} border font-medium transition-all ${isSelected ? 'scale-110' : ''}`}>
                          {isSelected ? 'Seleccionado' : 'Disponible'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {report.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Datos del reporte seleccionado */}
        {selectedReport && (
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedReport.gradient} text-white shadow-lg`}>
                    <selectedReport.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                      {selectedReport.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {selectedReport.description}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={handleGeneratePDF}
                  disabled={isLoading || !reportData || isGenerating}
                  className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Download className="h-5 w-5" />
                  {isGenerating ? 'Generando...' : 'Descargar PDF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary mx-auto"></div>
                      <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-primary/20 mx-auto"></div>
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">Cargando datos del reporte...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Error al cargar los datos</h3>
                  <p className="text-red-600 dark:text-red-400">No se pudieron obtener los datos del reporte</p>
                </div>
              ) : reportData ? (
                <div className="bg-muted/30 rounded-xl p-6 border border-border/30">
                  <ReportTable reportType={selectedReport.id} data={reportData} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
