
const { pool } = require('../utils/dbConnection.cjs');

// Obtener asignaciones de un usuario específico con información del área
const getAsignacionesByUsuario = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion as id, a.periodo, a.fecha_inicio as fechaInicio,
      a.fecha_fin as fechaFin, a.estado, a.idArea as areaId,
      ar.nombre as areaNombre
      FROM ASIGNACION a
      JOIN AREA ar ON a.idArea = ar.idArea
      WHERE a.idUsuario = ?
      ORDER BY a.fecha_inicio DESC`,
      [userId]
    );
    
    return {
      success: true,
      asignaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener asignaciones del usuario:', error);
    return { success: false, message: 'Error al obtener las asignaciones del usuario' };
  }
};

// Verificar si un usuario tiene asignación activa en un área específica
const hasActiveAsignacionInArea = async (userId, areaId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count
      FROM ASIGNACION a
      WHERE a.idUsuario = ? AND a.idArea = ? AND a.estado = 'Activa'
      AND CURDATE() BETWEEN a.fecha_inicio AND a.fecha_fin`,
      [userId, areaId]
    );
    
    return {
      success: true,
      hasAsignacion: rows[0].count > 0
    };
  } catch (error) {
    console.error('Error al verificar asignación en área:', error);
    return { success: false, message: 'Error al verificar la asignación' };
  }
};

module.exports = {
  getAsignacionesByUsuario,
  hasActiveAsignacionInArea
};
