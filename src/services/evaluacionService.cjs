const { pool } = require('../utils/dbConnection.cjs');
const incidenciaService = require('./incidenciaService.cjs');

const UM_APROBACION = 11; // Umbral de aprobación para las evaluaciones (ej. 10 sobre 20)

// Función auxiliar para procesar el estado de una lista de evaluaciones
const processEvaluationsStatus = async (evaluaciones) => {
  const now = new Date();
  const updates = [];

  for (const evalItem of evaluaciones) {
    const fechaFin = new Date(evalItem.fechaFin);
    if (evalItem.horaFin) {
      const [h, m, s] = evalItem.horaFin.split(':');
      fechaFin.setHours(Number(h), Number(m), Number(s || 0));
    }

    let newStatus = evalItem.estado; // Mantener el estado actual por defecto

    // Si la evaluación ya está en un estado final, no la modificamos
    if (['Completada', 'Vencida', 'Aprobado', 'Desaprobado', 'Cancelada'].includes(evalItem.estado)) {
      continue;
    }

    if (now > fechaFin) {
      // Si el puntajeTotal es null o 0, y el período ha pasado, se considera 'Vencida'
      if (evalItem.puntajeTotal === null || evalItem.puntajeTotal === 0) {
        newStatus = 'Vencida';
      } else if (evalItem.puntajeTotal !== null) {
        // Si tiene puntaje y venció, se marca como 'Completada'.
        // El Aprobado/Desaprobado se maneja en el frontend.
        newStatus = 'Completada';
      }
    } else if (evalItem.puntajeTotal !== null && evalItem.puntajeTotal > 0 && evalItem.estado === 'Activo') {
      // Si la evaluación fue completada activamente (con puntaje) y está en 'Activo',
      // la marcamos como 'Completada'. El Aprobado/Desaprobado se maneja en el frontend.
      newStatus = 'Completada';
    }

    if (newStatus !== evalItem.estado) {
      updates.push({
        idEvaluacion: evalItem.idEvaluacion,
        newStatus: newStatus
      });
      evalItem.estado = newStatus; // Actualizar el objeto para la respuesta inmediata
    }
  }

  // Realizar todas las actualizaciones a la base de datos en una sola transacción si es posible,
  // o de forma individual si no se soporta batch update fácilmente.
  // Por simplicidad, se harán individuales por ahora. En un entorno de producción, considerar batch.
  for (const update of updates) {
    try {
      await pool.execute('UPDATE EVALUACION SET estado = ? WHERE idEvaluacion = ?', [update.newStatus, update.idEvaluacion]);
      console.log(`Evaluación ID ${update.idEvaluacion} estado actualizado a ${update.newStatus}`);
    } catch (error) {
      console.error(`Error al actualizar el estado de la evaluación ${update.idEvaluacion} a ${update.newStatus}:`, error);
    }
  }

  return evaluaciones; // Retornar las evaluaciones con los estados potencialmente actualizados
};

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
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Crear la evaluación principal
    const [evaluacionResult] = await conn.execute(
      'INSERT INTO EVALUACION (fechaEvaluacion, horaEvaluacion, puntajeTotal, comentario, estado, idAsignacion, idEvaluador, idEvaluado, idTipoEvaluacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        evaluacionData.date,
        evaluacionData.time,
        evaluacionData.score || 0,
        evaluacionData.comments || null,
        evaluacionData.status || 'Activo',
        evaluacionData.idAsignacion,
        evaluacionData.idEvaluador,
        evaluacionData.idEvaluado,
        evaluacionData.idTipoEvaluacion
      ]
    );
    const evaluacionId = evaluacionResult.insertId;
    // Insertar detalles de subcriterios
    if (Array.isArray(evaluacionData.detalles)) {
      for (const detalle of evaluacionData.detalles) {
        await conn.execute(
          'INSERT INTO DETALLE_EVALUACION (puntaje, idEvaluacion, idSubCriterio) VALUES (?, ?, ?)',
          [detalle.puntaje, evaluacionId, detalle.idSubCriterio]
        );
      }
    }
    await conn.commit();
    return {
      success: true,
      evaluacionId: evaluacionId,
      message: 'Evaluación creada exitosamente'
    };
  } catch (error) {
    await conn.rollback();
    console.error('Error al crear evaluación:', error);
    return { success: false, message: 'Error al crear la evaluación' };
  } finally {
    conn.release();
  }
};

