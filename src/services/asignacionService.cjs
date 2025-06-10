
const { pool } = require('../utils/dbConnection.cjs');

// Crear una nueva asignación con evaluaciones por período y área
const createAsignacion = async (asignacionData) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { 
      fechaInicio, 
      fechaFin, 
      horaLimite, 
      areaId, 
      descripcion,
      activa = true 
    } = asignacionData;
    
    // Crear la asignación principal
    const [asignacionResult] = await conn.execute(
      'INSERT INTO ASIGNACION (fechaInicio, fechaFin, horaLimite, descripcion, activa, idArea) VALUES (?, ?, ?, ?, ?, ?)',
      [fechaInicio, fechaFin, horaLimite, descripcion, activa, areaId]
    );
    
    const asignacionId = asignacionResult.insertId;
    
    // Obtener todos los colaboradores del área especificada
    const [colaboradores] = await conn.execute(
      'SELECT idColaborador FROM COLABORADOR WHERE idArea = ? AND estado = 1',
      [areaId]
    );
    
    // Obtener los 3 tipos de evaluación (asumiendo que existen en la tabla TIPO_EVALUACION)
    const [tiposEvaluacion] = await conn.execute(
      'SELECT idTipoEvaluacion FROM TIPO_EVALUACION ORDER BY idTipoEvaluacion LIMIT 3'
    );
    
    // Crear evaluaciones para cada colaborador y cada tipo de evaluación
    for (const colaborador of colaboradores) {
      for (const tipoEval of tiposEvaluacion) {
        // Determinar evaluador y evaluado según el tipo
        let idEvaluador = colaborador.idColaborador;
        let idEvaluado = colaborador.idColaborador;
        
        // Para supervisión, podríamos asignar un supervisor (esto se puede ajustar según lógica de negocio)
        if (tipoEval.idTipoEvaluacion === 2) { // Asumiendo que 2 es supervisión
          // Por ahora, mantenemos el mismo colaborador como evaluador
          idEvaluador = colaborador.idColaborador;
        }
        
        await conn.execute(
          'INSERT INTO EVALUACION (fechaEvaluacion, horaEvaluacion, puntajeTotal, estado, idAsignacion, idEvaluador, idEvaluado, idTipoEvaluacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            fechaInicio,
            horaLimite,
            0, // puntaje inicial
            'Activa',
            asignacionId,
            idEvaluador,
            idEvaluado,
            tipoEval.idTipoEvaluacion
          ]
        );
      }
    }
    
    await conn.commit();
    
    return {
      success: true,
      asignacionId: asignacionId,
      message: 'Asignación creada exitosamente con evaluaciones generadas'
    };
    
  } catch (error) {
    await conn.rollback();
    console.error('Error al crear asignación:', error);
    return { 
      success: false, 
      message: 'Error al crear la asignación: ' + error.message 
    };
  } finally {
    conn.release();
  }
};

