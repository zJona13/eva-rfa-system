
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ReportTableProps {
  reportType: string;
  data: any;
}

const ReportTable: React.FC<ReportTableProps> = ({ reportType, data }) => {
  const renderEvaluacionesTable = (evaluaciones: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Evaluado</TableHead>
          <TableHead>Evaluador</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Puntaje</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Rol</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluaciones.map((evaluacion: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{new Date(evaluacion.fecha).toLocaleDateString()}</TableCell>
            <TableCell>{evaluacion.evaluadoNombre}</TableCell>
            <TableCell>{evaluacion.evaluadorNombre}</TableCell>
            <TableCell>{evaluacion.tipo}</TableCell>
            <TableCell>
              <Badge className={evaluacion.puntaje >= 11 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {evaluacion.puntaje}/20
              </Badge>
            </TableCell>
            <TableCell>{evaluacion.estado}</TableCell>
            <TableCell>{evaluacion.rolEvaluado}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderIncidenciasTable = (evaluados: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evaluado</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Total Incidencias</TableHead>
          <TableHead>Última Incidencia</TableHead>
          <TableHead>Descripciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluados.map((evaluado: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{evaluado.evaluadoNombre}</TableCell>
            <TableCell>{evaluado.rolEvaluado}</TableCell>
            <TableCell>
              <Badge className="bg-orange-100 text-orange-800">
                {evaluado.totalIncidencias}
              </Badge>
            </TableCell>
            <TableCell>{new Date(evaluado.ultimaIncidencia).toLocaleDateString()}</TableCell>
            <TableCell className="max-w-xs truncate" title={evaluado.descripcionesIncidencias}>
              {evaluado.descripcionesIncidencias}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderPersonalBajaTable = (personal: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre Completo</TableHead>
          <TableHead>DNI</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Tipo Contrato</TableHead>
          <TableHead>Fecha Fin Contrato</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personal.map((persona: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{persona.nombreCompleto}</TableCell>
            <TableCell>{persona.dni}</TableCell>
            <TableCell>{persona.tipoColaborador}</TableCell>
            <TableCell>{persona.telefono}</TableCell>
            <TableCell>{persona.tipoContrato || 'N/A'}</TableCell>
            <TableCell>{persona.fechaFin ? new Date(persona.fechaFin).toLocaleDateString() : 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderAltaCalificacionTable = (personal: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre Completo</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Promedio</TableHead>
          <TableHead>Total Evaluaciones</TableHead>
          <TableHead>Mejor Calificación</TableHead>
          <TableHead>Peor Calificación</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personal.map((persona: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{persona.nombreCompleto}</TableCell>
            <TableCell>{persona.tipoColaborador}</TableCell>
            <TableCell>
              <Badge className="bg-blue-100 text-blue-800">
                {parseFloat(persona.promedioCalificacion).toFixed(2)}
              </Badge>
            </TableCell>
            <TableCell>{persona.totalEvaluaciones}</TableCell>
            <TableCell>{persona.mejorCalificacion}</TableCell>
            <TableCell>{persona.peorCalificacion}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderSemestreTable = (evaluaciones: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Año</TableHead>
          <TableHead>Semestre</TableHead>
          <TableHead>Tipo Evaluación</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Promedio</TableHead>
          <TableHead>Aprobadas</TableHead>
          <TableHead>Desaprobadas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluaciones.map((evaluacion: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{evaluacion.año}</TableCell>
            <TableCell>{evaluacion.semestre}</TableCell>
            <TableCell>{evaluacion.tipoEvaluacion}</TableCell>
            <TableCell>{evaluacion.totalEvaluaciones}</TableCell>
            <TableCell>
              <Badge className="bg-purple-100 text-purple-800">
                {parseFloat(evaluacion.promedioGeneral).toFixed(2)}
              </Badge>
            </TableCell>
            <TableCell className="text-green-600">{evaluacion.aprobadas}</TableCell>
            <TableCell className="text-red-600">{evaluacion.desaprobadas}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderAreaTable = (evaluaciones: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Área</TableHead>
          <TableHead>Total Evaluaciones</TableHead>
          <TableHead>Promedio Área</TableHead>
          <TableHead>Aprobadas</TableHead>
          <TableHead>Desaprobadas</TableHead>
          <TableHead>Mejor Calificación</TableHead>
          <TableHead>Total Colaboradores</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluaciones.map((evaluacion: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{evaluacion.area}</TableCell>
            <TableCell>{evaluacion.totalEvaluaciones}</TableCell>
            <TableCell>
              <Badge className="bg-indigo-100 text-indigo-800">
                {parseFloat(evaluacion.promedioArea).toFixed(2)}
              </Badge>
            </TableCell>
            <TableCell className="text-green-600">{evaluacion.aprobadas}</TableCell>
            <TableCell className="text-red-600">{evaluacion.desaprobadas}</TableCell>
            <TableCell>{evaluacion.mejorCalificacion}</TableCell>
            <TableCell>{evaluacion.totalColaboradores}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
        return <p>Tipo de reporte no reconocido</p>;
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Total de registros: {getDataLength()}
        </p>
      </div>
      
      {getDataLength() === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay datos disponibles para este reporte</p>
        </div>
      ) : (
        <div className="border rounded-md">
          {getTableContent()}
        </div>
      )}
    </div>
  );
};

export default ReportTable;
