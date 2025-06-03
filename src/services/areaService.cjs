const { pool } = require('../utils/dbConnection.cjs');

// Obtener todas las áreas
const getAllAreas = async () => {
  try {
    const [rows] = await pool.execute('SELECT idArea as id, nombre as name, descripcion FROM AREA');
    return { success: true, areas: rows };
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    return { success: false, message: 'Error al obtener las áreas' };
  }
};

// Crear un área
const createArea = async (nombre, descripcion) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO AREA (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    return { success: true, id: result.insertId, message: 'Área creada exitosamente' };
  } catch (error) {
    console.error('Error al crear área:', error);
    return { success: false, message: 'Error al crear el área' };
  }
};

// Actualizar un área
const updateArea = async (id, nombre, descripcion) => {
  try {
    const [result] = await pool.execute(
      'UPDATE AREA SET nombre = ?, descripcion = ? WHERE idArea = ?',
      [nombre, descripcion, id]
    );
    if (result.affectedRows === 0) {
      return { success: false, message: 'Área no encontrada' };
    }
    return { success: true, message: 'Área actualizada exitosamente' };
  } catch (error) {
    console.error('Error al actualizar área:', error);
    return { success: false, message: 'Error al actualizar el área' };
  }
};

// Eliminar un área
const deleteArea = async (id) => {
  try {
    // Comprobar si hay usuarios asignados a esta área
    const [usuarios] = await pool.execute(
      'SELECT COUNT(*) as count FROM USUARIO WHERE idArea = ?',
      [id]
    );
    if (usuarios[0].count > 0) {
      return { success: false, message: 'No se puede eliminar el área porque hay usuarios asignados' };
    }
    const [result] = await pool.execute(
      'DELETE FROM AREA WHERE idArea = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return { success: false, message: 'Área no encontrada' };
    }
    return { success: true, message: 'Área eliminada exitosamente' };
  } catch (error) {
    console.error('Error al eliminar área:', error);
    return { success: false, message: 'Error al eliminar el área' };
  }
};

module.exports = {
  getAllAreas,
  createArea,
  updateArea,
  deleteArea
}; 