
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

// Crear una nueva evaluación
const createEvaluacion = async (evaluacionData) => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Creating evaluacion with data:', evaluacionData);
    await connection.beginTransaction();
    
    // Crear la evaluación principal
    const [evaluacionResult] = await connection.execute(
      'INSERT INTO EVALUACION (fechaEvaluacion, horaEvaluacion, puntaje, comentario, tipo, estado, idUsuario, idColaborador) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        evaluacionData.date,
        evaluacionData.time,
        evaluacionData.score || 0,
        evaluacionData.comments || null,
        evaluacionData.type,
        evaluacionData.status || 'Completada',
        evaluacionData.evaluatorId,
        evaluacionData.evaluatedId
      ]
    );
    
    const evaluacionId = evaluacionResult.insertId;
    console.log('Evaluacion created with ID:', evaluacionId);
    
    // Insertar los subcriterios evaluados si existen
    if (evaluacionData.subcriterios && evaluacionData.subcriterios.length > 0) {
      for (const subcriterio of evaluacionData.subcriterios) {
        await connection.execute(
          'INSERT INTO EVALUACION_SUBCRITERIOS (idEvaluacion, idSubCriterio, puntajeObtenido, descripcion) VALUES (?, ?, ?, ?)',
          [evaluacionId, subcriterio.idSubCriterio, subcriterio.puntajeObtenido, subcriterio.descripcion || null]
        );
      }
    }
    
    await connection.commit();
    
    return {
      success: true,
      evaluacionId: evaluacionId,
      message: 'Evaluación creada exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear evaluación:', error);
    return { success: false, message: 'Error al crear la evaluación' };
  } finally {
    connection.release();
  }
};

// Actualizar una evaluación
const updateEvaluacion = async (evaluacionId, evaluacionData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Actualizar la evaluación principal
    await connection.execute(
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
    
    // Eliminar subcriterios existentes para reinsertarlos
    await connection.execute('DELETE FROM EVALUACION_SUBCRITERIOS WHERE idEvaluacion = ?', [evaluacionId]);
    
    // Reinsertar subcriterios actualizados
    if (evaluacionData.subcriterios && evaluacionData.subcriterios.length > 0) {
      for (const subcriterio of evaluacionData.subcriterios) {
        await connection.execute(
          'INSERT INTO EVALUACION_SUBCRITERIOS (idEvaluacion, idSubCriterio, puntajeObtenido, descripcion) VALUES (?, ?, ?, ?)',
          [evaluacionId, subcriterio.idSubCriterio, subcriterio.puntajeObtenido, subcriterio.descripcion]
        );
      }
    }
    
    await connection.commit();
    
    return {
      success: true,
      message: 'Evaluación actualizada exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar evaluación:', error);
    return { success: false, message: 'Error al actualizar la evaluación' };
  } finally {
    connection.release();
  }
};

// Eliminar una evaluación
const deleteEvaluacion = async (evaluacionId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Eliminar subcriterios relacionados
    await connection.execute('DELETE FROM EVALUACION_SUBCRITERIOS WHERE idEvaluacion = ?', [evaluacionId]);
    
    // Eliminar la evaluación
    await connection.execute('DELETE FROM EVALUACION WHERE idEvaluacion = ?', [evaluacionId]);
    
    await connection.commit();
    
    return {
      success: true,
      message: 'Evaluación eliminada exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar evaluación:', error);
    return { success: false, message: 'Error al eliminar la evaluación' };
  } finally {
    connection.release();
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

module.exports = {
  getAllEvaluaciones,
  getEvaluacionesByEvaluador,
  getEvaluacionesByColaborador,
  createEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  getColaboradoresParaEvaluar
};
