import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, Users, Calendar, Award } from 'lucide-react';

interface ReportTableProps {
  reportType: string;
  data: any;
}

const ReportTable: React.FC<ReportTableProps> = ({ reportType, data }) => {
  const renderEvaluacionesTable = (evaluaciones: any[]) => (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-background/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Fecha</TableHead>
            <TableHead className="font-semibold">Evaluado</TableHead>
            <TableHead className="font-semibold">Evaluador</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold text-center">Puntaje</TableHead>
            <TableHead className="font-semibold">Estado</TableHead>
            <TableHead className="font-semibold">Rol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluaciones.map((evaluacion: any, index: number) => (
            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">
                {new Date(evaluacion.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </TableCell>
              <TableCell>{evaluacion.evaluadoNombre}</TableCell>
              <TableCell>{evaluacion.evaluadorNombre}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-medium">
                  {evaluacion.tipo}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className={`font-bold ${evaluacion.puntaje >= 11 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                  {evaluacion.puntaje >= 11 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {evaluacion.puntaje}/20
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{evaluacion.estado}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{evaluacion.rolEvaluado}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderIncidenciasTable = (evaluados: any[]) => (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-background/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Evaluado</TableHead>
            <TableHead className="font-semibold">Rol</TableHead>
            <TableHead className="font-semibold text-center">Total Incidencias</TableHead>
            <TableHead className="font-semibold">Última Incidencia</TableHead>
            <TableHead className="font-semibold">Descripciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluados.map((evaluado: any, index: number) => (
            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{evaluado.evaluadoNombre}</TableCell>
              <TableCell>
                <Badge variant="outline">{evaluado.rolEvaluado}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 font-bold">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {evaluado.totalIncidencias}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(evaluado.ultimaIncidencia).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate" title={evaluado.descripcionesIncidencias}>
                  {evaluado.descripcionesIncidencias}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderPersonalBajaTable = (personal: any[]) => (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-background/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Nombre Completo</TableHead>
            <TableHead className="font-semibold">DNI</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Teléfono</TableHead>
            <TableHead className="font-semibold">Tipo Contrato</TableHead>
            <TableHead className="font-semibold">Fecha Fin Contrato</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {personal.map((persona: any, index: number) => (
            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{persona.nombreCompleto}</TableCell>
              <TableCell className="font-mono">{persona.dni}</TableCell>
              <TableCell>
                <Badge variant="outline">{persona.tipoColaborador}</Badge>
              </TableCell>
              <TableCell>{persona.telefono}</TableCell>
              <TableCell>
                <Badge variant="secondary">{persona.tipoContrato || 'N/A'}</Badge>
              </TableCell>
              <TableCell>
                {persona.fechaFin ? new Date(persona.fechaFin).toLocaleDateString('es-ES') : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderAltaCalificacionTable = (personal: any[]) => (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-background/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Nombre Completo</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold text-center">Promedio</TableHead>
            <TableHead className="font-semibold text-center">Total Evaluaciones</TableHead>
            <TableHead className="font-semibold text-center">Mejor Calificación</TableHead>
            <TableHead className="font-semibold text-center">Peor Calificación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {personal.map((persona: any, index: number) => (
            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{persona.nombreCompleto}</TableCell>
              <TableCell>
                <Badge variant="outline">{persona.tipoColaborador}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 font-bold">
                  <Award className="h-3 w-3 mr-1" />
                  {parseFloat(persona.promedioCalificacion).toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="font-medium">
                  {persona.totalEvaluaciones}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                  {persona.mejorCalificacion}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                  {persona.peorCalificacion}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderSemestreTable = (evaluaciones: any[]) => (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-background/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-center">Año</TableHead>
            <TableHead className="font-semibold text-center">Semestre</TableHead>
            <TableHead className="font-semibold">Tipo Evaluación</TableHead>
            <TableHead className="font-semibold text-center">Total</TableHead>
            <TableHead className="font-semibold text-center">Promedio</TableHead>
            <TableHead className="font-semibold text-center">Aprobadas</TableHead>
            <TableHead className="font-semibold text-center">Desaprobadas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluaciones.map((evaluacion: any, index: number) => (
            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
              <TableCell className="text-center font-bold">{evaluacion.año}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="font-medium">
                  <Calendar className="h-3 w-3 mr-1" />
                  {evaluacion.semestre}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{evaluacion.tipoEvaluacion}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="font-medium">
                  {evaluacion.totalEvaluaciones}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 font-bold">
                  {parseFloat(evaluacion.promedioGeneral).toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {evaluacion.aprobadas}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {evaluacion.desaprobadas}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderAreaTable = (evaluaciones: any[]) => (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-background/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Área</TableHead>
            <TableHead className="font-semibold text-center">Total Eval.</TableHead>
            <TableHead className="font-semibold text-center">Promedio</TableHead>
            <TableHead className="font-semibold text-center">Aprobadas</TableHead>
            <TableHead className="font-semibold text-center">Desaprobadas</TableHead>
            <TableHead className="font-semibold text-center">Mejor</TableHead>
            <TableHead className="font-semibold text-center">Colaboradores</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluaciones.map((evaluacion: any, index: number) => (
            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{evaluacion.area}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="font-medium">
                  {evaluacion.totalEvaluaciones}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800 font-bold">
                  {parseFloat(evaluacion.promedioArea).toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                  {evaluacion.aprobadas}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                  {evaluacion.desaprobadas}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                  <Award className="h-3 w-3 mr-1" />
                  {evaluacion.mejorCalificacion}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="font-medium">
                  <Users className="h-3 w-3 mr-1" />
                  {evaluacion.totalColaboradores}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const getTableContent = () => {
    switch (reportType) {
      case 'evaluaciones-aprobadas':
      case 'evaluaciones-desaprobadas':
        return renderEvaluacionesTable(data.evaluaciones || []);
      case 'evaluados-con-incidencias':
        return renderIncidenciasTable(data.evaluados || []);
      case 'personal-de-baja':
        return renderPersonalBajaTable(data.personal || []);
      case 'personal-alta-calificacion':
        return renderAltaCalificacionTable(data.personal || []);
      case 'evaluaciones-por-semestre':
        return renderSemestreTable(data.evaluaciones || []);
      case 'evaluaciones-por-area':
        return renderAreaTable(data.evaluaciones || []);
      default:
        return (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Tipo de reporte no reconocido</p>
            </CardContent>
          </Card>
        );
    }
  };

  const getDataLength = () => {
    switch (reportType) {
      case 'evaluaciones-aprobadas':
      case 'evaluaciones-desaprobadas':
      case 'evaluaciones-por-semestre':
      case 'evaluaciones-por-area':
        return data.evaluaciones?.length || 0;
      case 'evaluados-con-incidencias':
        return data.evaluados?.length || 0;
      case 'personal-de-baja':
      case 'personal-alta-calificacion':
        return data.personal?.length || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-muted/30 rounded-lg p-4 border border-border/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg text-white">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Registros encontrados</p>
            <p className="text-sm text-muted-foreground">
              Total de elementos en este reporte
            </p>
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 text-lg font-bold px-4 py-2">
          {getDataLength()}
        </Badge>
      </div>
      
      {getDataLength() === 0 ? (
        <Card className="shadow-xl border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">No hay datos disponibles</h3>
                <p className="text-muted-foreground mt-2">No se encontraron registros para este tipo de reporte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          {getTableContent()}
        </div>
      )}
    </div>
  );
};

export default ReportTable;
