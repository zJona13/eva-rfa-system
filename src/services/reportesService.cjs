
const { pool } = require('../utils/dbConnection.cjs');

// Reporte de evaluaciones aprobadas (≥ 11)
const getEvaluacionesAprobadas = async () => {
  try {
    console.log('Ejecutando consulta para evaluaciones aprobadas...');
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion as id, e.fechaEvaluacion as fecha, 
      e.horaEvaluacion as hora, e.puntaje as puntaje, e.comentario as comentarios,
      e.tipo as tipo, e.estado as estado,
      u.nombre as evaluadorNombre,
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as evaluadoNombre,
      tc.nombre as rolEvaluado
      FROM EVALUACION e
      JOIN USUARIO u ON e.idUsuario = u.idUsuario
      JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
      JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
      WHERE e.puntaje >= 11
      ORDER BY e.fechaEvaluacion DESC, e.puntaje DESC`
    );
    
    console.log(`Evaluaciones aprobadas encontradas: ${rows.length}`);
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones aprobadas:', error);
    return { success: false, message: 'Error al obtener las evaluaciones aprobadas' };
  }
};

// Reporte de evaluaciones desaprobadas (< 11)
const getEvaluacionesDesaprobadas = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion as id, e.fechaEvaluacion as fecha, 
      e.horaEvaluacion as hora, e.puntaje as puntaje, e.comentario as comentarios,
      e.tipo as tipo, e.estado as estado,
      u.nombre as evaluadorNombre,
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as evaluadoNombre,
      tc.nombre as rolEvaluado
      FROM EVALUACION e
      JOIN USUARIO u ON e.idUsuario = u.idUsuario
      JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
      JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
      WHERE e.puntaje < 11
      ORDER BY e.fechaEvaluacion DESC, e.puntaje ASC`
    );
    
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones desaprobadas:', error);
    return { success: false, message: 'Error al obtener las evaluaciones desaprobadas' };
  }
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

// Reporte de personal de baja (estado = 0)
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
      LEFT JOIN CONTRATO cont ON c.idColaborador = cont.idColaborador
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
  try {
    const [rows] = await pool.execute(
      `SELECT 
      YEAR(e.fechaEvaluacion) as año,
      CASE 
        WHEN MONTH(e.fechaEvaluacion) BETWEEN 1 AND 6 THEN 'I'
        ELSE 'II'
      END as semestre,
      COUNT(e.idEvaluacion) as totalEvaluaciones,
      AVG(e.puntaje) as promedioGeneral,
      COUNT(CASE WHEN e.puntaje >= 11 THEN 1 END) as aprobadas,
      COUNT(CASE WHEN e.puntaje < 11 THEN 1 END) as desaprobadas,
      e.tipo as tipoEvaluacion
      FROM EVALUACION e
      GROUP BY YEAR(e.fechaEvaluacion), 
               CASE WHEN MONTH(e.fechaEvaluacion) BETWEEN 1 AND 6 THEN 'I' ELSE 'II' END,
               e.tipo
      ORDER BY año DESC, semestre DESC, tipoEvaluacion`
    );
    
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones por semestre:', error);
    return { success: false, message: 'Error al obtener las evaluaciones por semestre' };
  }
};

// Reporte de evaluaciones por área (tipo de colaborador)
const getEvaluacionesPorArea = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
      tc.nombre as area,
      COUNT(e.idEvaluacion) as totalEvaluaciones,
      AVG(e.puntaje) as promedioArea,
      COUNT(CASE WHEN e.puntaje >= 11 THEN 1 END) as aprobadas,
      COUNT(CASE WHEN e.puntaje < 11 THEN 1 END) as desaprobadas,
      MAX(e.puntaje) as mejorCalificacion,
      MIN(e.puntaje) as peorCalificacion,
      COUNT(DISTINCT c.idColaborador) as totalColaboradores
      FROM EVALUACION e
      JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
      JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
      GROUP BY tc.idTipoColab, tc.nombre
      ORDER BY promedioArea DESC, totalEvaluaciones DESC`
    );
    
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones por área:', error);
    return { success: false, message: 'Error al obtener las evaluaciones por área' };
  }
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
