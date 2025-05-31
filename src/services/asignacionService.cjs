
const { pool } = require('../utils/dbConnection.cjs');

// Crear asignaciones para las 3 evaluaciones de una vez
const createAsignacion = async (asignacionData) => {
  try {
    console.log('Creando asignaciones con datos:', asignacionData);
    
    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (new Date(asignacionData.fechaFin) < new Date(asignacionData.fechaInicio)) {
      return {
        success: false,
        message: 'La fecha de finalización no puede ser anterior a la fecha de inicio'
      };
    }
    
    // Validar que la hora de fin no sea anterior a la hora de inicio en la misma fecha
    if (asignacionData.fechaInicio === asignacionData.fechaFin) {
      if (asignacionData.horaFin <= asignacionData.horaInicio) {
        return {
          success: false,
          message: 'La hora de finalización debe ser posterior a la hora de inicio cuando es el mismo día'
        };
      }
    }
    
    // Validar que no haya conflictos de horario con otras asignaciones del mismo evaluador
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
    
    // Los 3 tipos de evaluación que se crearán automáticamente
    const tiposEvaluacion = ['Autoevaluacion', 'Estudiante', 'Checklist'];
    const asignacionesCreadas = [];
    
    // Crear las 3 evaluaciones programadas usando la tabla EVALUACION
    for (const tipo of tiposEvaluacion) {
      const [result] = await pool.execute(
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
          asignacionData.descripcion || `Evaluación ${tipo} programada para ${asignacionData.fechaInicio}`
        ]
      );
      
      asignacionesCreadas.push({
        id: result.insertId,
        tipo: tipo
      });
    }
    
    return {
      success: true,
      asignaciones: asignacionesCreadas,
      message: 'Las 3 evaluaciones han sido asignadas exitosamente'
    };
  } catch (error) {
    console.error('Error al crear asignaciones:', error);
    return { success: false, message: 'Error al crear las asignaciones de evaluación' };
  }
};

// Obtener todas las asignaciones (evaluaciones programadas)
const getAllAsignaciones = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion as id, e.fechaEvaluacion as fechaInicio, e.fechaEvaluacion as fechaFin, 
       e.horaEvaluacion as horaInicio, e.horaEvaluacion as horaFin, 
       e.tipo as tipoEvaluacion, e.estado, e.comentario as descripcion,
       u.nombre as evaluadorNombre, e.idUsuario as evaluadorId
       FROM EVALUACION e
       JOIN USUARIO u ON e.idUsuario = u.idUsuario
       WHERE e.estado = 'Pendiente'
       ORDER BY e.fechaEvaluacion DESC, e.horaEvaluacion ASC`
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

// Actualizar una asignación (evaluación programada)
const updateAsignacion = async (asignacionId, asignacionData) => {
  try {
    // Validar fechas
    if (new Date(asignacionData.fechaFin) < new Date(asignacionData.fechaInicio)) {
      return {
        success: false,
        message: 'La fecha de finalización no puede ser anterior a la fecha de inicio'
      };
    }
    
    // Validar horas en el mismo día
    if (asignacionData.fechaInicio === asignacionData.fechaFin) {
      if (asignacionData.horaFin <= asignacionData.horaInicio) {
        return {
          success: false,
          message: 'La hora de finalización debe ser posterior a la hora de inicio cuando es el mismo día'
        };
      }
    }
    
    // Validar disponibilidad (excluyendo la asignación actual)
    const conflicto = await validarDisponibilidadHorario(
      asignacionData.fechaInicio,
      asignacionData.fechaFin,
      asignacionData.horaInicio,
      asignacionData.horaFin,
      asignacionData.evaluadorId,
      asignacionId
    );
    
    if (!conflicto.disponible) {
      return {
        success: false,
        message: conflicto.message
      };
    }
    
    await pool.execute(
      `UPDATE EVALUACION 
       SET fechaEvaluacion = ?, horaEvaluacion = ?, comentario = ?
       WHERE idEvaluacion = ?`,
      [
        asignacionData.fechaInicio,
        asignacionData.horaInicio,
        asignacionData.descripcion,
        asignacionId
      ]
    );
    
    return {
      success: true,
      message: 'Asignación actualizada exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    return { success: false, message: 'Error al actualizar la asignación' };
  }
};

// Eliminar una asignación (evaluación programada)
const deleteAsignacion = async (asignacionId) => {
  try {
    await pool.execute('DELETE FROM EVALUACION WHERE idEvaluacion = ? AND estado = "Pendiente"', [asignacionId]);
    
    return {
      success: true,
      message: 'Asignación eliminada exitosamente'
    };
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    return { success: false, message: 'Error al eliminar la asignación' };
  }
};

// Validar disponibilidad de horario para un evaluador
const validarDisponibilidadHorario = async (fechaInicio, fechaFin, horaInicio, horaFin, evaluadorId, excludeId = null) => {
  try {
    let query = `
      SELECT idEvaluacion, fechaEvaluacion, horaEvaluacion, tipo
      FROM EVALUACION 
      WHERE idUsuario = ? 
      AND estado = 'Pendiente'
      AND fechaEvaluacion BETWEEN ? AND ?
    `;
    
    const params = [evaluadorId, fechaInicio, fechaFin];
    
    if (excludeId) {
      query += ' AND idEvaluacion != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    
    // Verificar conflictos de horario específicos
    for (const evaluacion of rows) {
      const fechaEvaluacion = evaluacion.fechaEvaluacion.toISOString().split('T')[0];
      const horaEvaluacion = evaluacion.horaEvaluacion;
      
      // Si es el mismo día, verificar solapamiento de horarios
      if (fechaEvaluacion >= fechaInicio && fechaEvaluacion <= fechaFin) {
        if (horaEvaluacion >= horaInicio && horaEvaluacion <= horaFin) {
          return {
            disponible: false,
            message: `Ya existe una evaluación de ${evaluacion.tipo} programada para el ${fechaEvaluacion} a las ${horaEvaluacion} que se solapa con el horario seleccionado`
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
