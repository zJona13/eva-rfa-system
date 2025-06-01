const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios con información del colaborador
const getAllUsers = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.idUsuario as id, u.nombre as name, u.correo as email, 
      u.vigencia as active, t.nombre as role, t.idTipoUsu as roleId,
      u.idColaborador as colaboradorId, u.idArea as areaId,
      CASE 
        WHEN c.idColaborador IS NOT NULL 
        THEN CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat)
        ELSE NULL 
      END as colaboradorName,
      a.nombre as areaName
      FROM USUARIO u 
      JOIN TIPO_USUARIO t ON u.idTipoUsu = t.idTipoUsu
      LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
      LEFT JOIN AREA a ON u.idArea = a.idArea`
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

// Obtener colaboradores disponibles (que no tienen usuario asignado)
const getAvailableColaboradores = async (excludeUserId = null) => {
  try {
    let query = `
      SELECT c.idColaborador as id, 
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as fullName
      FROM COLABORADOR c 
      WHERE c.estado = 1 
      AND (c.idColaborador NOT IN (
        SELECT idColaborador FROM USUARIO WHERE idColaborador IS NOT NULL
      ) OR c.idColaborador IS NULL)
    `;
    
    let params = [];
    
    // Si estamos editando un usuario, incluir su colaborador actual como disponible
    if (excludeUserId) {
      query += ` OR c.idColaborador = (SELECT idColaborador FROM USUARIO WHERE idUsuario = ?)`;
      params.push(excludeUserId);
    }
    
    query += ` ORDER BY c.nombres, c.apePat, c.apeMat`;
    
    const [rows] = await pool.execute(query, params);
    
    return {
      success: true,
      colaboradores: rows
    };
  } catch (error) {
    console.error('Error al obtener colaboradores disponibles:', error);
    return { success: false, message: 'Error al obtener los colaboradores disponibles' };
  }
};

// Crear un nuevo usuario
const createUser = async (userData) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const [result] = await pool.execute(
      'INSERT INTO USUARIO (nombre, correo, contrasena, vigencia, idTipoUsu, idColaborador, idArea) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userData.name, 
        userData.email, 
        hashedPassword, 
        userData.active ? 1 : 0, 
        userData.roleId,
        userData.colaboradorId || null,
        userData.areaId || null
      ]
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
    if (userData.password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const [result] = await pool.execute(
        'UPDATE USUARIO SET nombre = ?, correo = ?, contrasena = ?, vigencia = ?, idTipoUsu = ?, idColaborador = ?, idArea = ? WHERE idUsuario = ?',
        [
          userData.name, 
          userData.email, 
          hashedPassword, 
          userData.active ? 1 : 0, 
          userData.roleId, 
          userData.colaboradorId || null,
          userData.areaId || null,
          userId
        ]
      );
      
      if (result.affectedRows === 0) {
        return { success: false, message: 'Usuario no encontrado' };
      }
    } else {
      const [result] = await pool.execute(
        'UPDATE USUARIO SET nombre = ?, correo = ?, vigencia = ?, idTipoUsu = ?, idColaborador = ?, idArea = ? WHERE idUsuario = ?',
        [
          userData.name, 
          userData.email, 
          userData.active ? 1 : 0, 
          userData.roleId, 
          userData.colaboradorId || null,
          userData.areaId || null,
          userId
        ]
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
  getAvailableColaboradores,
  createUser,
  updateUser,
  deleteUser
};
