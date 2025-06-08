const { pool } = require('../utils/dbConnection.cjs');

// Obtener todos los tipos de colaborador
const getAllTiposColaborador = async () => {
  try {
    const [rows] = await pool.execute('SELECT idTipoColaborador as id, nombre as name FROM TIPO_COLABORADOR');
    
    return {
      success: true,
      tiposColaborador: rows
    };
  } catch (error) {
    console.error('Error al obtener tipos de colaborador:', error);
    return { success: false, message: 'Error al obtener los tipos de colaborador' };
  }
};

// Crear un nuevo tipo de colaborador
const createTipoColaborador = async (nombre) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO TIPO_COLABORADOR (nombre) VALUES (?)',
      [nombre]
    );
    
    return {
      success: true,
      id: result.insertId,
      message: 'Tipo de colaborador creado exitosamente'
    };
  } catch (error) {
    console.error('Error al crear tipo de colaborador:', error);
    return { success: false, message: 'Error al crear el tipo de colaborador' };
  }
};

// Actualizar un tipo de colaborador
const updateTipoColaborador = async (id, nombre) => {
  try {
    const [result] = await pool.execute(
      'UPDATE TIPO_COLABORADOR SET nombre = ? WHERE idTipoColaborador = ?',
      [nombre, id]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Tipo de colaborador no encontrado' };
    }
    
    return {
      success: true,
      message: 'Tipo de colaborador actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar tipo de colaborador:', error);
    return { success: false, message: 'Error al actualizar el tipo de colaborador' };
  }
};

// Eliminar un tipo de colaborador
const deleteTipoColaborador = async (id) => {
  try {
    // Comprobar si hay colaboradores asignados a este tipo
    const [colaboradores] = await pool.execute(
      'SELECT COUNT(*) as count FROM COLABORADOR WHERE idTipoColaborador = ?',
      [id]
    );
    
    if (colaboradores[0].count > 0) {
      return { success: false, message: 'No se puede eliminar el tipo de colaborador porque hay colaboradores asignados' };
    }
    
    const [result] = await pool.execute(
      'DELETE FROM TIPO_COLABORADOR WHERE idTipoColaborador = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Tipo de colaborador no encontrado' };
    }
    
    return {
      success: true,
      message: 'Tipo de colaborador eliminado exitosamente'
    };
  } catch (error) {
    console.error('Error al eliminar tipo de colaborador:', error);
    return { success: false, message: 'Error al eliminar el tipo de colaborador' };
  }
};

module.exports = {
  getAllTiposColaborador,
  createTipoColaborador,
  updateTipoColaborador,
  deleteTipoColaborador
};
