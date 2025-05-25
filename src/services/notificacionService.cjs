
const { pool } = require('../utils/dbConnection.cjs');

// Obtener notificaciones por usuario
const getNotificacionesByUser = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT n.idNotificacion as id, n.fechaNotificacion as fecha, 
      n.horaNotificacion as hora, n.mensaje, n.leido,
      i.descripcion as incidenciaDescripcion, i.tipo as incidenciaTipo
      FROM NOTIFICACION n
      LEFT JOIN INCIDENCIA i ON n.idIncidencia = i.idIncidencia
      WHERE n.idUsuario = ?
      ORDER BY n.fechaNotificacion DESC, n.horaNotificacion DESC`,
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
    await pool.execute(
      'UPDATE NOTIFICACION SET leido = true WHERE idNotificacion = ?',
      [notificacionId]
    );
    
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
