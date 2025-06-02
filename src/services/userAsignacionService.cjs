
const { pool } = require('../utils/dbConnection.cjs');

// Obtener asignaciones abiertas de un usuario específico
const getUserAsignaciones = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion as id, a.idArea as areaId, ar.nombre as areaNombre,
       a.estado, a.fecha_inicio as fechaInicio, a.fecha_fin as fechaFin
       FROM ASIGNACION a
       JOIN AREA ar ON a.idArea = ar.idArea
       JOIN USUARIO u ON u.idArea = a.idArea
       WHERE u.idUsuario = ? AND a.estado = 'Abierta'
       ORDER BY a.fecha_inicio DESC`,
      [userId]
    );
    
    return {
      success: true,
      asignaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener asignaciones del usuario:', error);
    return { 
      success: false, 
      message: 'Error al obtener las asignaciones del usuario' 
    };
  }
};

module.exports = {
  getUserAsignaciones
};
