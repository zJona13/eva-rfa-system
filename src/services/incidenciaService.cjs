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

// Obtener incidencias por usuario con nombres completos de colaboradores
const getIncidenciasByUser = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT i.idIncidencia as id, i.fechaIncidencia as fecha, 
      i.horaIncidencia as hora, i.descripcion, i.estado, i.tipo,
      i.accionTomada,
      CASE 
        WHEN cr.idColaborador IS NOT NULL 
        THEN CONCAT(cr.nombres, ' ', cr.apePat, ' ', cr.apeMat)
        ELSE ur.nombre 
      END as reportadorNombre,
      CASE 
        WHEN ca.idColaborador IS NOT NULL 
        THEN CONCAT(ca.nombres, ' ', ca.apePat, ' ', ca.apeMat)
        ELSE ua.nombre 
      END as afectadoNombre
      FROM INCIDENCIA i
      JOIN USUARIO ur ON i.idUsuarioReportador = ur.idUsuario
      JOIN USUARIO ua ON i.idUsuarioAfectado = ua.idUsuario
      LEFT JOIN COLABORADOR cr ON ur.idColaborador = cr.idColaborador
      LEFT JOIN COLABORADOR ca ON ua.idColaborador = ca.idColaborador
      WHERE i.idUsuarioReportador = ? OR i.idUsuarioAfectado = ?
      ORDER BY i.fechaIncidencia DESC, i.horaIncidencia DESC`,
      [userId, userId]
    );
    
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
      `SELECT i.idIncidencia as id, i.fechaIncidencia as fecha, 
      i.horaIncidencia as hora, i.descripcion, i.estado, i.tipo,
      i.accionTomada,
      CASE 
        WHEN cr.idColaborador IS NOT NULL 
        THEN CONCAT(cr.nombres, ' ', cr.apePat, ' ', cr.apeMat)
        ELSE ur.nombre 
      END as reportadorNombre,
      CASE 
        WHEN ca.idColaborador IS NOT NULL 
        THEN CONCAT(ca.nombres, ' ', ca.apePat, ' ', ca.apeMat)
        ELSE ua.nombre 
      END as afectadoNombre
      FROM INCIDENCIA i
      JOIN USUARIO ur ON i.idUsuarioReportador = ur.idUsuario
      JOIN USUARIO ua ON i.idUsuarioAfectado = ua.idUsuario
      LEFT JOIN COLABORADOR cr ON ur.idColaborador = cr.idColaborador
      LEFT JOIN COLABORADOR ca ON ua.idColaborador = ca.idColaborador
      ORDER BY i.fechaIncidencia DESC, i.horaIncidencia DESC`
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
const updateIncidenciaEstado = async (incidenciaId, estado) => {
  try {
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

module.exports = {
  createIncidencia,
  getIncidenciasByUser,
  getAllIncidencias,
  updateIncidenciaEstado
};
