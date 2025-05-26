
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

interface ReportType {
  id: string;
  title: string;
  description: string;
}

export const generatePDF = async (reportType: ReportType, data: any) => {
  const doc = new jsPDF();
  
  // Configuración de fuentes y colores
  doc.setFontSize(16);
  doc.setTextColor(40);
  
  // Título del reporte
  doc.text('IESRFA - Sistema de Evaluaciones', 20, 20);
  doc.setFontSize(14);
  doc.text(reportType.title, 20, 30);
  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 40);
  doc.text(reportType.description, 20, 45);
  
  let startY = 55;

  switch (reportType.id) {
    case 'evaluaciones-aprobadas':
    case 'evaluaciones-desaprobadas':
      generateEvaluacionesTable(doc, data.evaluaciones || [], startY);
      break;
    case 'evaluados-con-incidencias':
      generateIncidenciasTable(doc, data.evaluados || [], startY);
      break;
    case 'personal-de-baja':
      generatePersonalBajaTable(doc, data.personal || [], startY);
      break;
    case 'personal-alta-calificacion':
      generateAltaCalificacionTable(doc, data.personal || [], startY);
      break;
    case 'evaluaciones-por-semestre':
      generateSemestreTable(doc, data.evaluaciones || [], startY);
      break;
    case 'evaluaciones-por-area':
      generateAreaTable(doc, data.evaluaciones || [], startY);
      break;
  }

  // Descargar el PDF
  doc.save(`${reportType.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
};

const generateEvaluacionesTable = (doc: jsPDF, evaluaciones: any[], startY: number) => {
  const tableData = evaluaciones.map(evaluacion => [
    new Date(evaluacion.fecha).toLocaleDateString(),
    evaluacion.evaluadoNombre,
    evaluacion.evaluadorNombre,
    evaluacion.tipo,
    `${evaluacion.puntaje}/20`,
    evaluacion.estado,
    evaluacion.rolEvaluado
  ]);

  doc.autoTable({
    head: [['Fecha', 'Evaluado', 'Evaluador', 'Tipo', 'Puntaje', 'Estado', 'Rol']],
    body: tableData,
    startY: startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 122, 183] },
    columnStyles: {
      4: { halign: 'center' }
    }
  });
};

const generateIncidenciasTable = (doc: jsPDF, evaluados: any[], startY: number) => {
  const tableData = evaluados.map(evaluado => [
    evaluado.evaluadoNombre,
    evaluado.rolEvaluado,
    evaluado.totalIncidencias.toString(),
    new Date(evaluado.ultimaIncidencia).toLocaleDateString(),
    evaluado.descripcionesIncidencias.substring(0, 100) + '...'
  ]);

  doc.autoTable({
    head: [['Evaluado', 'Rol', 'Total Incidencias', 'Última Incidencia', 'Descripciones']],
    body: tableData,
    startY: startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 122, 183] },
    columnStyles: {
      2: { halign: 'center' }
    }
  });
};

const generatePersonalBajaTable = (doc: jsPDF, personal: any[], startY: number) => {
  const tableData = personal.map(persona => [
    persona.nombreCompleto,
    persona.dni,
    persona.tipoColaborador,
    persona.telefono || 'N/A',
    persona.tipoContrato || 'N/A',
    persona.fechaFin ? new Date(persona.fechaFin).toLocaleDateString() : 'N/A'
  ]);

  doc.autoTable({
    head: [['Nombre Completo', 'DNI', 'Tipo', 'Teléfono', 'Tipo Contrato', 'Fecha Fin']],
    body: tableData,
    startY: startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 122, 183] }
  });
};

const generateAltaCalificacionTable = (doc: jsPDF, personal: any[], startY: number) => {
  const tableData = personal.map(persona => [
    persona.nombreCompleto,
    persona.tipoColaborador,
    parseFloat(persona.promedioCalificacion).toFixed(2),
    persona.totalEvaluaciones.toString(),
    persona.mejorCalificacion.toString(),
    persona.peorCalificacion.toString()
  ]);

  doc.autoTable({
    head: [['Nombre Completo', 'Tipo', 'Promedio', 'Total Eval.', 'Mejor', 'Peor']],
    body: tableData,
    startY: startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 122, 183] },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' }
    }
  });
};

const generateSemestreTable = (doc: jsPDF, evaluaciones: any[], startY: number) => {
  const tableData = evaluaciones.map(evaluacion => [
    evaluacion.año.toString(),
    evaluacion.semestre,
    evaluacion.tipoEvaluacion,
    evaluacion.totalEvaluaciones.toString(),
    parseFloat(evaluacion.promedioGeneral).toFixed(2),
    evaluacion.aprobadas.toString(),
    evaluacion.desaprobadas.toString()
  ]);

  doc.autoTable({
    head: [['Año', 'Semestre', 'Tipo Evaluación', 'Total', 'Promedio', 'Aprobadas', 'Desaprobadas']],
    body: tableData,
    startY: startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 122, 183] },
    columnStyles: {
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' }
    }
  });
};

const generateAreaTable = (doc: jsPDF, evaluaciones: any[], startY: number) => {
  const tableData = evaluaciones.map(evaluacion => [
    evaluacion.area,
    evaluacion.totalEvaluaciones.toString(),
    parseFloat(evaluacion.promedioArea).toFixed(2),
    evaluacion.aprobadas.toString(),
    evaluacion.desaprobadas.toString(),
    evaluacion.mejorCalificacion.toString(),
    evaluacion.totalColaboradores.toString()
  ]);

  doc.autoTable({
    head: [['Área', 'Total Eval.', 'Promedio', 'Aprobadas', 'Desaprobadas', 'Mejor', 'Colaboradores']],
    body: tableData,
    startY: startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 122, 183] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' }
    }
  });
};
