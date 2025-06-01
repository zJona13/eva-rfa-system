const { pool } = require('../utils/dbConnection.cjs');

// Obtener todas las áreas
const getAllAreas = async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT idArea as id, nombre as name, descripcion as description FROM AREA ORDER BY nombre'
    );
    
    return {
      success: true,
      areas: rows
    };
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    return { success: false, message: 'Error al obtener las áreas' };
  }
};

// Obtener áreas con conteo de docentes para asignaciones
const getAreasForAsignacion = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idArea as id, a.nombre, a.descripcion,
       COUNT(CASE WHEN tc.nombre = 'Docente' THEN 1 END) as totalDocentes
       FROM AREA a
       LEFT JOIN USUARIO u ON a.idArea = u.idArea 
       LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       LEFT JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
       WHERE c.estado = 1 OR c.estado IS NULL
       GROUP BY a.idArea, a.nombre, a.descripcion
       HAVING COUNT(CASE WHEN tc.nombre = 'Docente' THEN 1 END) > 0
       ORDER BY a.nombre`
    );
    
    console.log('Áreas para asignación obtenidas:', rows);
    
    return {
      success: true,
      areas: rows
    };
  } catch (error) {
    console.error('Error al obtener áreas para asignación:', error);
    return { 
      success: false, 
      message: 'Error al obtener las áreas para asignación' 
    };
  }
};

// Crear una nueva área
const createArea = async (areaData) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO AREA (nombre, descripcion) VALUES (?, ?)',
      [areaData.name, areaData.description || null]
    );
    
    return {
      success: true,
      areaId: result.insertId,
      message: 'Área creada exitosamente'
    };
  } catch (error) {
    console.error('Error al crear área:', error);
    return { success: false, message: 'Error al crear el área' };
  }
};

// Actualizar un área
const updateArea = async (areaId, areaData) => {
  try {
    const [result] = await pool.execute(
      'UPDATE AREA SET nombre = ?, descripcion = ? WHERE idArea = ?',
      [areaData.name, areaData.description || null, areaId]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Área no encontrada' };
    }
    
    return {
      success: true,
      message: 'Área actualizada exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar área:', error);
    return { success: false, message: 'Error al actualizar el área' };
  }
};

// Eliminar un área
const deleteArea = async (areaId) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM AREA WHERE idArea = ?',
      [areaId]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Área no encontrada' };
    }
    
    return {
      success: true,
      message: 'Área eliminada exitosamente'
    };
  } catch (error) {
    console.error('Error al eliminar área:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return { success: false, message: 'No se puede eliminar el área porque está siendo utilizada por usuarios' };
    }
    return { success: false, message: 'Error al eliminar el área' };
  }
};

module.exports = {
  getAllAreas,
  getAreasForAsignacion,
  createArea,
  updateArea,
  deleteArea
};
