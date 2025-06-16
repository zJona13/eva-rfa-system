const { pool } = require('../utils/dbConnection.cjs');

// Reporte de evaluaciones aprobadas (≥ 11)
const getEvaluacionesAprobadas = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion, e.fechaEvaluacion as fecha, e.puntajeTotal as puntaje, e.estado, 
        CONCAT(ce.nombreColaborador, ' ', ce.apePaColaborador, ' ', ce.apeMaColaborador) as evaluadoNombre,
        CONCAT(cr.nombreColaborador, ' ', cr.apePaColaborador, ' ', cr.apeMaColaborador) as evaluadorNombre,
        te.nombre as tipo, tc.nombre as rolEvaluado
      FROM EVALUACION e
      JOIN USUARIO ue ON e.idEvaluado = ue.idUsuario
      LEFT JOIN COLABORADOR ce ON ue.idColaborador = ce.idColaborador
      JOIN USUARIO ur ON e.idEvaluador = ur.idUsuario
      LEFT JOIN COLABORADOR cr ON ur.idColaborador = cr.idColaborador
      JOIN TIPO_EVALUACION te ON e.idTipoEvaluacion = te.idTipoEvaluacion
      LEFT JOIN TIPO_COLABORADOR tc ON ce.idTipoColaborador = tc.idTipoColaborador
      WHERE e.puntajeTotal >= 11
      ORDER BY e.fechaEvaluacion DESC`
    );
    return { success: true, evaluaciones: rows };
  } catch (error) {
    console.error('Error al obtener evaluaciones aprobadas:', error);
    return { success: false, message: 'Error al obtener las evaluaciones aprobadas' };
  }
};

// Reporte de evaluaciones desaprobadas (< 11)
const getEvaluacionesDesaprobadas = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion, e.fechaEvaluacion as fecha, e.puntajeTotal as puntaje, e.estado, 
        CONCAT(ce.nombreColaborador, ' ', ce.apePaColaborador, ' ', ce.apeMaColaborador) as evaluadoNombre,
        CONCAT(cr.nombreColaborador, ' ', cr.apePaColaborador, ' ', cr.apeMaColaborador) as evaluadorNombre,
        te.nombre as tipo, tc.nombre as rolEvaluado
      FROM EVALUACION e
      JOIN USUARIO ue ON e.idEvaluado = ue.idUsuario
      LEFT JOIN COLABORADOR ce ON ue.idColaborador = ce.idColaborador
      JOIN USUARIO ur ON e.idEvaluador = ur.idUsuario
      LEFT JOIN COLABORADOR cr ON ur.idColaborador = cr.idColaborador
      JOIN TIPO_EVALUACION te ON e.idTipoEvaluacion = te.idTipoEvaluacion
      LEFT JOIN TIPO_COLABORADOR tc ON ce.idTipoColaborador = tc.idTipoColaborador
      WHERE e.puntajeTotal < 11
      ORDER BY e.fechaEvaluacion DESC`
    );
    return { success: true, evaluaciones: rows };
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
      CONCAT(ca.nombreColaborador, ' ', ca.apePaColaborador, ' ', ca.apeMaColaborador) as evaluadoNombre,
      ca.idColaborador as evaluadoId,
      tc.nombre as rolEvaluado,
      COUNT(i.idIncidencia) as totalIncidencias,
      GROUP_CONCAT(i.descripcion SEPARATOR '; ') as descripcionesIncidencias,
      MAX(i.fecha) as ultimaIncidencia
      FROM INCIDENCIA i
      JOIN USUARIO ua ON i.idUsuarioAfectado = ua.idUsuario
      JOIN COLABORADOR ca ON ua.idColaborador = ca.idColaborador
      JOIN TIPO_COLABORADOR tc ON ca.idTipoColaborador = tc.idTipoColaborador
      GROUP BY ca.idColaborador, ca.nombreColaborador, ca.apePaColaborador, ca.apeMaColaborador, tc.nombre
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

