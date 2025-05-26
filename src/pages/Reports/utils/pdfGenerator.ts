import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Definir el tipo correctamente
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
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
    evaluacion.evaluadoNombre || 'N/A',
    evaluacion.evaluadorNombre || 'N/A',
    evaluacion.tipo || 'N/A',
    `${evaluacion.puntaje || 0}/20`,
    evaluacion.estado || 'N/A',
    evaluacion.rolEvaluado || 'N/A'
  ]);

  autoTable(doc, {
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
    evaluado.evaluadoNombre || 'N/A',
    evaluado.rolEvaluado || 'N/A',
    (evaluado.totalIncidencias || 0).toString(),
    evaluado.ultimaIncidencia ? new Date(evaluado.ultimaIncidencia).toLocaleDateString() : 'N/A',
    (evaluado.descripcionesIncidencias || '').substring(0, 100) + '...'
  ]);

  autoTable(doc, {
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
    persona.nombreCompleto || 'N/A',
    persona.dni || 'N/A',
    persona.tipoColaborador || 'N/A',
    persona.telefono || 'N/A',
    persona.tipoContrato || 'N/A',
    persona.fechaFin ? new Date(persona.fechaFin).toLocaleDateString() : 'N/A'
  ]);

  autoTable(doc, {
    head: [['Nombre Completo', 'DNI', 'Tipo', 'Teléfono', 'Tipo Contrato', 'Fecha Fin']],
    body: tableData,
    startY: startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 122, 183] }
  });
};

const generateAltaCalificacionTable = (doc: jsPDF, personal: any[], startY: number) => {
  const tableData = personal.map(persona => [
    persona.nombreCompleto || 'N/A',
    persona.tipoColaborador || 'N/A',
    parseFloat(persona.promedioCalificacion || 0).toFixed(2),
    (persona.totalEvaluaciones || 0).toString(),
    (persona.mejorCalificacion || 0).toString(),
    (persona.peorCalificacion || 0).toString()
  ]);

  autoTable(doc, {
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
    (evaluacion.año || 0).toString(),
    evaluacion.semestre || 'N/A',
    evaluacion.tipoEvaluacion || 'N/A',
    (evaluacion.totalEvaluaciones || 0).toString(),
    parseFloat(evaluacion.promedioGeneral || 0).toFixed(2),
    (evaluacion.aprobadas || 0).toString(),
    (evaluacion.desaprobadas || 0).toString()
  ]);

  autoTable(doc, {
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
    evaluacion.area || 'N/A',
    (evaluacion.totalEvaluaciones || 0).toString(),
    parseFloat(evaluacion.promedioArea || 0).toFixed(2),
    (evaluacion.aprobadas || 0).toString(),
    (evaluacion.desaprobadas || 0).toString(),
    (evaluacion.mejorCalificacion || 0).toString(),
    (evaluacion.totalColaboradores || 0).toString()
  ]);

  autoTable(doc, {
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
