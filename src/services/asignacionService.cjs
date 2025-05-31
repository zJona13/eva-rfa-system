
const { pool } = require('../utils/dbConnection.cjs');

// Crear una nueva asignación con las 3 evaluaciones automáticamente
const createAsignacion = async (asignacionData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Creando asignación con datos:', asignacionData);
    
    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (new Date(asignacionData.fechaFin) < new Date(asignacionData.fechaInicio)) {
      await connection.rollback();
      return {
        success: false,
        message: 'La fecha de finalización no puede ser anterior a la fecha de inicio'
      };
    }
    
    // Validar que la hora de fin no sea anterior a la hora de inicio en la misma fecha
    if (asignacionData.fechaInicio === asignacionData.fechaFin) {
      if (asignacionData.horaFin <= asignacionData.horaInicio) {
        await connection.rollback();
        return {
          success: false,
          message: 'La hora de finalización debe ser posterior a la hora de inicio cuando es el mismo día'
        };
      }
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
      await connection.rollback();
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
        new Date().getFullYear(), // Año actual como periodo
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        'Activa'
      ]
    );
    
    const asignacionId = asignacionResult.insertId;
    
    // Los 3 tipos de evaluación que se crearán automáticamente
    const tiposEvaluacion = ['Autoevaluacion', 'Estudiante', 'Checklist'];
    const evaluacionesCreadas = [];
    
    // Crear las 3 evaluaciones
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
      
      // Crear el detalle de asignación
      await connection.execute(
        `INSERT INTO DETALLE_ASIGNACION (idEvaluacion, idAsignacion) 
         VALUES (?, ?)`,
        [evaluacionResult.insertId, asignacionId]
      );
      
      evaluacionesCreadas.push({
        id: evaluacionResult.insertId,
        tipo: tipo
      });
    }
    
    await connection.commit();
    
    return {
      success: true,
      asignacion: {
        id: asignacionId,
        evaluaciones: evaluacionesCreadas
      },
      message: 'Asignación creada exitosamente con las 3 evaluaciones'
    };
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear asignación:', error);
    return { 
      success: false, 
      message: 'Error al crear la asignación de evaluaciones' 
    };
  } finally {
    connection.release();
  }
};