// Actualizar una evaluación - SIMPLIFICADO
const updateEvaluacion = async (evaluacionId, evaluacionData) => {
  console.log('Iniciando actualización de evaluación:', { evaluacionId, evaluacionData });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Obtener la evaluación actual y las fechas de la asignación
    console.log('Obteniendo estado actual de la evaluación y fechas de asignación...');
    const [rows] = await conn.execute(
      `SELECT e.estado, e.puntajeTotal, a.fechaFin, a.horaFin 
       FROM EVALUACION e
       JOIN ASIGNACION a ON e.idAsignacion = a.idAsignacion
       WHERE e.idEvaluacion = ?`,
      [evaluacionId]
    );
    
    if (rows.length === 0) {
      console.warn('Advertencia (updateEvaluacion): Evaluación no encontrada para ID:', evaluacionId);
      await conn.rollback();
      return { success: false, message: 'Evaluación no encontrada' };
    }
    
    const evaluacion = rows[0];
    console.log('Estado actual de la evaluación:', evaluacion.estado);
    console.log('Fechas de asignación asociadas:', { fechaFin: evaluacion.fechaFin, horaFin: evaluacion.horaFin });
    
    // Solo restringir si está pendiente o activa
    if (evaluacion.estado === 'Pendiente' || evaluacion.estado === 'Activo') {
      const ahora = new Date();
      const fechaLimite = new Date(evaluacion.fechaFin);
      if (evaluacion.horaFin) {
        const [h, m, s] = evaluacion.horaFin.split(':');
        fechaLimite.setHours(Number(h), Number(m), Number(s || 0));
      }
      console.log('Fecha y hora actuales:', ahora.toISOString());
      console.log('Fecha y hora límite de asignación:', fechaLimite.toISOString());
      
      if (ahora > fechaLimite) {
        console.warn('Advertencia (updateEvaluacion): Fecha límite excedida para la evaluación ID:', evaluacionId);
        let nuevoEstado;
        // Determinar el nuevo estado si la fecha límite ha sido excedida
        // Si la evaluación ya tiene un puntaje (lo que implica que fue completada), se marca como 'Completada'.
        // Si no tiene puntaje o es 0 (y no ha sido marcada como Completada), se marca como 'Vencida'.
        if (evaluacion.puntajeTotal !== null && evaluacion.puntajeTotal > 0) {
          nuevoEstado = 'Completada';
          console.log(`Evaluación ID ${evaluacionId} pasada a estado 'Completada' por fecha límite (con puntaje).`);
        } else {
          nuevoEstado = 'Vencida'; // Nuevo estado para evaluaciones no completadas y fuera de plazo
          console.log(`Evaluación ID ${evaluacionId} pasada a estado 'Vencida' por fecha límite (sin completar).`);
        }
        await conn.execute('UPDATE EVALUACION SET estado = ? WHERE idEvaluacion = ?', [nuevoEstado, evaluacionId]);
        await conn.commit();
        // Si la evaluación ya ha pasado la fecha límite y se actualizó su estado, no permitimos más ediciones.
        return { success: false, message: `No se puede editar la evaluación porque ha pasado la fecha límite de la asignación y ha sido marcada como '${nuevoEstado}'.` };
      }
    }
    
    // Si la evaluación se está actualizando y se marca como 'Completada' por el frontend,
    // y tiene un puntaje total, NO actualizamos su estado a Aprobado/Desaprobado aquí.
    // Solo se actualizará el estado a 'Completada' si se envía así desde el frontend.
    // El Aprobado/Desaprobado se manejará en el frontend.
    if (evaluacionData.status === 'Completada' && evaluacionData.puntajeTotal !== undefined && evaluacionData.puntajeTotal !== null) {
      console.log(`Evaluación ID ${evaluacionId} marcada como 'Completada' por el frontend.`);
    }

    // Actualizar la evaluación principal
    console.log('Actualizando la evaluación principal...');
    const updateQuery = 'UPDATE EVALUACION SET puntajeTotal = ?, comentario = ?, estado = ? WHERE idEvaluacion = ?';
    const updateParams = [
      evaluacionData.puntajeTotal,
      evaluacionData.comentario,
      evaluacionData.status,
      evaluacionId
    ];
    console.log('Query UPDATE:', updateQuery);
    console.log('Params UPDATE:', updateParams);
    await conn.execute(updateQuery, updateParams);

    // Eliminar detalles anteriores de la evaluación
    console.log('Eliminando detalles anteriores para evaluacion ID:', evaluacionId);
    await conn.execute('DELETE FROM DETALLE_EVALUACION WHERE idEvaluacion = ?', [evaluacionId]);

    // Insertar nuevos detalles de subcriterios
    if (Array.isArray(evaluacionData.detalles)) {
      console.log('Insertando nuevos detalles de subcriterios:', evaluacionData.detalles.length);
      for (const detalle of evaluacionData.detalles) {
        await conn.execute(
          'INSERT INTO DETALLE_EVALUACION (puntaje, idEvaluacion, idSubCriterio) VALUES (?, ?, ?)',
          [detalle.puntaje, evaluacionId, detalle.idSubCriterio]
        );
      }
    }
    
    await conn.commit();
    console.log('Transacción de actualización de evaluación completada exitosamente para ID:', evaluacionId);
    return {
      success: true,
      message: 'Evaluación actualizada exitosamente'
    };
  } catch (error) {
    await conn.rollback();
    console.error('Error en updateEvaluacion (rollback realizado):', error.message, error.stack);
    return { success: false, message: 'Error al actualizar la evaluación' };
  } finally {
    conn.release();
    console.log('Conexión de base de datos liberada.');
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

// Obtener criterios y subcriterios por tipo de evaluación
const getCriteriosYSubcriteriosPorTipoEvaluacion = async (idTipoEvaluacion) => {
  try {
    // Obtener criterios asociados al tipo de evaluación
    const [criterios] = await pool.execute(
      `SELECT c.idCriterio, c.nombre
       FROM TIPO_EVALUACION_CRITERIO tec
       JOIN CRITERIO c ON tec.idCriterio = c.idCriterio
       WHERE tec.idTipoEvaluacion = ?
       ORDER BY c.idCriterio`,
      [idTipoEvaluacion]
    );
    // Para cada criterio, obtener sus subcriterios
    for (const criterio of criterios) {
      const [subcriterios] = await pool.execute(
        `SELECT idSubCriterio, nombre
         FROM SUB_CRITERIO
         WHERE idCriterio = ?
         ORDER BY idSubCriterio`,
        [criterio.idCriterio]
      );
      criterio.subcriterios = subcriterios;
    }
    return { success: true, criterios };
  } catch (error) {
    console.error('Error al obtener criterios y subcriterios por tipo de evaluación:', error);
    return { success: false, message: 'Error al obtener criterios y subcriterios' };
  }
};

// Nueva función: Obtener evaluaciones por usuario evaluador y tipo, sin filtro de estado
const getEvaluacionesByEvaluadorAndTipoAllStates = async (idEvaluador, idTipoEvaluacion) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion, e.fechaEvaluacion, e.horaEvaluacion, 
              e.puntajeTotal, e.comentario, e.estado,
              a.periodo, a.fechaInicio, a.fechaFin, a.horaInicio, a.horaFin,
              ar.nombre as areaNombre,
              CASE 
                WHEN e.idTipoEvaluacion = 1 THEN CONCAT(ce.nombreColaborador, ' ', ce.apePaColaborador, ' ', ce.apeMaColaborador)
                WHEN e.idTipoEvaluacion = 2 THEN CONCAT(ce.nombreColaborador, ' ', ce.apePaColaborador, ' ', ce.apeMaColaborador)
                WHEN e.idTipoEvaluacion = 3 THEN CONCAT(ce.nombreColaborador, ' ', ce.apePaColaborador, ' ', ce.apeMaColaborador)
              END as nombreEvaluado,
              CASE 
                WHEN e.idTipoEvaluacion = 1 THEN 'Estudiante al Docente'
                WHEN e.idTipoEvaluacion = 2 THEN 'Supervisor al Docente'
                WHEN e.idTipoEvaluacion = 3 THEN 'Autoevaluación'
              END as tipoEvaluacionNombre
       FROM EVALUACION e
       JOIN ASIGNACION a ON e.idAsignacion = a.idAsignacion
       JOIN AREA ar ON a.idArea = ar.idArea
       JOIN USUARIO ue ON e.idEvaluado = ue.idUsuario
       LEFT JOIN COLABORADOR ce ON ue.idColaborador = ce.idColaborador
       WHERE e.idEvaluador = ? AND e.idTipoEvaluacion = ?
       ORDER BY a.periodo DESC, e.fechaEvaluacion DESC`,
      [idEvaluador, idTipoEvaluacion]
    );
    
    const processedEvaluations = await processEvaluationsStatus(rows); // Procesa los estados aquí

    return {
      success: true,
      evaluaciones: processedEvaluations
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones por evaluador y tipo (todos los estados):', error);
    return { success: false, message: 'Error al obtener evaluaciones' };
  }
};

// NUEVO: Función para cancelar evaluaciones en estado 'Activo' o 'Pendiente' que han excedido su fecha límite y no tienen puntaje
const cancelarBorradoresVencidos = async () => {
  console.log('Ejecutando cancelación de evaluaciones vencidas...');
  const now = new Date();
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion, a.fechaFin, a.horaFin, e.puntajeTotal, e.estado
       FROM EVALUACION e
       JOIN ASIGNACION a ON e.idAsignacion = a.idAsignacion
       WHERE e.estado IN ('Activo', 'Pendiente')` // Incluir 'Pendiente' también
    );

    for (const evaluacion of rows) {
      const fechaLimite = new Date(evaluacion.fechaFin);
      if (evaluacion.horaFin) {
        const [h, m, s] = evaluacion.horaFin.split(':');
        fechaLimite.setHours(Number(h), Number(m), Number(s || 0));
      }

      if (now > fechaLimite) {
        let newStatus;
        if (evaluacion.puntajeTotal === null || evaluacion.puntajeTotal === 0) {
          newStatus = 'Vencida'; // Si no hay puntaje o es 0, y venció, se marca como Vencida
        } else {
          newStatus = 'Completada'; // Si hay puntaje, se marca como Completada. El Aprobado/Desaprobado se manejará en frontend.
        }

        if (newStatus !== evaluacion.estado) {
          await pool.execute('UPDATE EVALUACION SET estado = ? WHERE idEvaluacion = ?', [newStatus, evaluacion.idEvaluacion]);
          console.log(`Evaluación ID ${evaluacion.idEvaluacion} (estado ${evaluacion.estado}) actualizada a ${newStatus} por fecha de vencimiento.`);
        }
      }
    }
    console.log('Proceso de cancelación de evaluaciones vencidas finalizado.');
  } catch (error) {
    console.error('Error en cancelarBorradoresVencidos:', error);
  }
};

