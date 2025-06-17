const { pool } = require('../utils/dbConnection.cjs');

// Crear una nueva incidencia
const createIncidencia = async (incidenciaData) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [result] = await conn.execute(
      'INSERT INTO INCIDENCIA (fecha, hora, descripcion, estado, tipo, idUsuarioReportador, idUsuarioAfectado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        incidenciaData.fecha,
        incidenciaData.hora,
        incidenciaData.descripcion,
        'Pendiente', // Estado por defecto siempre "Pendiente"
        incidenciaData.tipo,
        incidenciaData.reportadorId,
        incidenciaData.afectadoId
      ]
    );
    const incidenciaId = result.insertId;
    // Crear notificación automáticamente
    await conn.execute(
      'INSERT INTO NOTIFICACION (descripcion, fechaEnvio, horaEnvio, leido, idUsuario, idIncidencia) VALUES (?, ?, ?, ?, ?, ?)',
      [
        `Se ha creado una incidencia: ${incidenciaData.descripcion}`,
        incidenciaData.fecha,
        incidenciaData.hora,
        'Activo',
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
  } finally {
    if (conn) conn.release();
  }
};

// Obtener incidencias por usuario con nombres completos de colaboradores
const getIncidenciasByUser = async (userId, userRole, userArea) => {
  try {
    // Validaciones para evitar undefined
    if (!userId) {
      throw new Error('El ID de usuario es requerido');
    }
    if (!userRole) {
      throw new Error('El rol del usuario es requerido');
    }

    // Normalizar el rol del usuario
    const normalizedRole = userRole.toLowerCase();
    const isAdmin = normalizedRole === 'admin' || normalizedRole === 'administrador';
    const isEvaluator = normalizedRole === 'evaluator' || normalizedRole === 'evaluador';
    const isStudent = normalizedRole === 'student' || normalizedRole === 'estudiante';

    if ((isEvaluator || isStudent) && (userArea === undefined || userArea === null)) {
      throw new Error('El área del usuario es requerida para este rol');
    }

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
      ur.idArea as areaReportador,
      ua.idArea as areaAfectado
      FROM INCIDENCIA i
      JOIN USUARIO ur ON i.idUsuarioReportador = ur.idUsuario
      JOIN USUARIO ua ON i.idUsuarioAfectado = ua.idUsuario
      LEFT JOIN COLABORADOR cr ON ur.idColaborador = cr.idColaborador
      LEFT JOIN COLABORADOR ca ON ua.idColaborador = ca.idColaborador
    `;

    let params = [];

    // Filtrar según el rol del usuario
    if (isAdmin) {
      // Los administradores ven todas las incidencias
      query += ' ORDER BY i.fecha DESC, i.hora DESC';
    } else if (isEvaluator) {
      // Los evaluadores ven las incidencias de su área
      query += ' WHERE ur.idArea = ? OR ua.idArea = ? ORDER BY i.fecha DESC, i.hora DESC';
      params = [userArea, userArea];
    } else if (isStudent) {
      // Los estudiantes solo ven sus propias incidencias
      query += ' WHERE i.idUsuarioReportador = ? OR i.idUsuarioAfectado = ? ORDER BY i.fecha DESC, i.hora DESC';
      params = [userId, userId];
    } else {
      // Otros roles solo ven sus propias incidencias
      query += ' WHERE i.idUsuarioReportador = ? OR i.idUsuarioAfectado = ? ORDER BY i.fecha DESC, i.hora DESC';
      params = [userId, userId];
    }

    console.log('Executing query:', { query, params, userRole, normalizedRole });

    const [rows] = await pool.execute(query, params);
    
    return {
      success: true,
      incidencias: rows
    };
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    return { success: false, message: error.message || 'Error al obtener las incidencias del usuario' };
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
const updateIncidenciaEstado = async (incidenciaId, estado, userId, userRole, userArea) => {
  try {
    console.log('Updating incident status in service:', { incidenciaId, estado, userId, userRole, userArea });

    // Verificar permisos
    const [incidencia] = await pool.execute(
      `SELECT i.*, ur.idArea as areaReportador, ua.idArea as areaAfectado
       FROM INCIDENCIA i
       JOIN USUARIO ur ON i.idUsuarioReportador = ur.idUsuario
       JOIN USUARIO ua ON i.idUsuarioAfectado = ua.idUsuario
       WHERE i.idIncidencia = ?`,
      [incidenciaId]
    );

    if (incidencia.length === 0) {
      return { success: false, message: 'Incidencia no encontrada' };
    }

    const incidenciaData = incidencia[0];

    // Verificar permisos según rol
    if (userRole === 'Administrador') {
      // Los administradores pueden cambiar cualquier incidencia
    } else if (userRole === 'Evaluador') {
      // Los evaluadores solo pueden cambiar incidencias de su área
      if (incidenciaData.areaReportador !== userArea && incidenciaData.areaAfectado !== userArea) {
        return { success: false, message: 'No tiene permiso para modificar esta incidencia' };
      }
    } else {
      return { success: false, message: 'No tiene permiso para modificar incidencias' };
    }

    // Validar que el estado sea válido
    if (!['Pendiente', 'Completada'].includes(estado)) {
      return { success: false, message: 'Estado no válido' };
    }

    // Actualizar estado
    await pool.execute(
      'UPDATE INCIDENCIA SET estado = ? WHERE idIncidencia = ?',
      [estado, incidenciaId]
    );
    
    return {
      success: true,
      message: 'Estado de incidencia actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar incidencia:', error);
    return { success: false, message: 'Error al actualizar la incidencia' };
  }
};

// Crear incidencia por evaluación cancelada
const createIncidenciaEvaluacionCancelada = async (evaluacionData) => {
  try {
    // Validar datos requeridos
    if (!evaluacionData || !evaluacionData.idEvaluacion || !evaluacionData.idEvaluador || !evaluacionData.idEvaluado) {
      console.error('Datos incompletos para crear incidencia:', evaluacionData);
      return { success: false, message: 'Datos incompletos para crear la incidencia' };
    }

    const now = new Date();
    const incidenciaData = {
      fecha: now.toISOString().split('T')[0],
      hora: now.toTimeString().split(' ')[0],
      descripcion: `Evaluación cancelada por superar fecha/hora límite. Evaluación ID: ${evaluacionData.idEvaluacion}`,
      tipo: 'Académica',
      reportadorId: evaluacionData.idEvaluador,
      afectadoId: evaluacionData.idEvaluado
    };

    console.log('Creando incidencia por evaluación cancelada:', incidenciaData);
    return await createIncidencia(incidenciaData);
  } catch (error) {
    console.error('Error al crear incidencia por evaluación cancelada:', error);
    return { success: false, message: 'Error al crear la incidencia' };
  }
};

// Crear incidencia por evaluación desaprobada
const createIncidenciaEvaluacionDesaprobada = async (evaluacionData) => {
  try {
    const now = new Date();
    const incidenciaData = {
      fecha: now.toISOString().split('T')[0],
      hora: now.toTimeString().split(' ')[0],
      descripcion: `Evaluación desaprobada (${evaluacionData.puntajeTotal}/20). Criterios que requieren mejora: ${evaluacionData.criteriosAMejorar}. Se recomienda revisar y mejorar estos aspectos para futuras evaluaciones.`,
      tipo: 'Académica',
      reportadorId: evaluacionData.idEvaluador,
      afectadoId: evaluacionData.idEvaluado
    };

    return await createIncidencia(incidenciaData);
  } catch (error) {
    console.error('Error al crear incidencia por evaluación desaprobada:', error);
    return { success: false, message: 'Error al crear la incidencia por evaluación desaprobada' };
  }
};

module.exports = {
  createIncidencia,
  getIncidenciasByUser,
  getAllIncidencias,
  updateIncidenciaEstado,
  createIncidenciaEvaluacionCancelada,
  createIncidenciaEvaluacionDesaprobada
};
