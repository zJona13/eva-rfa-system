
const { pool } = require('../utils/dbConnection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Clave secreta para JWT
const JWT_SECRET = 'clave_secreta_para_jwt';

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

    // Generar token JWT
    const token = jwt.sign(
      { id: user.idUsuario, name: user.nombre, email: user.correo, role: user.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      user: {
        id: user.idUsuario,
        name: user.nombre,
        email: user.correo,
        role: user.rol
      },
      token
    };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: 'Error al iniciar sesión' };
  }
};

// Verificar token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
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
