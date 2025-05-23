
const { pool } = require('../utils/dbConnection.cjs');

// Obtener todos los tipos de contrato
const getAllTiposContrato = async () => {
  try {
    console.log('Executing getAllTiposContrato service function');
    const [rows] = await pool.execute('SELECT idTipoContrato as id, nombre as name FROM TIPO_CONTRATO');
    console.log('Retrieved tipos contrato count:', rows.length);
    
    return {
      success: true,
      tiposContrato: rows
    };
  } catch (error) {
    console.error('Error al obtener tipos de contrato:', error);
    return { success: false, message: 'Error al obtener los tipos de contrato' };
  }
};

// Crear un nuevo tipo de contrato
const createTipoContrato = async (name) => {
  try {
    console.log('Executing createTipoContrato service function with name:', name);
    const [result] = await pool.execute(
      'INSERT INTO TIPO_CONTRATO (nombre) VALUES (?)',
      [name]
    );
    console.log('Create result:', result);
    
    return {
      success: true,
      id: result.insertId,
      message: 'Tipo de contrato creado exitosamente'
    };
  } catch (error) {
    console.error('Error al crear tipo de contrato:', error);
    return { success: false, message: 'Error al crear el tipo de contrato' };
  }
};

// Actualizar un tipo de contrato
const updateTipoContrato = async (id, name) => {
  try {
    console.log('Executing updateTipoContrato service function with id:', id, 'name:', name);
    const [result] = await pool.execute(
      'UPDATE TIPO_CONTRATO SET nombre = ? WHERE idTipoContrato = ?',
      [name, id]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Tipo de contrato no encontrado' };
    }
    
    return {
      success: true,
      message: 'Tipo de contrato actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar tipo de contrato:', error);
    return { success: false, message: 'Error al actualizar el tipo de contrato' };
  }
};

// Eliminar un tipo de contrato
const deleteTipoContrato = async (id) => {
  try {
    console.log('Executing deleteTipoContrato service function with id:', id);
    // Verificar si el tipo de contrato está en uso en la tabla CONTRATO
    const [contratos] = await pool.execute(
      'SELECT COUNT(*) as count FROM CONTRATO WHERE idTipoContrato = ?',
      [id]
    );
    
    if (contratos[0].count > 0) {
      return { 
        success: false, 
        message: 'No se puede eliminar el tipo de contrato porque está siendo utilizado en contratos activos'
      };
    }
    
    const [result] = await pool.execute(
      'DELETE FROM TIPO_CONTRATO WHERE idTipoContrato = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Tipo de contrato no encontrado' };
    }
    
    return {
      success: true,
      message: 'Tipo de contrato eliminado exitosamente'
    };
  } catch (error) {
    console.error('Error al eliminar tipo de contrato:', error);
    return { success: false, message: 'Error al eliminar el tipo de contrato' };
  }
};

module.exports = {
  getAllTiposContrato,
  createTipoContrato,
  updateTipoContrato,
  deleteTipoContrato
};
