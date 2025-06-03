const { pool } = require('../utils/dbConnection.cjs');

// Función auxiliar para validar si una evaluación puede ser realizada
const canPerformEvaluation = async (evaluacionId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.fechaEvaluacion, e.estado, a.fecha_inicio, a.fecha_fin
       FROM EVALUACION e
       JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
       JOIN ASIGNACION a ON da.idAsignacion = a.idAsignacion
       WHERE e.idEvaluacion = ?`,
      [evaluacionId]
    );

    if (rows.length === 0) {
      return { canPerform: false, message: 'Evaluación no encontrada' };
    }

    const evaluacion = rows[0];
    const now = new Date();
    const fechaInicio = new Date(evaluacion.fecha_inicio);
    const fechaFin = new Date(evaluacion.fecha_fin);

    // Verificar si estamos dentro del período de evaluación
    if (now < fechaInicio) {
      return { 
        canPerform: false, 
        message: 'La evaluación aún no está disponible. Debe esperar hasta la fecha de inicio.' 
      };
    }

    if (now > fechaFin) {
      return { 
        canPerform: false, 
        message: 'El período de evaluación ha finalizado.' 
      };
    }

    return { canPerform: true };
  } catch (error) {
    console.error('Error validando evaluación:', error);
    return { canPerform: false, message: 'Error al validar la evaluación' };
  }
};

// Obtener evaluaciones pendientes por usuario evaluador con validación de fechas
const getEvaluacionesPendientesByEvaluador = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion as id, e.fechaEvaluacion as date, 
      e.horaEvaluacion as time, e.tipo as type, e.estado as status,
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as evaluatedName,
      c.idColaborador as evaluatedId,
      a.fecha_inicio, a.fecha_fin
      FROM EVALUACION e
      JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
      JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
      JOIN ASIGNACION a ON da.idAsignacion = a.idAsignacion
      WHERE e.idUsuario = ? AND e.estado = 'Pendiente'
      ORDER BY e.fechaEvaluacion DESC`,
      [userId]
    );

    const now = new Date();
    const evaluacionesDisponibles = rows.filter(row => {
      const fechaInicio = new Date(row.fecha_inicio);
      const fechaFin = new Date(row.fecha_fin);
      return now >= fechaInicio && now <= fechaFin;
    });

    return {
      success: true,
      evaluaciones: evaluacionesDisponibles
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones pendientes:', error);
    return { success: false, message: 'Error al obtener las evaluaciones pendientes' };
  }
};

