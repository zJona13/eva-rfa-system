const { pool } = require('../../utils/dbConnection.cjs');
const { createEvaluationsForAsignacion } = require('./evaluacionCreationService.cjs');
const { validateAsignacionData, validateTimeRange } = require('./asignacionValidationService.cjs');
const { addStatsToAsignaciones } = require('./asignacionStatsService.cjs');

// Create a new assignment
const createAsignacion = async (asignacionData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('=== CREANDO ASIGNACIÓN ===');
    console.log('Datos recibidos:', asignacionData);
    
    // Validate assignment data
    const validation = await validateAsignacionData(asignacionData);
    if (!validation.isValid) {
      await connection.rollback();
      return {
        success: false,
        message: validation.message
      };
    }
    
    // Log de los valores antes del INSERT
    console.log('Valores para INSERT:', {
      idUsuario: asignacionData.idUsuario,
      periodo: new Date().getFullYear(),
      fechaInicio: asignacionData.fechaInicio,
      fechaFin: asignacionData.fechaFin,
      estado: 'Abierta',
      areaId: asignacionData.areaId
    });
    // Validación manual para evitar undefined
    if (
      asignacionData.idUsuario === undefined ||
      asignacionData.fechaInicio === undefined ||
      asignacionData.fechaFin === undefined ||
      asignacionData.areaId === undefined
    ) {
      await connection.rollback();
      throw new Error('Uno o más campos requeridos para la asignación están undefined. Revisa los datos enviados.');
    }
    
    // Create the main assignment with 'Abierta' status
    const [asignacionResult] = await connection.execute(
      `INSERT INTO ASIGNACION (idUsuario, periodo, fecha_inicio, fecha_fin, estado, idArea) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        asignacionData.idUsuario,
        new Date().getFullYear(),
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        'Abierta',
        asignacionData.areaId
      ]
    );
    
    const asignacionId = asignacionResult.insertId;
    console.log('Asignación creada con ID:', asignacionId);
    
    // Create evaluations for the assignment
    const evaluacionesCreadas = await createEvaluationsForAsignacion(connection, asignacionId, asignacionData);
    
    await connection.commit();
    
    return {
      success: true,
      data: {
        asignacion: {
          id: asignacionId,
          evaluaciones: evaluacionesCreadas
        }
      },
      message: `Asignación creada exitosamente con ${evaluacionesCreadas.length} evaluaciones`
    };
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear asignación:', error);
    return { 
      success: false, 
      message: error.message || 'Error al crear la asignación de evaluaciones' 
    };
  } finally {
    connection.release();
  }
};

// Get all assignments with detailed information
const getAllAsignaciones = async () => {
  try {
    console.log('=== OBTENIENDO TODAS LAS ASIGNACIONES ===');
    
    const [rows] = await pool.execute(
      `SELECT 
        a.idAsignacion as id,
        a.periodo,
        a.fecha_inicio as fechaInicio,
        a.fecha_fin as fechaFin,
        a.estado,
        ar.nombre as areaNombre,
        ar.idArea as areaId,
        u.nombre as usuarioCreador,
        DATEDIFF(a.fecha_fin, a.fecha_inicio) as duracionDias
       FROM ASIGNACION a
       LEFT JOIN AREA ar ON a.idArea = ar.idArea
       LEFT JOIN USUARIO u ON a.idUsuario = u.idUsuario
       WHERE a.estado IN ('Abierta', 'Cerrada')
       ORDER BY a.fecha_inicio DESC, a.idAsignacion DESC`
    );
    
    console.log('=== RESULTADO CONSULTA ASIGNACIONES ===');
    console.log('Total filas encontradas:', rows.length);
    console.log('Primera fila (si existe):', rows[0]);
    
    if (rows.length === 0) {
      console.log('=== RETORNANDO ARRAY VACÍO ===');
      return {
        success: true,
        asignaciones: []
      };
    }
    
    // Transform data structure
    const asignaciones = rows.map(row => ({
      id: row.id,
      periodo: row.periodo,
      fechaInicio: row.fechaInicio,
      fechaFin: row.fechaFin,
      areaId: row.areaId,
      areaNombre: row.areaNombre || 'Sin área',
      usuarioCreador: row.usuarioCreador || 'Sistema',
      estado: row.estado,
      duracionDias: row.duracionDias || 0
    }));
    
    console.log('=== ASIGNACIONES ANTES DE ESTADÍSTICAS ===');
    console.log('Cantidad:', asignaciones.length);
    console.log('Primera asignación transformada:', asignaciones[0]);
    
    // Add statistics to all assignments
    const asignacionesConEstadisticas = await addStatsToAsignaciones(asignaciones);
    
    console.log('=== ASIGNACIONES PROCESADAS ===');
    console.log('Total asignaciones procesadas:', asignacionesConEstadisticas.length);
    console.log('Primera asignación con estadísticas:', asignacionesConEstadisticas[0]);
    
    return {
      success: true,
      asignaciones: asignacionesConEstadisticas
    };
  } catch (error) {
    console.error('=== ERROR AL OBTENER ASIGNACIONES ===');
    console.error('Error completo:', error);
    return { 
      success: false, 
      error: 'Error al obtener el historial de asignaciones',
      message: error.message 
    };
  }
};

// Update an assignment
const updateAsignacion = async (asignacionId, asignacionData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Validate data
    const validation = await validateAsignacionData(asignacionData, asignacionId);
    if (!validation.isValid) {
      await connection.rollback();
      return {
        success: false,
        message: validation.message
      };
    }
    
    // Validate time range
    const timeValidation = validateTimeRange(asignacionData);
    if (!timeValidation.isValid) {
      await connection.rollback();
      return {
        success: false,
        message: timeValidation.message
      };
    }
    
    // Update the assignment
    await connection.execute(
      `UPDATE ASIGNACION 
       SET fecha_inicio = ?, fecha_fin = ?, idArea = ?
       WHERE idAsignacion = ?`,
      [
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        asignacionData.areaId,
        asignacionId
      ]
    );
    
    await connection.commit();
    
    return {
      success: true,
      message: 'Asignación actualizada exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar asignación:', error);
    return { 
      success: false, 
      message: 'Error al actualizar la asignación' 
    };
  } finally {
    connection.release();
  }
};

// Delete an assignment
const deleteAsignacion = async (asignacionId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get related evaluations
    const [evaluaciones] = await connection.execute(
      `SELECT e.idEvaluacion 
       FROM EVALUACION e
       JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
       WHERE da.idAsignacion = ? AND e.estado = 'Pendiente'`,
      [asignacionId]
    );
    
    // Delete only if all evaluations are pending
    if (evaluaciones.length > 0) {
      // Delete assignment details
      await connection.execute(
        'DELETE FROM DETALLE_ASIGNACION WHERE idAsignacion = ?',
        [asignacionId]
      );
      
      // Delete pending evaluations
      for (const eval of evaluaciones) {
        await connection.execute(
          'DELETE FROM EVALUACION WHERE idEvaluacion = ? AND estado = "Pendiente"',
          [eval.idEvaluacion]
        );
      }
    }
    
    // Delete the assignment
    await connection.execute(
      'DELETE FROM ASIGNACION WHERE idAsignacion = ?',
      [asignacionId]
    );
    
    await connection.commit();
    
    return {
      success: true,
      message: 'Asignación eliminada exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar asignación:', error);
    return { 
      success: false, 
      message: 'Error al eliminar la asignación' 
    };
  } finally {
    connection.release();
  }
};

// Close an assignment (change status to 'Cerrada')
const cerrarAsignacion = async (asignacionId) => {
  try {
    const [result] = await pool.execute(
      'UPDATE ASIGNACION SET estado = ? WHERE idAsignacion = ? AND estado = ?',
      ['Cerrada', asignacionId, 'Abierta']
    );
    
    if (result.affectedRows === 0) {
      return {
        success: false,
        message: 'No se pudo cerrar la asignación. Verifique que esté en estado Abierta.'
      };
    }
    
    return {
      success: true,
      message: 'Asignación cerrada exitosamente'
    };
  } catch (error) {
    console.error('Error al cerrar asignación:', error);
    return {
      success: false,
      message: 'Error al cerrar la asignación'
    };
  }
};

// Get assignments by evaluator
const getAsignacionesByEvaluador = async (evaluadorId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion as id, a.periodo, a.fecha_inicio as fechaInicio, 
       a.fecha_fin as fechaFin, a.estado,
       COUNT(da.idEvaluacion) as totalEvaluaciones,
       SUM(CASE WHEN e.estado = 'Completada' THEN 1 ELSE 0 END) as evaluacionesCompletadas
       FROM ASIGNACION a
       LEFT JOIN DETALLE_ASIGNACION da ON a.idAsignacion = da.idAsignacion
       LEFT JOIN EVALUACION e ON da.idEvaluacion = e.idEvaluacion
       WHERE a.idUsuario = ?
       GROUP BY a.idAsignacion
       ORDER BY a.fecha_inicio DESC`,
      [evaluadorId]
    );
    
    return {
      success: true,
      asignaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener asignaciones del evaluador:', error);
    return { 
      success: false, 
      message: 'Error al obtener las asignaciones del evaluador' 
    };
  }
};

module.exports = {
  createAsignacion,
  getAllAsignaciones,
  updateAsignacion,
  deleteAsignacion,
  cerrarAsignacion,
  getAsignacionesByEvaluador
};
