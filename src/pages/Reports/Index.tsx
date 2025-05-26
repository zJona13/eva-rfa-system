
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, BarChart3, TrendingUp, AlertTriangle, Users, Calendar, Building2 } from 'lucide-react';
import ReportTable from './components/ReportTable';
import { generatePDF } from './utils/pdfGenerator';
import { authenticatedFetch } from '@/utils/sessionUtils';

const API_BASE_URL = 'http://localhost:3306';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  endpoint: string;
  color: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'evaluaciones-aprobadas',
    title: 'Evaluaciones Aprobadas',
    description: 'Listado de evaluaciones con puntaje ≥ 11',
    icon: TrendingUp,
    endpoint: '/api/reportes/evaluaciones-aprobadas',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'evaluaciones-desaprobadas',
    title: 'Evaluaciones Desaprobadas',
    description: 'Listado de evaluaciones con puntaje < 11',
    icon: AlertTriangle,
    endpoint: '/api/reportes/evaluaciones-desaprobadas',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'evaluados-con-incidencias',
    title: 'Evaluados con Incidencias',
    description: 'Personal que tiene incidencias registradas',
    icon: AlertTriangle,
    endpoint: '/api/reportes/evaluados-con-incidencias',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'personal-de-baja',
    title: 'Personal de Baja',
    description: 'Colaboradores que ya no están activos',
    icon: Users,
    endpoint: '/api/reportes/personal-de-baja',
    color: 'bg-gray-100 text-gray-800'
  },
  {
    id: 'personal-alta-calificacion',
    title: 'Personal con Alta Calificación',
    description: 'Colaboradores con promedio ≥ 15',
    icon: TrendingUp,
    endpoint: '/api/reportes/personal-alta-calificacion',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'evaluaciones-por-semestre',
    title: 'Evaluaciones por Semestre',
    description: 'Estadísticas de evaluaciones agrupadas por semestre',
    icon: Calendar,
    endpoint: '/api/reportes/evaluaciones-por-semestre',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'evaluaciones-por-area',
    title: 'Evaluaciones por Área',
    description: 'Estadísticas de evaluaciones agrupadas por tipo de colaborador',
    icon: Building2,
    endpoint: '/api/reportes/evaluaciones-por-area',
    color: 'bg-indigo-100 text-indigo-800'
  }
];

const fetchReportData = async (endpoint: string) => {
  return authenticatedFetch(`${API_BASE_URL}${endpoint}`);
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

  if (!canViewReports()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes del Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Acceso denegado. Solo evaluadores y administradores pueden ver los reportes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes del Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Genere y descargue reportes detallados del sistema de evaluaciones.
          </p>
        </div>
      </div>

      {/* Selector de tipo de reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Seleccionar Tipo de Reporte
          </CardTitle>
          <CardDescription>
            Elija el tipo de reporte que desea generar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedReportType === report.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedReportType(report.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <Badge className={report.color}>
                        {report.id === selectedReportType ? 'Seleccionado' : 'Disponible'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-sm">{report.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Datos del reporte seleccionado */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedReport.title}
                </CardTitle>
                <CardDescription>{selectedReport.description}</CardDescription>
              </div>
              <Button 
                onClick={handleGeneratePDF}
                disabled={isLoading || !reportData || isGenerating}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isGenerating ? 'Generando...' : 'Descargar PDF'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error al cargar los datos del reporte</p>
              </div>
            ) : reportData ? (
              <ReportTable reportType={selectedReport.id} data={reportData} />
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
