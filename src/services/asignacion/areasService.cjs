
const { pool } = require('../../utils/dbConnection.cjs');

// Get available areas for assignment
const getAreas = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idArea as id, a.nombre as name, a.descripcion as description,
       COUNT(CASE WHEN tc.nombre = 'Docente' THEN 1 END) as totalDocentes
       FROM AREA a
       LEFT JOIN USUARIO u ON a.idArea = u.idArea 
       LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       LEFT JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
       WHERE c.estado = 1 OR c.estado IS NULL
       GROUP BY a.idArea, a.nombre, a.descripcion
       ORDER BY a.nombre`
    );
    
    console.log('Áreas obtenidas desde la base de datos:', rows);
    
    return {
      success: true,
      data: {
        areas: rows
      }
    };
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    return { 
      success: false, 
      message: 'Error al obtener las áreas' 
    };
  }
};

module.exports = {
  getAreas
};
