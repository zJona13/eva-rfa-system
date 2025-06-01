
const { pool } = require('../utils/dbConnection.cjs');

// Obtener todas las áreas
const getAllAreas = async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT idArea as id, nombre as name, descripcion as description FROM AREA ORDER BY nombre'
    );
    
    console.log('Áreas obtenidas desde la base de datos:', rows);
    
    return {
      success: true,
      areas: rows
    };
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    return { success: false, message: 'Error al obtener las áreas' };
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
  createArea,
  updateArea,
  deleteArea
};
