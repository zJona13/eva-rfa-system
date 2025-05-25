
const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
const getAllUsers = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.idUsuario as id, u.nombre as name, u.correo as email, 
      u.vigencia as active, t.nombre as role, t.idTipoUsu as roleId 
      FROM USUARIO u 
      JOIN TIPO_USUARIO t ON u.idTipoUsu = t.idTipoUsu`
    );
    
    return {
      success: true,
      users: rows.map(user => ({
        ...user,
        active: user.active === 1
      }))
    };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, message: 'Error al obtener los usuarios' };
  }
};

// Crear un nuevo usuario
const createUser = async (userData) => {
  try {
    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const [result] = await pool.execute(
      'INSERT INTO USUARIO (nombre, correo, contrasena, vigencia, idTipoUsu) VALUES (?, ?, ?, ?, ?)',
      [userData.name, userData.email, hashedPassword, userData.active ? 1 : 0, userData.roleId]
    );
    
    return {
      success: true,
      userId: result.insertId,
      message: 'Usuario creado exitosamente'
    };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return { success: false, message: 'Error al crear el usuario' };
  }
};

// Actualizar un usuario
const updateUser = async (userId, userData) => {
  try {
    // Si viene una nueva contraseña, la hasheamos
    if (userData.password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const [result] = await pool.execute(
        'UPDATE USUARIO SET nombre = ?, correo = ?, contrasena = ?, vigencia = ?, idTipoUsu = ? WHERE idUsuario = ?',
        [userData.name, userData.email, hashedPassword, userData.active ? 1 : 0, userData.roleId, userId]
      );
      
      if (result.affectedRows === 0) {
        return { success: false, message: 'Usuario no encontrado' };
      }
    } else {
      // Si no viene contraseña, actualizamos el resto de campos
      const [result] = await pool.execute(
        'UPDATE USUARIO SET nombre = ?, correo = ?, vigencia = ?, idTipoUsu = ? WHERE idUsuario = ?',
        [userData.name, userData.email, userData.active ? 1 : 0, userData.roleId, userId]
      );
      
      if (result.affectedRows === 0) {
        return { success: false, message: 'Usuario no encontrado' };
      }
    }
    
    return {
      success: true,
      message: 'Usuario actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { success: false, message: 'Error al actualizar el usuario' };
  }
};

// Eliminar un usuario
const deleteUser = async (userId) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM USUARIO WHERE idUsuario = ?',
      [userId]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Usuario no encontrado' };
    }
    
    return {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return { success: false, message: 'No se puede eliminar el usuario porque está siendo utilizado en otras tablas' };
    }
    return { success: false, message: 'Error al eliminar el usuario' };
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
