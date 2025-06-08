const { pool } = require('../utils/dbConnection.cjs');

// Obtener todos los roles
const getAllRoles = async () => {
  try {
    const [rows] = await pool.execute('SELECT idTipoUsuario as id, nombre as name FROM TIPO_USUARIO');
    
    return {
      success: true,
      roles: rows
    };
  } catch (error) {
    console.error('Error al obtener roles:', error);
    return { success: false, message: 'Error al obtener los roles' };
  }
};

// Obtener usuarios por rol
const getUsersByRole = async (roleId) => {
  try {
    const [rows] = await pool.execute(
      'SELECT u.idUsuario as id, u.nombre as name, u.correo as email, u.estado as active FROM USUARIO u WHERE u.idTipoUsuario = ?',
      [roleId]
    );
    
    return {
      success: true,
      users: rows.map(user => ({
        ...user,
        active: user.active === 'Activo'
      }))
    };
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    return { success: false, message: 'Error al obtener usuarios' };
  }
};

// Crear un nuevo rol
const createRole = async (roleName) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO TIPO_USUARIO (nombre) VALUES (?)',
      [roleName]
    );
    
    return {
      success: true,
      roleId: result.insertId,
      message: 'Rol creado exitosamente'
    };
  } catch (error) {
    console.error('Error al crear rol:', error);
    return { success: false, message: 'Error al crear el rol' };
  }
};

// Actualizar un rol
const updateRole = async (roleId, roleName) => {
  try {
    const [result] = await pool.execute(
      'UPDATE TIPO_USUARIO SET nombre = ? WHERE idTipoUsuario = ?',
      [roleName, roleId]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Rol no encontrado' };
    }
    
    return {
      success: true,
      message: 'Rol actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    return { success: false, message: 'Error al actualizar el rol' };
  }
};

// Eliminar un rol
const deleteRole = async (roleId) => {
  try {
    // Comprobar si hay usuarios asignados a este rol
    const [users] = await pool.execute(
      'SELECT COUNT(*) as count FROM USUARIO WHERE idTipoUsuario = ?',
      [roleId]
    );
    
    if (users[0].count > 0) {
      return { success: false, message: 'No se puede eliminar el rol porque hay usuarios asignados' };
    }
    
    const [result] = await pool.execute(
      'DELETE FROM TIPO_USUARIO WHERE idTipoUsuario = ?',
      [roleId]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Rol no encontrado' };
    }
    
    return {
      success: true,
      message: 'Rol eliminado exitosamente'
    };
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    return { success: false, message: 'Error al eliminar el rol' };
  }
};

module.exports = {
  getAllRoles,
  getUsersByRole,
  createRole,
  updateRole,
  deleteRole
};