// Obtener todas las asignaciones
const getAllAsignaciones = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion, a.fechaInicio, a.fechaFin, a.horaLimite, 
              a.descripcion, a.activa, a.fechaCreacion,
              ar.nombre as areaNombre,
              COUNT(e.idEvaluacion) as totalEvaluaciones,
              SUM(CASE WHEN e.estado = 'Completada' THEN 1 ELSE 0 END) as evaluacionesCompletadas,
              SUM(CASE WHEN e.estado = 'Activa' THEN 1 ELSE 0 END) as evaluacionesActivas,
              SUM(CASE WHEN e.estado = 'Borrador' THEN 1 ELSE 0 END) as evaluacionesBorrador
       FROM ASIGNACION a
       JOIN AREA ar ON a.idArea = ar.idArea
       LEFT JOIN EVALUACION e ON a.idAsignacion = e.idAsignacion
       GROUP BY a.idAsignacion
       ORDER BY a.fechaCreacion DESC`
    );
    
    return {
      success: true,
      asignaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return { 
      success: false, 
      message: 'Error al obtener las asignaciones' 
    };
  }
};

// Obtener asignaciones activas para un colaborador específico
const getAsignacionesActivasByColaborador = async (colaboradorId) => {
  try {
    const fechaActual = new Date().toISOString().slice(0, 10);
    const horaActual = new Date().toTimeString().slice(0, 8);
    
    const [rows] = await pool.execute(
      `SELECT DISTINCT a.idAsignacion, a.fechaInicio, a.fechaFin, a.horaLimite,
              a.descripcion, ar.nombre as areaNombre
       FROM ASIGNACION a
       JOIN AREA ar ON a.idArea = ar.idArea
       JOIN EVALUACION e ON a.idAsignacion = e.idAsignacion
       WHERE e.idEvaluado = ? 
         AND a.activa = 1
         AND a.fechaInicio <= ?
         AND a.fechaFin >= ?
         AND (a.fechaFin > ? OR (a.fechaFin = ? AND a.horaLimite >= ?))
       ORDER BY a.fechaFin ASC`,
      [colaboradorId, fechaActual, fechaActual, fechaActual, fechaActual, horaActual]
    );
    
    return {
      success: true,
      asignaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener asignaciones activas por colaborador:', error);
    return { 
      success: false, 
      message: 'Error al obtener las asignaciones activas' 
    };
  }
};

// Obtener evaluaciones de una asignación específica
const getEvaluacionesByAsignacion = async (asignacionId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion, e.fechaEvaluacion, e.horaEvaluacion, 
              e.puntajeTotal, e.estado,
              te.nombre as tipoEvaluacion,
              CONCAT(eval.nombres, ' ', eval.apePat, ' ', eval.apeMat) as evaluadorNombre,
              CONCAT(evald.nombres, ' ', evald.apePat, ' ', evald.apeMat) as evaluadoNombre
       FROM EVALUACION e
       JOIN TIPO_EVALUACION te ON e.idTipoEvaluacion = te.idTipoEvaluacion
       JOIN COLABORADOR eval ON e.idEvaluador = eval.idColaborador
       JOIN COLABORADOR evald ON e.idEvaluado = evald.idColaborador
       WHERE e.idAsignacion = ?
       ORDER BY te.idTipoEvaluacion, evald.nombres`,
      [asignacionId]
    );
    
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones por asignación:', error);
    return { 
      success: false, 
      message: 'Error al obtener las evaluaciones de la asignación' 
    };
  }
};

// Actualizar estado de una asignación
const updateAsignacionEstado = async (asignacionId, activa) => {
  try {
    await pool.execute(
      'UPDATE ASIGNACION SET activa = ? WHERE idAsignacion = ?',
      [activa, asignacionId]
    );
    
    // También actualizar el estado de las evaluaciones relacionadas
    const nuevoEstadoEval = activa ? 'Activa' : 'Inactiva';
    await pool.execute(
      'UPDATE EVALUACION SET estado = ? WHERE idAsignacion = ? AND estado NOT IN ("Completada", "Cancelada")',
      [nuevoEstadoEval, asignacionId]
    );
    
    return {
      success: true,
      message: `Asignación ${activa ? 'activada' : 'desactivada'} exitosamente`
    };
  } catch (error) {
    console.error('Error al actualizar estado de asignación:', error);
    return { 
      success: false, 
      message: 'Error al actualizar el estado de la asignación' 
    };
  }
};

// Eliminar una asignación (y sus evaluaciones relacionadas)
const deleteAsignacion = async (asignacionId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Primero eliminar los detalles de evaluación
    await conn.execute(
      'DELETE de FROM DETALLE_EVALUACION de JOIN EVALUACION e ON de.idEvaluacion = e.idEvaluacion WHERE e.idAsignacion = ?',
      [asignacionId]
    );
    
    // Luego eliminar las evaluaciones
    await conn.execute(
      'DELETE FROM EVALUACION WHERE idAsignacion = ?',
      [asignacionId]
    );
    
    // Finalmente eliminar la asignación
    await conn.execute(
      'DELETE FROM ASIGNACION WHERE idAsignacion = ?',
      [asignacionId]
    );
    
    await conn.commit();
    
    return {
      success: true,
      message: 'Asignación eliminada exitosamente'
    };
  } catch (error) {
    await conn.rollback();
    console.error('Error al eliminar asignación:', error);
    return { 
      success: false, 
      message: 'Error al eliminar la asignación' 
    };
  } finally {
    conn.release();
  }
};

module.exports = {
  createAsignacion,
  getAllAsignaciones,
  getAsignacionesActivasByColaborador,
  getEvaluacionesByAsignacion,
  updateAsignacionEstado,
  deleteAsignacion
};