// Obtener todas las evaluaciones con información relacionada
const getAllEvaluaciones = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion as id, e.fechaEvaluacion as date, 
      e.horaEvaluacion as time, e.puntaje as score, e.comentario as comments,
      e.tipo as type, e.estado as status,
      e.subcriteriosRatings,
      u.nombre as evaluatorName, 
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as evaluatedName,
      c.idColaborador as evaluatedId
      FROM EVALUACION e
      JOIN USUARIO u ON e.idUsuario = u.idUsuario
      JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
      ORDER BY e.fechaEvaluacion DESC`
    );
    const evaluaciones = rows.map(row => ({
      ...row,
      subcriteriosRatings: row.subcriteriosRatings ? JSON.parse(row.subcriteriosRatings) : undefined
    }));
    return {
      success: true,
      evaluaciones
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
      e.subcriteriosRatings,
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as evaluatedName,
      c.idColaborador as evaluatedId
      FROM EVALUACION e
      JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
      WHERE e.idUsuario = ?
      ORDER BY e.fechaEvaluacion DESC`,
      [userId]
    );
    // Parsear subcriteriosRatings
    const evaluaciones = rows.map(row => ({
      ...row,
      subcriteriosRatings: row.subcriteriosRatings ? JSON.parse(row.subcriteriosRatings) : undefined
    }));
    return {
      success: true,
      evaluaciones
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
      e.subcriteriosRatings,
      u.nombre as evaluatorName
      FROM EVALUACION e
      JOIN USUARIO u ON e.idUsuario = u.idUsuario
      WHERE e.idColaborador = ?
      ORDER BY e.fechaEvaluacion DESC`,
      [colaboradorId]
    );
    const evaluaciones = rows.map(row => ({
      ...row,
      subcriteriosRatings: row.subcriteriosRatings ? JSON.parse(row.subcriteriosRatings) : undefined
    }));
    return {
      success: true,
      evaluaciones
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones por colaborador:', error);
    return { success: false, message: 'Error al obtener las evaluaciones' };
  }
};

// Crear/Completar una evaluación - SIN BORRADORES
const completeEvaluacion = async (evaluacionId, evaluacionData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Validar que la evaluación puede ser realizada
    const validation = await canPerformEvaluation(evaluacionId);
    if (!validation.canPerform) {
      await connection.rollback();
      return { success: false, message: validation.message };
    }

    // Actualizar la evaluación directamente a 'Completada'
    await connection.execute(
      `UPDATE EVALUACION 
       SET puntaje = ?, comentario = ?, estado = 'Completada', 
           subcriteriosRatings = ?
       WHERE idEvaluacion = ? AND estado = 'Pendiente'`,
      [
        evaluacionData.score,
        evaluacionData.comments || null,
        evaluacionData.subcriteriosRatings ? JSON.stringify(evaluacionData.subcriteriosRatings) : null,
        evaluacionId
      ]
    );

    await connection.commit();

    return {
      success: true,
      message: 'Evaluación completada exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al completar evaluación:', error);
    return { success: false, message: 'Error al completar la evaluación' };
  } finally {
    connection.release();
  }
};

// Crear una nueva evaluación - ahora guarda subcriteriosRatings
const createEvaluacion = async (evaluacionData) => {
  try {
    console.log('Creating evaluacion with data:', evaluacionData);
    const [evaluacionResult] = await pool.execute(
      'INSERT INTO EVALUACION (fechaEvaluacion, horaEvaluacion, puntaje, comentario, tipo, estado, idUsuario, idColaborador, subcriteriosRatings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        evaluacionData.date,
        evaluacionData.time,
        evaluacionData.score || 0,
        evaluacionData.comments || null,
        evaluacionData.type,
        evaluacionData.status || 'Completada',
        evaluacionData.evaluatorId,
        evaluacionData.evaluatedId,
        evaluacionData.subcriteriosRatings ? JSON.stringify(evaluacionData.subcriteriosRatings) : null
      ]
    );
    const evaluacionId = evaluacionResult.insertId;
    console.log('Evaluacion created with ID:', evaluacionId);
    return {
      success: true,
      evaluacionId: evaluacionId,
      message: 'Evaluación creada exitosamente'
    };
  } catch (error) {
    console.error('Error al crear evaluación:', error);
    return { success: false, message: 'Error al crear la evaluación' };
  }
};

// Actualizar una evaluación - ahora guarda subcriteriosRatings
const updateEvaluacion = async (evaluacionId, evaluacionData) => {
  try {
    await pool.execute(
      'UPDATE EVALUACION SET fechaEvaluacion = ?, horaEvaluacion = ?, puntaje = ?, comentario = ?, tipo = ?, estado = ?, subcriteriosRatings = ? WHERE idEvaluacion = ?',
      [
        evaluacionData.date,
        evaluacionData.time,
        evaluacionData.score,
        evaluacionData.comments,
        evaluacionData.type,
        evaluacionData.status,
        evaluacionData.subcriteriosRatings ? JSON.stringify(evaluacionData.subcriteriosRatings) : null,
        evaluacionId
      ]
    );
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
// CORREGIDO: Solo mostrar colaboradores con rol "Docente" o "Evaluado"
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
      AND tc.nombre IN ('Docente', 'Evaluado')
      ORDER BY c.nombres, c.apePat`
    );
    
    console.log('Colaboradores encontrados:', rows);
    console.log('Cantidad de colaboradores:', rows.length);
    
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

module.exports = {
  getAllEvaluaciones,
  getEvaluacionesByEvaluador,
  getEvaluacionesByColaborador,
  getEvaluacionesPendientesByEvaluador,
  completeEvaluacion,
  canPerformEvaluation,
  createEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  getColaboradoresParaEvaluar,
  getColaboradorByUserId
};
