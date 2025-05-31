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
    
    // Crear las 3 asignaciones
    for (const tipo of tiposEvaluacion) {
      const [result] = await pool.execute(
        `INSERT INTO ASIGNACION_EVALUACION 
         (fechaInicio, fechaFin, horaInicio, horaFin, tipoEvaluacion, estado, idUsuarioEvaluador, descripcion) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          asignacionData.fechaInicio,
          asignacionData.fechaFin,
          asignacionData.horaInicio,
          asignacionData.horaFin,
          tipo,
          'Pendiente',
          asignacionData.evaluadorId,
          asignacionData.descripcion || `Evaluación ${tipo} programada`
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

// Obtener todas las asignaciones
const getAllAsignaciones = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion as id, a.fechaInicio, a.fechaFin, 
       a.horaInicio, a.horaFin, a.tipoEvaluacion, a.estado, a.descripcion,
       u.nombre as evaluadorNombre, a.idUsuarioEvaluador as evaluadorId
       FROM ASIGNACION_EVALUACION a
       JOIN USUARIO u ON a.idUsuarioEvaluador = u.idUsuario
       ORDER BY a.fechaInicio DESC, a.horaInicio ASC`
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
      `UPDATE ASIGNACION_EVALUACION 
       SET fechaInicio = ?, fechaFin = ?, horaInicio = ?, horaFin = ?, 
           descripcion = ?
       WHERE idAsignacion = ?`,
      [
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        asignacionData.horaInicio,
        asignacionData.horaFin,
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

// Eliminar una asignación
const deleteAsignacion = async (asignacionId) => {
  try {
    await pool.execute('DELETE FROM ASIGNACION_EVALUACION WHERE idAsignacion = ?', [asignacionId]);
    
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
      SELECT idAsignacion, fechaInicio, fechaFin, horaInicio, horaFin, tipoEvaluacion
      FROM ASIGNACION_EVALUACION 
      WHERE idUsuarioEvaluador = ? 
      AND estado IN ('Pendiente', 'Activa')
      AND (
        (fechaInicio <= ? AND fechaFin >= ?) OR
        (fechaInicio <= ? AND fechaFin >= ?) OR
        (fechaInicio >= ? AND fechaFin <= ?)
      )
    `;
    
    const params = [evaluadorId, fechaFin, fechaInicio, fechaInicio, fechaInicio, fechaFin, fechaInicio, fechaFin];
    
    if (excludeId) {
      query += ' AND idAsignacion != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    
    // Verificar conflictos de horario específicos
    for (const asignacion of rows) {
      const inicioConflicto = new Date(`${asignacion.fechaInicio}T${asignacion.horaInicio}`);
      const finConflicto = new Date(`${asignacion.fechaFin}T${asignacion.horaFin}`);
      const inicioNuevo = new Date(`${fechaInicio}T${horaInicio}`);
      const finNuevo = new Date(`${fechaFin}T${horaFin}`);
      
      // Verificar solapamiento
      if (inicioNuevo < finConflicto && finNuevo > inicioConflicto) {
        return {
          disponible: false,
          message: `Ya existe una asignación de ${asignacion.tipoEvaluacion} del ${asignacion.fechaInicio} al ${asignacion.fechaFin} de ${asignacion.horaInicio} a ${asignacion.horaFin} que se solapa con el horario seleccionado`
        };
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

// Obtener usuarios evaluadores (colaboradores con rol de evaluator)
const getEvaluadores = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.idUsuario as id, 
       CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as nombre,
       tu.nombre as rol,
       c.idColaborador,
       u.correo
       FROM USUARIO u
       JOIN TIPO_USUARIO tu ON u.idTipoUsu = tu.idTipoUsu
       JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       WHERE u.estado = 1 
       AND tu.nombre = 'evaluator'
       AND c.estado = 1
       ORDER BY c.nombres, c.apePat, c.apeMat`
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
