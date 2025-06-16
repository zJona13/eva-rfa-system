const { pool } = require('../utils/dbConnection.cjs');

// Crear una nueva incidencia
const createIncidencia = async (incidenciaData) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO INCIDENCIA (fechaIncidencia, horaIncidencia, descripcion, estado, tipo, idUsuarioReportador, idUsuarioAfectado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        incidenciaData.fecha,
        incidenciaData.hora,
        incidenciaData.descripcion,
        'En proceso', // Estado por defecto siempre "En proceso"
        incidenciaData.tipo,
        incidenciaData.reportadorId,
        incidenciaData.afectadoId
      ]
    );
    
    const incidenciaId = result.insertId;
    
    // Crear notificación automáticamente
    await pool.execute(
      'INSERT INTO NOTIFICACION (fechaNotificacion, horaNotificacion, mensaje, leido, idUsuario, idIncidencia) VALUES (?, ?, ?, ?, ?, ?)',
      [
        incidenciaData.fecha,
        incidenciaData.hora,
        `Se ha creado una incidencia por evaluación desaprobatoria: ${incidenciaData.descripcion}`,
        false,
        incidenciaData.afectadoId,
        incidenciaId
      ]
    );
    
    return {
      success: true,
      incidenciaId: incidenciaId,
      message: 'Incidencia creada exitosamente'
    };
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    return { success: false, message: 'Error al crear la incidencia' };
  }
};

// Generar incidencia por evaluación cancelada (fuera de fecha/hora límite)
const generarIncidenciaEvaluacionCancelada = async (evaluacionData) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO INCIDENCIA (fecha, hora, descripcion, tipo, estado, idUsuarioReportador, idUsuarioAfectado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        new Date().toISOString().split('T')[0],
        new Date().toTimeString().split(' ')[0],
        `Evaluación cancelada por superar fecha/hora límite. Asignación: ${evaluacionData.idAsignacion}`,
        'Administrativa',
        'Pendiente',
        evaluacionData.idEvaluador,
        evaluacionData.idEvaluado
      ]
    );

    // Crear notificación
    await pool.execute(
      'INSERT INTO NOTIFICACION (descripcion, fechaEnvio, horaEnvio, leido, idUsuario, idIncidencia) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'Se ha generado una incidencia por evaluación cancelada por superar fecha/hora límite',
        new Date().toISOString().split('T')[0],
        new Date().toTimeString().split(' ')[0],
        'Activo',
        evaluacionData.idEvaluado,
        result.insertId
      ]
    );

    return { success: true, incidenciaId: result.insertId };
  } catch (error) {
    console.error('Error al generar incidencia por evaluación cancelada:', error);
    return { success: false, message: 'Error al generar la incidencia' };
  }
};

// Generar incidencia por evaluación desaprobada
const generarIncidenciaEvaluacionDesaprobada = async (evaluacionData) => {
  try {
    // Obtener detalles de la evaluación desaprobada
    const [detalles] = await pool.execute(
      `SELECT sc.nombre as subCriterio, de.puntaje, c.nombre as criterio
       FROM DETALLE_EVALUACION de
       JOIN SUB_CRITERIO sc ON de.idSubCriterio = sc.idSubCriterio
       JOIN CRITERIO c ON sc.idCriterio = c.idCriterio
       WHERE de.idEvaluacion = ? AND de.puntaje < 11`,
      [evaluacionData.idEvaluacion]
    );

    const criteriosBajos = detalles.map(d => `${d.criterio}: ${d.subCriterio} (${d.puntaje}/20)`).join('\n');
    
    const [result] = await pool.execute(
      'INSERT INTO INCIDENCIA (fecha, hora, descripcion, tipo, estado, idUsuarioReportador, idUsuarioAfectado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        new Date().toISOString().split('T')[0],
        new Date().toTimeString().split(' ')[0],
        `Evaluación desaprobada (${evaluacionData.puntajeTotal}/20). Criterios a mejorar:\n${criteriosBajos}`,
        'Académica',
        'Pendiente',
        evaluacionData.idEvaluador,
        evaluacionData.idEvaluado
      ]
    );

    // Crear notificación
    await pool.execute(
      'INSERT INTO NOTIFICACION (descripcion, fechaEnvio, horaEnvio, leido, idUsuario, idIncidencia) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'Se ha generado una incidencia por evaluación desaprobada. Revise los criterios a mejorar.',
        new Date().toISOString().split('T')[0],
        new Date().toTimeString().split(' ')[0],
        'Activo',
        evaluacionData.idEvaluado,
        result.insertId
      ]
    );

    return { success: true, incidenciaId: result.insertId };
  } catch (error) {
    console.error('Error al generar incidencia por evaluación desaprobada:', error);
    return { success: false, message: 'Error al generar la incidencia' };
  }
};

// Obtener el área del usuario
const getUserArea = async (userId) => {
  try {
    const [rows] = await pool.execute(
      'SELECT u.idArea, a.nombre as areaNombre FROM USUARIO u JOIN AREA a ON u.idArea = a.idArea WHERE u.idUsuario = ?',
      [userId]
    );
    
    console.log('Datos del área del usuario:', rows[0]); // Debug log
    
    if (!rows[0]) {
      console.error('No se encontró el área para el usuario:', userId);
      return null;
    }
    
    return rows[0].idArea;
  } catch (error) {
    console.error('Error al obtener área del usuario:', error);
    return null;
  }
};