// Reporte de personal de baja (estado = 'Inactivo')
const getPersonalDeBaja = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.idColaborador as id,
      CONCAT(c.nombreColaborador, ' ', c.apePaColaborador, ' ', c.apeMaColaborador) as nombreCompleto,
      c.dniColaborador, c.telefono, c.direccion,
      tc.nombre as tipoColaborador,
      cont.fechaInicio, cont.fechaFin,
      tcont.nombre as tipoContrato
      FROM COLABORADOR c
      JOIN TIPO_COLABORADOR tc ON c.idTipoColaborador = tc.idTipoColaborador
      LEFT JOIN CONTRATO cont ON c.idContrato = cont.idContrato
      LEFT JOIN TIPO_CONTRATO tcont ON cont.idTipoContrato = tcont.idTipoContrato
      WHERE c.estado = 'Inactivo'
      ORDER BY c.nombreColaborador, c.apePaColaborador`
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
      CONCAT(c.nombreColaborador, ' ', c.apePaColaborador, ' ', c.apeMaColaborador) as nombreCompleto,
      c.idColaborador as id,
      tc.nombre as tipoColaborador,
      AVG(e.puntajeTotal) as promedioCalificacion,
      COUNT(e.idEvaluacion) as totalEvaluaciones,
      MAX(e.puntajeTotal) as mejorCalificacion,
      MIN(e.puntajeTotal) as peorCalificacion
      FROM COLABORADOR c
      JOIN TIPO_COLABORADOR tc ON c.idTipoColaborador = tc.idTipoColaborador
      JOIN USUARIO u ON c.idColaborador = u.idColaborador
      JOIN EVALUACION e ON u.idUsuario = e.idEvaluado
      WHERE c.estado = 'Activo'
      GROUP BY c.idColaborador, c.nombreColaborador, c.apePaColaborador, c.apeMaColaborador, tc.nombre
      HAVING AVG(e.puntajeTotal) >= 15
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
        a.periodo,
        LEFT(a.periodo, 4) AS año,
        RIGHT(a.periodo, 2) AS semestre,
        te.nombre as tipoEvaluacion,
        COUNT(e.idEvaluacion) as totalEvaluaciones,
        AVG(e.puntajeTotal) as promedioGeneral,
        SUM(CASE WHEN e.puntajeTotal >= 11 THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN e.puntajeTotal < 11 THEN 1 ELSE 0 END) as desaprobadas
      FROM EVALUACION e
      JOIN ASIGNACION a ON e.idAsignacion = a.idAsignacion
      JOIN TIPO_EVALUACION te ON e.idTipoEvaluacion = te.idTipoEvaluacion
      GROUP BY a.periodo, año, semestre, te.nombre
      ORDER BY a.periodo DESC, te.nombre`
    );
    // Formatear semestre a 1 o 2
    const result = rows.map(r => ({
      ...r,
      semestre: r.semestre === '01' ? '1' : (r.semestre === '02' ? '2' : r.semestre)
    }));
    return { success: true, evaluaciones: result };
  } catch (error) {
    console.error('Error al obtener evaluaciones por semestre:', error);
    return { success: false, message: 'Error al obtener las evaluaciones por semestre' };
  }
};

// Reporte de evaluaciones por área (área real, no tipo de colaborador)
const getEvaluacionesPorArea = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        a.idArea,
        ar.nombre as area,
        COUNT(e.idEvaluacion) as totalEvaluaciones,
        AVG(e.puntajeTotal) as promedioArea,
        SUM(CASE WHEN e.puntajeTotal >= 11 THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN e.puntajeTotal < 11 THEN 1 ELSE 0 END) as desaprobadas,
        MAX(e.puntajeTotal) as mejorCalificacion,
        COUNT(DISTINCT c.idColaborador) as totalColaboradores
      FROM EVALUACION e
      JOIN ASIGNACION a ON e.idAsignacion = a.idAsignacion
      JOIN AREA ar ON a.idArea = ar.idArea
      LEFT JOIN USUARIO u ON e.idEvaluado = u.idUsuario
      LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
      GROUP BY a.idArea, ar.nombre
      ORDER BY totalEvaluaciones DESC`
    );
    return { success: true, evaluaciones: rows };
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
