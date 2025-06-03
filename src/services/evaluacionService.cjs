const { pool } = require('../utils/dbConnection.cjs');

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

// Obtener evaluaciones disponibles para un usuario específico
const getEvaluacionesDisponibles = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion as id, 
       e.fechaEvaluacion, e.horaEvaluacion, e.tipo, e.estado,
       CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as evaluadoNombre,
       c.idColaborador as evaluadoId,
       a.idAsignacion as asignacionId,
       a.fecha_inicio as fechaInicio,
       a.fecha_fin as fechaFin
       FROM EVALUACION e
       JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
       JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
       JOIN ASIGNACION a ON da.idAsignacion = a.idAsignacion
       WHERE e.idUsuario = ? AND a.estado = 'Abierta'
       ORDER BY e.fechaEvaluacion ASC, e.horaEvaluacion ASC`,
      [userId]
    );
    
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones disponibles:', error);
    return { success: false, message: 'Error al obtener las evaluaciones disponibles' };
  }
};

// Completar una evaluación
const completarEvaluacion = async (evaluacionData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Verificar que la evaluación existe y está pendiente
    const [evaluacion] = await connection.execute(
      `SELECT e.*, a.fecha_inicio, a.fecha_fin, a.estado as estadoAsignacion
       FROM EVALUACION e
       JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
       JOIN ASIGNACION a ON da.idAsignacion = a.idAsignacion
       WHERE e.idEvaluacion = ?`,
      [evaluacionData.id]
    );
    
    if (evaluacion.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Evaluación no encontrada' };
    }
    
    const eval = evaluacion[0];
    
    // Verificar que la asignación esté abierta
    if (eval.estadoAsignacion !== 'Abierta') {
      await connection.rollback();
      return { success: false, message: 'La asignación está cerrada' };
    }
    
    // Verificar que estamos en el período válido
    const now = new Date();
    const fechaInicio = new Date(eval.fecha_inicio);
    const fechaFin = new Date(eval.fecha_fin);
    
    if (now < fechaInicio || now > fechaFin) {
      await connection.rollback();
      return { success: false, message: 'La evaluación no está disponible en este momento' };
    }
    
    // Verificar que la evaluación está pendiente
    if (eval.estado === 'Completada') {
      await connection.rollback();
      return { success: false, message: 'Esta evaluación ya ha sido completada' };
    }
    
    // Actualizar la evaluación
    await connection.execute(
      `UPDATE EVALUACION 
       SET puntaje = ?, comentario = ?, estado = ?, 
           subcriteriosRatings = ?, fechaEvaluacion = NOW(), horaEvaluacion = TIME(NOW())
       WHERE idEvaluacion = ?`,
      [
        evaluacionData.score,
        evaluacionData.comments,
        'Completada',
        JSON.stringify(evaluacionData.subcriteriosRatings),
        evaluacionData.id
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
  createEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  getColaboradoresParaEvaluar,
  getColaboradorByUserId,
  getEvaluacionesDisponibles,
  completarEvaluacion
};
