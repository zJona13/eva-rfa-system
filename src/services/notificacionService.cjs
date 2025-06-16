const { pool } = require('../utils/dbConnection.cjs');

// Obtener notificaciones por usuario
const getNotificacionesByUser = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT n.idNotificacion as id, n.fechaEnvio as fecha, 
      n.horaEnvio as hora, n.descripcion as mensaje, n.leido,
      i.descripcion as incidenciaDescripcion, i.tipo as incidenciaTipo
      FROM NOTIFICACION n
      LEFT JOIN INCIDENCIA i ON n.idIncidencia = i.idIncidencia
      WHERE n.idUsuario = ?
      ORDER BY n.fechaEnvio DESC, n.horaEnvio DESC`,
      [userId]
    );
    
    return {
      success: true,
      notificaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return { success: false, message: 'Error al obtener las notificaciones' };
  }
};

// Marcar notificación como leída
const markNotificacionAsRead = async (notificacionId) => {
  try {
    console.log('Intentando actualizar notificación en BD, id:', notificacionId);
    const [result] = await pool.execute(
      "UPDATE NOTIFICACION SET leido = 'Inactivo' WHERE idNotificacion = ?",
      [notificacionId]
    );
    console.log('Resultado de UPDATE:', result);
    return {
      success: true,
      message: 'Notificación marcada como leída'
    };
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    return { success: false, message: 'Error al actualizar la notificación' };
  }
};

// Obtener cantidad de notificaciones no leídas
const getUnreadNotificationsCount = async (userId) => {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM NOTIFICACION WHERE idUsuario = ? AND leido = false',
      [userId]
    );
    
    return {
      success: true,
      count: rows[0].count
    };
  } catch (error) {
    console.error('Error al obtener contador de notificaciones:', error);
    return { success: false, message: 'Error al obtener el contador' };
  }
};

module.exports = {
  getNotificacionesByUser,
  markNotificacionAsRead,
  getUnreadNotificationsCount
};
