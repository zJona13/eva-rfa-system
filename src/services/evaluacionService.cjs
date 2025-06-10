const { pool } = require('../utils/dbConnection.cjs');

// Obtener todas las evaluaciones con información relacionada
const getAllEvaluaciones = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion as id, e.fechaEvaluacion as date, 
      e.horaEvaluacion as time, e.puntaje as score, e.comentario as comments,
      e.tipo as type, e.estado as status,
      u.nombre as evaluatorName, 
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as evaluatedName,
      c.idColaborador as evaluatedId
      FROM EVALUACION e
      JOIN USUARIO u ON e.idUsuario = u.idUsuario
      JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
      ORDER BY e.fechaEvaluacion DESC`
    );
    
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    return { success: false, message: 'Error al obtener las evaluaciones' };
  }
};

// Obtener evaluaciones por usuario evaluador
const getEvaluacionesByEvaluador = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion as id, e.fechaEvaluacion as date, 
      e.horaEvaluacion as time, e.puntaje as score, e.comentario as comments,
      e.tipo as type, e.estado as status,
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as evaluatedName,
      c.idColaborador as evaluatedId
      FROM EVALUACION e
      JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
      WHERE e.idUsuario = ?
      ORDER BY e.fechaEvaluacion DESC`,
      [userId]
    );
    
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones por evaluador:', error);
    return { success: false, message: 'Error al obtener las evaluaciones' };
  }
};

// Obtener evaluaciones de un colaborador (para ver sus autoevaluaciones y evaluaciones recibidas)
const getEvaluacionesByColaborador = async (colaboradorId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion as id, e.fechaEvaluacion as date, 
      e.horaEvaluacion as time, e.puntaje as score, e.comentario as comments,
      e.tipo as type, e.estado as status,
      u.nombre as evaluatorName
      FROM EVALUACION e
      JOIN USUARIO u ON e.idUsuario = u.idUsuario
      WHERE e.idColaborador = ?
      ORDER BY e.fechaEvaluacion DESC`,
      [colaboradorId]
    );
    
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones por colaborador:', error);
    return { success: false, message: 'Error al obtener las evaluaciones' };
  }
};

// Crear una nueva evaluación con detalles de subcriterios
const createEvaluacion = async (evaluacionData) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Crear la evaluación principal
    const [evaluacionResult] = await conn.execute(
      'INSERT INTO EVALUACION (fechaEvaluacion, horaEvaluacion, puntajeTotal, comentario, estado, idAsignacion, idEvaluador, idEvaluado, idTipoEvaluacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        evaluacionData.date,
        evaluacionData.time,
        evaluacionData.score || 0,
        evaluacionData.comments || null,
        evaluacionData.status || 'Activo',
        evaluacionData.idAsignacion,
        evaluacionData.idEvaluador,
        evaluacionData.idEvaluado,
        evaluacionData.idTipoEvaluacion
      ]
    );
    const evaluacionId = evaluacionResult.insertId;
    // Insertar detalles de subcriterios
    if (Array.isArray(evaluacionData.detalles)) {
      for (const detalle of evaluacionData.detalles) {
        await conn.execute(
          'INSERT INTO DETALLE_EVALUACION (puntaje, idEvaluacion, idSubCriterio) VALUES (?, ?, ?)',
          [detalle.puntaje, evaluacionId, detalle.idSubCriterio]
        );
      }
    }
    await conn.commit();
    return {
      success: true,
      evaluacionId: evaluacionId,
      message: 'Evaluación creada exitosamente'
    };
  } catch (error) {
    await conn.rollback();
    console.error('Error al crear evaluación:', error);
    return { success: false, message: 'Error al crear la evaluación' };
  } finally {
    conn.release();
  }
};

// Actualizar una evaluación - SIMPLIFICADO
const updateEvaluacion = async (evaluacionId, evaluacionData) => {
  try {
    // Obtener la evaluación actual para validar la fecha
    const [rows] = await pool.execute('SELECT fechaEvaluacion, estado FROM EVALUACION WHERE idEvaluacion = ?', [evaluacionId]);
    if (rows.length === 0) {
      return { success: false, message: 'Evaluación no encontrada' };
    }
    const evaluacion = rows[0];
    // Solo restringir si está pendiente
    if (evaluacion.estado === 'Pendiente') {
      const fechaEvaluacion = new Date(evaluacion.fechaEvaluacion);
      const ahora = new Date();
      const diffMs = ahora - fechaEvaluacion;
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      if (diffDias > 2) {
        return { success: false, message: 'No se puede editar la evaluación porque han pasado más de 2 días desde su creación.' };
      }
    }
    // Actualizar solo la evaluación principal
    await pool.execute(
      'UPDATE EVALUACION SET fechaEvaluacion = ?, horaEvaluacion = ?, puntaje = ?, comentario = ?, tipo = ?, estado = ? WHERE idEvaluacion = ?',
      [
        evaluacionData.date,
        evaluacionData.time,
        evaluacionData.score,
        evaluacionData.comments,
        evaluacionData.type,
        evaluacionData.status,
        evaluacionId
      ]
    );
    // Llamar a la cancelación automática después de actualizar
    await cancelarBorradoresVencidos();
    return {
      success: true,
      message: 'Evaluación actualizada exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar evaluación:', error);
    return { success: false, message: 'Error al actualizar la evaluación' };
  }
};

// Eliminar una evaluación - SIMPLIFICADO
const deleteEvaluacion = async (evaluacionId) => {
  try {
    // Eliminar solo la evaluación
    await pool.execute('DELETE FROM EVALUACION WHERE idEvaluacion = ?', [evaluacionId]);
    
    return {
      success: true,
      message: 'Evaluación eliminada exitosamente'
    };
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    return { success: false, message: 'Error al eliminar la evaluación' };
  }
};

// Obtener colaboradores disponibles para evaluar con información completa
const getColaboradoresParaEvaluar = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.idColaborador as id, 
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as fullName,
      c.nombres, c.apePat, c.apeMat,
      tc.nombre as roleName
      FROM COLABORADOR c
      JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
      WHERE c.estado = 1
      ORDER BY c.nombres, c.apePat`
    );
    
    return {
      success: true,
      colaboradores: rows
    };
  } catch (error) {
    console.error('Error al obtener colaboradores para evaluar:', error);
    return { success: false, message: 'Error al obtener los colaboradores' };
  }
};