// Actualizar estado de evaluación
const updateEvaluacionEstado = async (evaluacionId, estado) => {
  try {
    // Obtener datos de la evaluación antes de actualizar
    const [evaluacion] = await pool.execute(
      'SELECT * FROM EVALUACION WHERE idEvaluacion = ?',
      [evaluacionId]
    );

    if (evaluacion.length === 0) {
      return { success: false, message: 'Evaluación no encontrada' };
    }

    const evaluacionData = evaluacion[0];

    // Actualizar estado
    await pool.execute(
      'UPDATE EVALUACION SET estado = ? WHERE idEvaluacion = ?',
      [estado, evaluacionId]
    );

    // Generar incidencia si corresponde
    if (estado === 'Cancelada') {
      await incidenciaService.generarIncidenciaEvaluacionCancelada(evaluacionData);
    } else if (estado === 'Completada' && evaluacionData.puntajeTotal < 11) {
      await incidenciaService.generarIncidenciaEvaluacionDesaprobada(evaluacionData);
    }

    return {
      success: true,
      message: 'Estado de evaluación actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar estado de evaluación:', error);
    return { success: false, message: 'Error al actualizar el estado de la evaluación' };
  }
};

/**
 * Ejemplo de payload para crear una evaluación:
 * {
 *   date: '2024-06-01',
 *   time: '10:00',
 *   score: 18.5,
 *   comments: 'Buen desempeño',
 *   status: 'Activo',
 *   idAsignacion: 1,
 *   idEvaluador: 2,
 *   idEvaluado: 3,
 *   idTipoEvaluacion: 1, // 1=Estudiante, 2=Evaluador, 3=Autoevaluación
 *   detalles: [
 *     { idSubCriterio: 5, puntaje: 4 },
 *     { idSubCriterio: 6, puntaje: 5 }
 *   ]
 * }
 *
 * Para obtener criterios y subcriterios de un tipo de evaluación:
 * GET /api/evaluaciones/criterios/:idTipoEvaluacion
 */

module.exports = {
  getAllEvaluaciones,
  getEvaluacionesByEvaluador,
  getEvaluacionesByColaborador,
  createEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  getColaboradoresParaEvaluar,
  getColaboradorByUserId,
  getCriteriosYSubcriteriosPorTipoEvaluacion,
  getEvaluacionesByEvaluadorAndTipoAllStates,
  cancelarBorradoresVencidos,
  updateEvaluacionEstado
};