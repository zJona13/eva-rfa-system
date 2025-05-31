
const { pool } = require('../utils/dbConnection.cjs');

// Crear asignaciones para las 3 evaluaciones de una vez
const createAsignacion = async (asignacionData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    console.log('Creando asignación con datos:', asignacionData);
    
    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (new Date(asignacionData.fechaFin) < new Date(asignacionData.fechaInicio)) {
      return {
        success: false,
        message: 'La fecha de finalización no puede ser anterior a la fecha de inicio'
      };
    }
    
    // Validar disponibilidad de horario
    const conflicto = await validarDisponibilidadHorario(
      asignacionData.fechaInicio,
      asignacionData.fechaFin,
      asignacionData.horaInicio,
      asignacionData.horaFin,
      asignacionData.evaluadorId
    );
    
    if (!conflicto.disponible) {
      return {
        success: false,
        message: conflicto.message
      };
    }
    
    // Crear la asignación principal
    const [asignacionResult] = await connection.execute(
      `INSERT INTO ASIGNACION (idUsuario, periodo, fecha_inicio, fecha_fin, estado) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        asignacionData.evaluadorId,
        new Date().getFullYear(), // Periodo basado en el año actual
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        'Activa'
      ]
    );
    
    const asignacionId = asignacionResult.insertId;
    
    // Los 3 tipos de evaluación que se crearán automáticamente
    const tiposEvaluacion = ['Autoevaluacion', 'Estudiante', 'Checklist'];
    const evaluacionesCreadas = [];
    
    // Crear las 3 evaluaciones programadas
    for (const tipo of tiposEvaluacion) {
      const [evaluacionResult] = await connection.execute(
        `INSERT INTO EVALUACION 
         (fechaEvaluacion, horaEvaluacion, tipo, estado, idUsuario, idColaborador, comentario) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          asignacionData.fechaInicio,
          asignacionData.horaInicio,
          tipo,
          'Pendiente',
          asignacionData.evaluadorId,
          1, // Por defecto colaborador 1, esto se puede ajustar según necesidad
          asignacionData.descripcion || `Evaluación ${tipo} programada`
        ]
      );
      
      const evaluacionId = evaluacionResult.insertId;
      
      // Crear el detalle de asignación
      await connection.execute(
        `INSERT INTO DETALLE_ASIGNACION (idEvaluacion, idAsignacion) VALUES (?, ?)`,
        [evaluacionId, asignacionId]
      );
      
      evaluacionesCreadas.push({
        id: evaluacionId,
        tipo: tipo
      });
    }
    
    await connection.commit();
    
    return {
      success: true,
      asignacionId: asignacionId,
      evaluaciones: evaluacionesCreadas,
      message: 'Las 3 evaluaciones han sido asignadas exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear asignaciones:', error);
    return { success: false, message: 'Error al crear las asignaciones de evaluación' };
  } finally {
    connection.release();
  }
};

