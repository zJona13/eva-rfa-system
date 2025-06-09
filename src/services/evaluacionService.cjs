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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    console.log('Creating evaluacion with data:', evaluacionData);
    
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
    
    // Guardar detalles de subcriterios si se proporcionan
    if (evaluacionData.subcriteriosRatings && Object.keys(evaluacionData.subcriteriosRatings).length > 0) {
      for (const [subcriterioId, puntaje] of Object.entries(evaluacionData.subcriteriosRatings)) {
        // Obtener información del subcriterio
        const [subcriterioInfo] = await connection.execute(
          'SELECT texto, idCriterio FROM SUBCRITERIOS WHERE idSubCriterio = ?',
          [subcriterioId]
        );
        
        if (subcriterioInfo.length > 0) {
          const subcriterio = subcriterioInfo[0];
          
          // Obtener nombre del criterio
          const [criterioInfo] = await connection.execute(
            'SELECT nombre FROM CRITERIOS WHERE idCriterio = ?',
            [subcriterio.idCriterio]
          );
          
          const criterioNombre = criterioInfo.length > 0 ? criterioInfo[0].nombre : 'Sin criterio';
          
          // Insertar en CRITERIO_EVALUACION
          await connection.execute(
            'INSERT INTO CRITERIO_EVALUACION (criterio, subcriterio, puntaje, idEvaluacion) VALUES (?, ?, ?, ?)',
            [
              criterioNombre,
              subcriterio.texto,
              puntaje,
              evaluacionId
            ]
          );
        }
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

// Actualizar una evaluación con detalles de subcriterios
const updateEvaluacion = async (evaluacionId, evaluacionData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Obtener la evaluación actual para validar la fecha
    const [rows] = await connection.execute('SELECT fechaEvaluacion, estado FROM EVALUACION WHERE idEvaluacion = ?', [evaluacionId]);
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
    
    // Eliminar detalles de criterios existentes
    await connection.execute('DELETE FROM CRITERIO_EVALUACION WHERE idEvaluacion = ?', [evaluacionId]);
    
    // Guardar nuevos detalles de subcriterios si se proporcionan
    if (evaluacionData.subcriteriosRatings && Object.keys(evaluacionData.subcriteriosRatings).length > 0) {
      for (const [subcriterioId, puntaje] of Object.entries(evaluacionData.subcriteriosRatings)) {
        // Obtener información del subcriterio
        const [subcriterioInfo] = await connection.execute(
          'SELECT texto, idCriterio FROM SUBCRITERIOS WHERE idSubCriterio = ?',
          [subcriterioId]
        );
        
        if (subcriterioInfo.length > 0) {
          const subcriterio = subcriterioInfo[0];
          
          // Obtener nombre del criterio
          const [criterioInfo] = await connection.execute(
            'SELECT nombre FROM CRITERIOS WHERE idCriterio = ?',
            [subcriterio.idCriterio]
          );
          
          const criterioNombre = criterioInfo.length > 0 ? criterioInfo[0].nombre : 'Sin criterio';
          
          // Insertar en CRITERIO_EVALUACION
          await connection.execute(
            'INSERT INTO CRITERIO_EVALUACION (criterio, subcriterio, puntaje, idEvaluacion) VALUES (?, ?, ?, ?)',
            [
              criterioNombre,
              subcriterio.texto,
              puntaje,
              evaluacionId
            ]
          );
        }
      }
    }
    
    await connection.commit();
    
    // Llamar a la cancelación automática después de actualizar
    await cancelarBorradoresVencidos();
    
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
  cancelarBorradoresVencidos
};