// Obtener información del colaborador por ID de usuario
const getColaboradorByUserId = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.idColaborador as id,
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as fullName,
      c.nombres, c.apePat, c.apeMat,
      tc.nombre as roleName
      FROM COLABORADOR c
      JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
      JOIN USUARIO u ON u.idColaborador = c.idColaborador
      WHERE u.idUsuario = ?`,
      [userId]
    );
    
    return {
      success: true,
      colaborador: rows[0] || null
    };
  } catch (error) {
    console.error('Error al obtener colaborador por user ID:', error);
    return { success: false, message: 'Error al obtener la información del colaborador' };
  }
};

// Finalizar una evaluación (cambiar estado a Completada)
const finalizarEvaluacion = async (evaluacionId) => {
  try {
    // Obtener la evaluación actual para validar la fecha
    const [rows] = await pool.execute('SELECT fechaEvaluacion, estado FROM EVALUACION WHERE idEvaluacion = ?', [evaluacionId]);
    if (rows.length === 0) {
      return { success: false, message: 'Evaluación no encontrada' };
    }
    const evaluacion = rows[0];
    // Solo restringir si está pendiente
    if (evaluacion.estado === 'Pendiente') {
      const fechaEvaluacion = new Date(evaluacion.fechaEvaluacion);
      const ahora = new Date();
      const diffMs = ahora - fechaEvaluacion;
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      if (diffDias > 2) {
        return { success: false, message: 'No se puede finalizar la evaluación porque han pasado más de 2 días desde su creación.' };
      }
    }
    await pool.execute(
      'UPDATE EVALUACION SET estado = ? WHERE idEvaluacion = ?',
      ['Completada', evaluacionId]
    );
    return {
      success: true,
      message: 'Evaluación finalizada exitosamente'
    };
  } catch (error) {
    console.error('Error al finalizar evaluación:', error);
    return { success: false, message: 'Error al finalizar la evaluación' };
  }
};

// Cancelar automáticamente evaluaciones pendientes vencidas
const cancelarBorradoresVencidos = async () => {
  try {
    // Selecciona evaluaciones pendientes con más de 1 día de antigüedad
    const [rows] = await pool.execute(
      `SELECT idEvaluacion, fechaEvaluacion FROM EVALUACION WHERE estado = 'Pendiente'`
    );
    const ahora = new Date();
    let canceladas = 0;
    for (const row of rows) {
      const fechaEvaluacion = new Date(row.fechaEvaluacion);
      const diffMs = ahora - fechaEvaluacion;
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      if (diffDias > 1) {
        await pool.execute(
          'UPDATE EVALUACION SET estado = ? WHERE idEvaluacion = ?',
          ['Cancelada', row.idEvaluacion]
        );
        canceladas++;
      }
    }
    if (canceladas > 0) {
      console.log(`⏰ Evaluaciones pendientes canceladas automáticamente: ${canceladas}`);
    }
    return { success: true, canceladas };
  } catch (error) {
    console.error('Error al cancelar borradores vencidos:', error);
    return { success: false, message: 'Error al cancelar borradores vencidos' };
  }
};

// Obtener criterios y subcriterios por tipo de evaluación
const getCriteriosYSubcriteriosPorTipoEvaluacion = async (idTipoEvaluacion) => {
  try {
    // Obtener criterios asociados al tipo de evaluación
    const [criterios] = await pool.execute(
      `SELECT c.idCriterio, c.nombre
       FROM TIPO_EVALUACION_CRITERIO tec
       JOIN CRITERIO c ON tec.idCriterio = c.idCriterio
       WHERE tec.idTipoEvaluacion = ?
       ORDER BY c.idCriterio`,
      [idTipoEvaluacion]
    );
    // Para cada criterio, obtener sus subcriterios
    for (const criterio of criterios) {
      const [subcriterios] = await pool.execute(
        `SELECT idSubCriterio, nombre
         FROM SUB_CRITERIO
         WHERE idCriterio = ?
         ORDER BY idSubCriterio`,
        [criterio.idCriterio]
      );
      criterio.subcriterios = subcriterios;
    }
    return { success: true, criterios };
  } catch (error) {
    console.error('Error al obtener criterios y subcriterios por tipo de evaluación:', error);
    return { success: false, message: 'Error al obtener criterios y subcriterios' };
  }
};

/**
 * Ejemplo de payload para crear una evaluación:
 * {
 *   date: '2024-06-01',
 *   time: '10:00',
 *   score: 18.5,
 *   comments: 'Buen desempeño',
 *   status: 'Activo',
 *   idAsignacion: 1,
 *   idEvaluador: 2,
 *   idEvaluado: 3,
 *   idTipoEvaluacion: 1, // 1=Estudiante, 2=Evaluador, 3=Autoevaluación
 *   detalles: [
 *     { idSubCriterio: 5, puntaje: 4 },
 *     { idSubCriterio: 6, puntaje: 5 }
 *   ]
 * }
 *
 * Para obtener criterios y subcriterios de un tipo de evaluación:
 * GET /api/evaluaciones/criterios/:idTipoEvaluacion
 */

module.exports = {
  getAllEvaluaciones,
  getEvaluacionesByEvaluador,
  getEvaluacionesByColaborador,
  createEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  getColaboradoresParaEvaluar,
  getColaboradorByUserId,
  finalizarEvaluacion,
  cancelarBorradoresVencidos,
  getCriteriosYSubcriteriosPorTipoEvaluacion
};
