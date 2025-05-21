
const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');

// Iniciar sesión
const login = async (correo, contrasena) => {
  try {
    // En la versión actual no estamos usando hash, pero debería implementarse
    const [rows] = await pool.execute(
      'SELECT u.idUsuario, u.nombre, u.correo, u.contrasena, u.vigencia, t.nombre as rol FROM USUARIO u JOIN TIPO_USUARIO t ON u.idTipoUsu = t.idTipoUsu WHERE u.correo = ?',
      [correo]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const user = rows[0];
    
    // En producción, usaríamos bcrypt.compare para comparar contraseñas
    const passwordIsValid = user.contrasena === contrasena;

    if (!passwordIsValid) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Verificar si el usuario está activo
    if (user.vigencia !== 1) {
      return { success: false, message: 'Usuario inactivo' };
    }

    // En lugar de JWT, usaremos un enfoque más simple por ahora
    // La autenticación real será implementada más adelante
    return {
      success: true,
      user: {
        id: user.idUsuario,
        name: user.nombre,
        email: user.correo,
        role: user.rol
      },
      token: 'temp-auth-token' // Token temporal
    };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: 'Error al iniciar sesión' };
  }
};

// Verificar token (versión simple temporal)
const verifyToken = (token) => {
  // Implementación temporal, se reemplazará con una solución más segura
  if (token === 'temp-auth-token') {
    return { 
      valid: true, 
      user: {
        id: 1,
        name: 'Usuario Temporal',
        email: 'admin@example.com',
        role: 'Administrador'
      } 
    };
  }
  return { valid: false, error: 'Token inválido' };
};

// Obtener información del usuario
const getUserInfo = async (userId) => {
  try {
    const [rows] = await pool.execute(
      'SELECT u.idUsuario, u.nombre, u.correo, u.vigencia, t.nombre as rol FROM USUARIO u JOIN TIPO_USUARIO t ON u.idTipoUsu = t.idTipoUsu WHERE u.idUsuario = ?',
      [userId]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const user = rows[0];
    
    return {
      success: true,
      user: {
        id: user.idUsuario,
        name: user.nombre,
        email: user.correo,
        role: user.rol,
        active: user.vigencia === 1
      }
    };
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return { success: false, message: 'Error al obtener información del usuario' };
  }
};

module.exports = {
  login,
  verifyToken,
  getUserInfo
};