// Obtener todas las asignaciones con sus evaluaciones
const getAllAsignaciones = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion as id, a.periodo, a.fecha_inicio as fechaInicio, 
       a.fecha_fin as fechaFin, a.estado as estadoAsignacion,
       u.nombre as evaluadorNombre, u.idUsuario as evaluadorId,
       GROUP_CONCAT(
         CONCAT(e.idEvaluacion, ':', e.tipo, ':', e.estado, ':', e.horaEvaluacion)
         SEPARATOR '|'
       ) as evaluaciones
       FROM ASIGNACION a
       JOIN USUARIO u ON a.idUsuario = u.idUsuario
       LEFT JOIN DETALLE_ASIGNACION da ON a.idAsignacion = da.idAsignacion
       LEFT JOIN EVALUACION e ON da.idEvaluacion = e.idEvaluacion
       WHERE a.estado = 'Activa'
       GROUP BY a.idAsignacion
       ORDER BY a.fecha_inicio DESC`
    );
    
    // Procesar los datos para estructurar mejor las evaluaciones
    const asignaciones = rows.map(row => {
      const evaluaciones = [];
      if (row.evaluaciones) {
        const evalData = row.evaluaciones.split('|');
        evalData.forEach(eval => {
          const [id, tipo, estado, hora] = eval.split(':');
          evaluaciones.push({
            id: parseInt(id),
            tipo,
            estado,
            horaInicio: hora,
            horaFin: hora // Para compatibilidad con el frontend
          });
        });
      }
      
      return {
        id: row.id,
        periodo: row.periodo,
        fechaInicio: row.fechaInicio,
        fechaFin: row.fechaFin,
        evaluadorId: row.evaluadorId,
        evaluadorNombre: row.evaluadorNombre,
        estado: row.estadoAsignacion,
        evaluaciones: evaluaciones,
        // Para compatibilidad con el frontend existente
        horaInicio: evaluaciones[0]?.horaInicio || '',
        horaFin: evaluaciones[0]?.horaFin || '',
        tipoEvaluacion: evaluaciones.map(e => e.tipo).join(', '),
        descripcion: `Asignación del periodo ${row.periodo}`
      };
    });
    
    return {
      success: true,
      asignaciones: asignaciones
    };
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return { 
      success: false, 
      message: 'Error al obtener las asignaciones' 
    };
  }
};

// Actualizar una asignación
const updateAsignacion = async (asignacionId, asignacionData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Validar fechas
    if (new Date(asignacionData.fechaFin) < new Date(asignacionData.fechaInicio)) {
      await connection.rollback();
      return {
        success: false,
        message: 'La fecha de finalización no puede ser anterior a la fecha de inicio'
      };
    }
    
    // Validar horas en el mismo día
    if (asignacionData.fechaInicio === asignacionData.fechaFin) {
      if (asignacionData.horaFin <= asignacionData.horaInicio) {
        await connection.rollback();
        return {
          success: false,
          message: 'La hora de finalización debe ser posterior a la hora de inicio cuando es el mismo día'
        };
      }
    }
    
    // Actualizar la asignación
    await connection.execute(
      `UPDATE ASIGNACION 
       SET fecha_inicio = ?, fecha_fin = ?, idUsuario = ?
       WHERE idAsignacion = ?`,
      [
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        asignacionData.evaluadorId,
        asignacionId
      ]
    );
    
    // Actualizar las evaluaciones relacionadas
    await connection.execute(
      `UPDATE EVALUACION e
       JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
       SET e.fechaEvaluacion = ?, e.horaEvaluacion = ?, e.idUsuario = ?,
           e.comentario = ?
       WHERE da.idAsignacion = ?`,
      [
        asignacionData.fechaInicio,
        asignacionData.horaInicio,
        asignacionData.evaluadorId,
        asignacionData.descripcion || 'Evaluación actualizada',
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

// Eliminar una asignación
const deleteAsignacion = async (asignacionId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Obtener las evaluaciones relacionadas
    const [evaluaciones] = await connection.execute(
      `SELECT e.idEvaluacion 
       FROM EVALUACION e
       JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
       WHERE da.idAsignacion = ? AND e.estado = 'Pendiente'`,
      [asignacionId]
    );
    
    // Eliminar solo si todas las evaluaciones están pendientes
    if (evaluaciones.length > 0) {
      // Eliminar detalles de asignación
      await connection.execute(
        'DELETE FROM DETALLE_ASIGNACION WHERE idAsignacion = ?',
        [asignacionId]
      );
      
      // Eliminar evaluaciones pendientes
      for (const eval of evaluaciones) {
        await connection.execute(
          'DELETE FROM EVALUACION WHERE idEvaluacion = ? AND estado = "Pendiente"',
          [eval.idEvaluacion]
        );
      }
    }
    
    // Eliminar la asignación
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

// Validar disponibilidad de horario para un evaluador
const validarDisponibilidadHorario = async (fechaInicio, fechaFin, horaInicio, horaFin, evaluadorId, excludeId = null) => {
  try {
    let query = `
      SELECT a.idAsignacion, a.fecha_inicio, a.fecha_fin, u.nombre as evaluador
      FROM ASIGNACION a
      JOIN USUARIO u ON a.idUsuario = u.idUsuario
      WHERE a.idUsuario = ? 
      AND a.estado = 'Activa'
      AND (
        (a.fecha_inicio BETWEEN ? AND ?) OR
        (a.fecha_fin BETWEEN ? AND ?) OR
        (? BETWEEN a.fecha_inicio AND a.fecha_fin) OR
        (? BETWEEN a.fecha_inicio AND a.fecha_fin)
      )
    `;
    
    const params = [
      evaluadorId, 
      fechaInicio, fechaFin, 
      fechaInicio, fechaFin,
      fechaInicio, fechaFin
    ];
    
    if (excludeId) {
      query += ' AND a.idAsignacion != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    
    if (rows.length > 0) {
      const conflicto = rows[0];
      return {
        disponible: false,
        message: `El evaluador ${conflicto.evaluador} ya tiene una asignación activa del ${conflicto.fecha_inicio} al ${conflicto.fecha_fin} que se solapa con el horario seleccionado`
      };
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

// Obtener usuarios evaluadores
const getEvaluadores = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.idUsuario as id, u.nombre, tu.nombre as rol
       FROM USUARIO u
       JOIN TIPO_USUARIO tu ON u.idTipoUsu = tu.idTipoUsu
       WHERE u.vigencia = 1 
       AND (tu.nombre = 'Evaluador' OR tu.nombre = 'Administrador')
       ORDER BY u.nombre`
    );
    
    return {
      success: true,
      evaluadores: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluadores:', error);
    return { 
      success: false, 
      message: 'Error al obtener los evaluadores' 
    };
  }
};

// Obtener asignaciones por evaluador
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
  validarDisponibilidadHorario,
  getEvaluadores,
  getAsignacionesByEvaluador
};
