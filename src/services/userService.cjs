const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios con información del colaborador
const getAllUsers = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.idUsuario as id, u.correo as email, 
      u.estado as active, t.nombre as role, t.idTipoUsuario as roleId,
      u.idColaborador as colaboradorId,
      CASE 
        WHEN c.idColaborador IS NOT NULL 
        THEN CONCAT(c.nombreColaborador, ' ', c.apePaColaborador, ' ', c.apeMaColaborador)
        ELSE NULL 
      END as colaboradorName,
      u.idArea as areaId,
      a.nombre as areaName
      FROM USUARIO u 
      JOIN TIPO_USUARIO t ON u.idTipoUsuario = t.idTipoUsuario
      LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
      LEFT JOIN AREA a ON u.idArea = a.idArea`
    );
    
    return {
      success: true,
      users: rows.map(user => ({
        ...user,
        name: user.colaboradorName || user.email,
        active: user.active === 'Activo'
      }))
    };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, message: 'Error al obtener los usuarios' };
  }
};

// Obtener colaboradores disponibles (que no tienen usuario asignado)
const getAvailableColaboradores = async (userId = null) => {
  try {
    let query = `
      SELECT c.idColaborador as id, 
      CONCAT(c.nombreColaborador, ' ', c.apePaColaborador, ' ', c.apeMaColaborador) as fullName
      FROM COLABORADOR c 
      WHERE c.estado = 'Activo' 
      AND (c.idColaborador NOT IN (
        SELECT idColaborador FROM USUARIO WHERE idColaborador IS NOT NULL
      )`;
    if (userId) {
      query += ` OR c.idColaborador = (SELECT idColaborador FROM USUARIO WHERE idUsuario = ?)`;
    }
    query += `) ORDER BY c.nombreColaborador, c.apePaColaborador, c.apeMaColaborador`;
    const [rows] = userId
      ? await pool.execute(query, [userId])
      : await pool.execute(query);
    return { success: true, colaboradores: rows };
  } catch (error) {
    console.error('Error al obtener colaboradores disponibles:', error);
    return { success: false, message: 'Error al obtener colaboradores disponibles' };
  }
};

// Crear un nuevo usuario
const createUser = async (userData) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const [result] = await pool.execute(
      'INSERT INTO USUARIO (correo, contrasena, estado, idTipoUsuario, idColaborador, idArea) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userData.email, 
        hashedPassword, 
        userData.active ? 'Activo' : 'Inactivo',
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
        'UPDATE USUARIO SET correo = ?, contrasena = ?, estado = ?, idTipoUsuario = ?, idColaborador = ?, idArea = ? WHERE idUsuario = ?',
        [
          userData.email, 
          hashedPassword, 
          userData.active ? 'Activo' : 'Inactivo',
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
        'UPDATE USUARIO SET correo = ?, estado = ?, idTipoUsuario = ?, idColaborador = ?, idArea = ? WHERE idUsuario = ?',
        [
          userData.email, 
          userData.active ? 'Activo' : 'Inactivo',
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
