const { pool } = require('../utils/dbConnection.cjs');

// Reporte de evaluaciones aprobadas (≥ 11)
const getEvaluacionesAprobadas = async () => {
  // Función vacía temporalmente
};

// Reporte de evaluaciones desaprobadas (< 11)
const getEvaluacionesDesaprobadas = async () => {
  // Función vacía temporalmente
};

// Reporte de evaluados con incidencias
const getEvaluadosConIncidencias = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT DISTINCT 
      CONCAT(ca.nombres, ' ', ca.apePat, ' ', ca.apeMat) as evaluadoNombre,
      ca.idColaborador as evaluadoId,
      tc.nombre as rolEvaluado,
      COUNT(i.idIncidencia) as totalIncidencias,
      GROUP_CONCAT(i.descripcion SEPARATOR '; ') as descripcionesIncidencias,
      MAX(i.fechaIncidencia) as ultimaIncidencia
      FROM INCIDENCIA i
      JOIN USUARIO ua ON i.idUsuarioAfectado = ua.idUsuario
      JOIN COLABORADOR ca ON ua.idColaborador = ca.idColaborador
      JOIN TIPO_COLABORADOR tc ON ca.idTipoColab = tc.idTipoColab
      GROUP BY ca.idColaborador, ca.nombres, ca.apePat, ca.apeMat, tc.nombre
      ORDER BY totalIncidencias DESC, ultimaIncidencia DESC`
    );
    
    return {
      success: true,
      evaluados: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluados con incidencias:', error);
    return { success: false, message: 'Error al obtener los evaluados con incidencias' };
  }
};

// Reporte de personal de baja (estado = 0) - CORREGIDO
const getPersonalDeBaja = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.idColaborador as id,
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as nombreCompleto,
      c.dni, c.telefono, c.direccion,
      tc.nombre as tipoColaborador,
      cont.fechaInicio, cont.fechaFin,
      tcont.nombre as tipoContrato
      FROM COLABORADOR c
      JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
      LEFT JOIN CONTRATO cont ON c.idContrato = cont.idContrato
      LEFT JOIN TIPO_CONTRATO tcont ON cont.idTipoContrato = tcont.idTipoContrato
      WHERE c.estado = 0
      ORDER BY c.nombres, c.apePat`
    );
    
    return {
      success: true,
      personal: rows
    };
  } catch (error) {
    console.error('Error al obtener personal de baja:', error);
    return { success: false, message: 'Error al obtener el personal de baja' };
  }
};

// Reporte de personal con más alta calificación
const getPersonalAltaCalificacion = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as nombreCompleto,
      c.idColaborador as id,
      tc.nombre as tipoColaborador,
      AVG(e.puntaje) as promedioCalificacion,
      COUNT(e.idEvaluacion) as totalEvaluaciones,
      MAX(e.puntaje) as mejorCalificacion,
      MIN(e.puntaje) as peorCalificacion
      FROM COLABORADOR c
      JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
      JOIN EVALUACION e ON c.idColaborador = e.idColaborador
      WHERE c.estado = 1
      GROUP BY c.idColaborador, c.nombres, c.apePat, c.apeMat, tc.nombre
      HAVING AVG(e.puntaje) >= 15
      ORDER BY promedioCalificacion DESC, totalEvaluaciones DESC`
    );
    
    return {
      success: true,
      personal: rows
    };
  } catch (error) {
    console.error('Error al obtener personal con alta calificación:', error);
    return { success: false, message: 'Error al obtener el personal con alta calificación' };
  }
};

// Reporte de evaluaciones por semestre
const getEvaluacionesPorSemestre = async () => {
  // Función vacía temporalmente
};

// Reporte de evaluaciones por área (área real, no tipo de colaborador)
const getEvaluacionesPorArea = async () => {
  // Función vacía temporalmente
};

module.exports = {
  getEvaluacionesAprobadas,
  getEvaluacionesDesaprobadas,
  getEvaluadosConIncidencias,
  getPersonalDeBaja,
  getPersonalAltaCalificacion,
  getEvaluacionesPorSemestre,
  getEvaluacionesPorArea
};