// Obtener todas las asignaciones con sus evaluaciones
const getAllAsignaciones = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion as id, a.fecha_inicio as fechaInicio, a.fecha_fin as fechaFin,
       a.periodo, a.estado as estadoAsignacion,
       e.idEvaluacion, e.horaEvaluacion as horaInicio, e.horaEvaluacion as horaFin,
       e.tipo as tipoEvaluacion, e.estado, e.comentario as descripcion,
       u.nombre as evaluadorNombre, a.idUsuario as evaluadorId
       FROM ASIGNACION a
       JOIN DETALLE_ASIGNACION da ON a.idAsignacion = da.idAsignacion
       JOIN EVALUACION e ON da.idEvaluacion = e.idEvaluacion
       JOIN USUARIO u ON a.idUsuario = u.idUsuario
       WHERE a.estado = 'Activa'
       ORDER BY a.fecha_inicio DESC, e.horaEvaluacion ASC`
    );
    
    return {
      success: true,
      asignaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return { success: false, message: 'Error al obtener las asignaciones' };
  }
};

// Actualizar una asignación
const updateAsignacion = async (evaluacionId, asignacionData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Validar fechas
    if (new Date(asignacionData.fechaFin) < new Date(asignacionData.fechaInicio)) {
      return {
        success: false,
        message: 'La fecha de finalización no puede ser anterior a la fecha de inicio'
      };
    }
    
    // Obtener la asignación asociada a esta evaluación
    const [asignacionInfo] = await connection.execute(
      `SELECT da.idAsignacion FROM DETALLE_ASIGNACION da WHERE da.idEvaluacion = ?`,
      [evaluacionId]
    );
    
    if (asignacionInfo.length === 0) {
      return {
        success: false,
        message: 'No se encontró la asignación asociada'
      };
    }
    
    const asignacionId = asignacionInfo[0].idAsignacion;
    
    // Actualizar la asignación principal
    await connection.execute(
      `UPDATE ASIGNACION 
       SET fecha_inicio = ?, fecha_fin = ?
       WHERE idAsignacion = ?`,
      [
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        asignacionId
      ]
    );
    
    // Actualizar la evaluación específica
    await connection.execute(
      `UPDATE EVALUACION 
       SET fechaEvaluacion = ?, horaEvaluacion = ?, comentario = ?
       WHERE idEvaluacion = ?`,
      [
        asignacionData.fechaInicio,
        asignacionData.horaInicio,
        asignacionData.descripcion,
        evaluacionId
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
    return { success: false, message: 'Error al actualizar la asignación' };
  } finally {
    connection.release();
  }
};

// Eliminar una asignación (evaluación programada)
const deleteAsignacion = async (evaluacionId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Obtener la asignación asociada
    const [asignacionInfo] = await connection.execute(
      `SELECT da.idAsignacion FROM DETALLE_ASIGNACION da WHERE da.idEvaluacion = ?`,
      [evaluacionId]
    );
    
    if (asignacionInfo.length === 0) {
      return {
        success: false,
        message: 'No se encontró la asignación asociada'
      };
    }
    
    const asignacionId = asignacionInfo[0].idAsignacion;
    
    // Eliminar el detalle de asignación
    await connection.execute(
      'DELETE FROM DETALLE_ASIGNACION WHERE idEvaluacion = ?', 
      [evaluacionId]
    );
    
    // Eliminar la evaluación
    await connection.execute(
      'DELETE FROM EVALUACION WHERE idEvaluacion = ? AND estado = "Pendiente"', 
      [evaluacionId]
    );
    
    // Verificar si quedan más evaluaciones en esta asignación
    const [remainingEvaluations] = await connection.execute(
      'SELECT COUNT(*) as count FROM DETALLE_ASIGNACION WHERE idAsignacion = ?',
      [asignacionId]
    );
    
    // Si no quedan evaluaciones, eliminar la asignación
    if (remainingEvaluations[0].count === 0) {
      await connection.execute(
        'DELETE FROM ASIGNACION WHERE idAsignacion = ?',
        [asignacionId]
      );
    }
    
    await connection.commit();
    
    return {
      success: true,
      message: 'Asignación eliminada exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar asignación:', error);
    return { success: false, message: 'Error al eliminar la asignación' };
  } finally {
    connection.release();
  }
};

// Validar disponibilidad de horario para un evaluador
const validarDisponibilidadHorario = async (fechaInicio, fechaFin, horaInicio, horaFin, evaluadorId, excludeId = null) => {
  try {
    let query = `
      SELECT a.idAsignacion, a.fecha_inicio, a.fecha_fin, e.horaEvaluacion, e.tipo
      FROM ASIGNACION a
      JOIN DETALLE_ASIGNACION da ON a.idAsignacion = da.idAsignacion
      JOIN EVALUACION e ON da.idEvaluacion = e.idEvaluacion
      WHERE a.idUsuario = ? 
      AND a.estado = 'Activa'
      AND e.estado = 'Pendiente'
      AND (
        (a.fecha_inicio BETWEEN ? AND ?) OR
        (a.fecha_fin BETWEEN ? AND ?) OR
        (? BETWEEN a.fecha_inicio AND a.fecha_fin)
      )
    `;
    
    const params = [evaluadorId, fechaInicio, fechaFin, fechaInicio, fechaFin, fechaInicio];
    
    if (excludeId) {
      query += ' AND e.idEvaluacion != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    
    // Verificar conflictos de horario específicos
    for (const asignacion of rows) {
      const fechaAsignacion = asignacion.fecha_inicio.toISOString().split('T')[0];
      const horaAsignacion = asignacion.horaEvaluacion;
      
      // Si hay solapamiento de fechas y horarios
      if (fechaAsignacion >= fechaInicio && fechaAsignacion <= fechaFin) {
        if (horaAsignacion >= horaInicio && horaAsignacion <= horaFin) {
          return {
            disponible: false,
            message: `Ya existe una evaluación de ${asignacion.tipo} programada que se solapa con el horario seleccionado`
          };
        }
      }
    }
    
    return {
      disponible: true,
      message: 'Horario disponible'
    };
  } catch (error) {
    console.error('Error al validar disponibilidad:', error);
    return {
      disponible: false,
      message: 'Error al validar la disponibilidad del horario'
    };
  }
};

// Obtener usuarios evaluadores (con rol de Evaluador)
const getEvaluadores = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.idUsuario as id, u.nombre, tu.nombre as rol
       FROM USUARIO u
       JOIN TIPO_USUARIO tu ON u.idTipoUsu = tu.idTipoUsu
       WHERE u.vigencia = 1 
       AND tu.nombre = 'Evaluador'
       ORDER BY u.nombre`
    );
    
    return {
      success: true,
      evaluadores: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluadores:', error);
    return { success: false, message: 'Error al obtener los evaluadores' };
  }
};

module.exports = {
  createAsignacion,
  getAllAsignaciones,
  updateAsignacion,
  deleteAsignacion,
  validarDisponibilidadHorario,
  getEvaluadores
};