// Obtener incidencias según el rol del usuario
const getIncidenciasByUser = async (userId, userRole) => {
  try {
    // Obtener el área del usuario
    const userArea = await getUserArea(userId);
    
    if (!userArea && userRole.toLowerCase() !== 'administrador') {
      return { success: false, message: 'No se pudo determinar el área del usuario' };
    }

    console.log('Área del usuario:', userArea); // Debug log

    let query = `
      SELECT i.idIncidencia as id, i.fecha as fecha, 
      i.hora as hora, i.descripcion, i.estado, i.tipo,
      i.accionTomada,
      CASE 
        WHEN cr.idColaborador IS NOT NULL 
        THEN CONCAT(cr.nombreColaborador, ' ', cr.apePaColaborador, ' ', cr.apeMaColaborador)
        ELSE ur.correo 
      END as reportadorNombre,
      CASE 
        WHEN ca.idColaborador IS NOT NULL 
        THEN CONCAT(ca.nombreColaborador, ' ', ca.apePaColaborador, ' ', ca.apeMaColaborador)
        ELSE ua.correo 
      END as afectadoNombre,
      a.nombre as areaNombre
      FROM INCIDENCIA i
      JOIN USUARIO ur ON i.idUsuarioReportador = ur.idUsuario
      JOIN USUARIO ua ON i.idUsuarioAfectado = ua.idUsuario
      LEFT JOIN COLABORADOR cr ON ur.idColaborador = cr.idColaborador
      LEFT JOIN COLABORADOR ca ON ua.idColaborador = ca.idColaborador
      JOIN AREA a ON ua.idArea = a.idArea
    `;

    const params = [];
    const normalizedRole = userRole.toLowerCase();

    // Filtrar según el rol
    switch (normalizedRole) {
      case 'administrador':
        // Los administradores ven todas las incidencias
        break;
      case 'evaluador':
        // Los evaluadores ven las incidencias de su área
        query += ' WHERE ur.idArea = ?';
        params.push(userArea);
        break;
      case 'estudiante':
        // Los estudiantes ven las incidencias de su área
        query += ' WHERE ur.idArea = ?';
        params.push(userArea);
        break;
      case 'evaluado':
        // Los evaluados ven sus propias incidencias
        query += ' WHERE i.idUsuarioAfectado = ?';
        params.push(userId);
        break;
      default:
        // Otros roles solo ven sus propias incidencias
        query += ' WHERE i.idUsuarioReportador = ? OR i.idUsuarioAfectado = ?';
        params.push(userId, userId);
    }

    query += ' ORDER BY i.fecha DESC, i.hora DESC';

    console.log('Query:', query); // Debug log
    console.log('Params:', params); // Debug log
    console.log('User Role:', userRole); // Debug log
    console.log('Normalized Role:', normalizedRole); // Debug log

    const [rows] = await pool.execute(query, params);
    
    return {
      success: true,
      incidencias: rows
    };
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    return { success: false, message: 'Error al obtener las incidencias del usuario' };
  }
};

// Obtener todas las incidencias con nombres completos de colaboradores
const getAllIncidencias = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT i.idIncidencia as id, i.fecha as fecha, 
      i.hora as hora, i.descripcion, i.estado, i.tipo,
      i.accionTomada,
      CASE 
        WHEN cr.idColaborador IS NOT NULL 
        THEN CONCAT(cr.nombreColaborador, ' ', cr.apePaColaborador, ' ', cr.apeMaColaborador)
        ELSE ur.correo 
      END as reportadorNombre,
      CASE 
        WHEN ca.idColaborador IS NOT NULL 
        THEN CONCAT(ca.nombreColaborador, ' ', ca.apePaColaborador, ' ', ca.apeMaColaborador)
        ELSE ua.correo 
      END as afectadoNombre
      FROM INCIDENCIA i
      JOIN USUARIO ur ON i.idUsuarioReportador = ur.idUsuario
      JOIN USUARIO ua ON i.idUsuarioAfectado = ua.idUsuario
      LEFT JOIN COLABORADOR cr ON ur.idColaborador = cr.idColaborador
      LEFT JOIN COLABORADOR ca ON ua.idColaborador = ca.idColaborador
      ORDER BY i.fecha DESC, i.hora DESC`
    );
    
    return {
      success: true,
      incidencias: rows
    };
  } catch (error) {
    console.error('Error al obtener todas las incidencias:', error);
    return { success: false, message: 'Error al obtener las incidencias' };
  }
};

// Actualizar estado de incidencia
const updateIncidenciaEstado = async (incidenciaId, estado, userRole) => {
  try {
    // Verificar permisos según el rol
    if (userRole.toLowerCase() === 'administrador') {
      // El administrador puede cambiar el estado de cualquier incidencia
      await pool.execute(
        'UPDATE INCIDENCIA SET estado = ? WHERE idIncidencia = ?',
        [estado, incidenciaId]
      );
    } else if (userRole.toLowerCase() === 'evaluador') {
      // El evaluador solo puede cambiar el estado de incidencias en su área
      await pool.execute(
        `UPDATE INCIDENCIA i
         JOIN USUARIO u ON i.idUsuarioAfectado = u.idUsuario
         SET i.estado = ?
         WHERE i.idIncidencia = ? AND u.idArea = ?`,
        [estado, incidenciaId, userArea]
      );
    } else {
      return { success: false, message: 'No tiene permisos para actualizar el estado de la incidencia' };
    }
    
    return {
      success: true,
      message: 'Estado de incidencia actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar incidencia:', error);
    return { success: false, message: 'Error al actualizar la incidencia' };
  }
};

module.exports = {
  createIncidencia,
  generarIncidenciaEvaluacionCancelada,
  generarIncidenciaEvaluacionDesaprobada,
  getIncidenciasByUser,
  getAllIncidencias,
  updateIncidenciaEstado
};
