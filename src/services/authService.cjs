
const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');

// Iniciar sesión
const login = async (correo, contrasena) => {
  try {
    // Busca el usuario por correo electrónico
    const [rows] = await pool.execute(
      'SELECT u.idUsuario, u.nombre, u.correo, u.contrasena, u.vigencia, t.nombre as rol, u.idColaborador ' +
      'FROM USUARIO u ' +
      'JOIN TIPO_USUARIO t ON u.idTipoUsu = t.idTipoUsu ' +
      'WHERE u.correo = ?',
      [correo]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const user = rows[0];
    
    // Verificar la contraseña usando bcrypt
    // Compara la contraseña proporcionada con la hash almacenada
    const passwordIsValid = await bcrypt.compare(contrasena, user.contrasena);

    if (!passwordIsValid) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Verificar si el usuario está activo
    if (user.vigencia !== 1) {
      return { success: false, message: 'Usuario inactivo' };
    }

    // Obtener datos del colaborador si existe
    let colaborador = null;
    if (user.idColaborador) {
      const [colaboradorRows] = await pool.execute(
        `SELECT c.idColaborador, CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as nombreCompleto 
         FROM COLABORADOR c 
         WHERE c.idColaborador = ?`,
        [user.idColaborador]
      );
      
      if (colaboradorRows.length > 0) {
        colaborador = colaboradorRows[0];
      }
    }

    // Retornar la información del usuario y colaborador
    return {
      success: true,
      user: {
        id: user.idUsuario,
        name: user.nombre,
        email: user.correo,
        role: user.rol,
        colaboradorId: user.idColaborador,
        colaboradorName: colaborador ? colaborador.nombreCompleto : null
      },
      token: 'temp-auth-token' // Token temporal
    };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: 'Error al iniciar sesión' };
  }
};

// Verificar token (versión simple temporal)
const verifyToken = async (token) => {
  // Implementación temporal, se reemplazará con una solución más segura
  if (token === 'temp-auth-token') {
    // En una implementación real, aquí decodificaríamos el token para obtener el ID del usuario
    // y luego obtendríamos la información actualizada del usuario desde la base de datos
    return { 
      valid: true,
      user: {
        id: 1,
        name: 'Usuario Temporal',
        email: 'admin@example.com',
        role: 'Administrador',
        colaboradorId: null,
        colaboradorName: null
      } 
    };
  }
  return { valid: false, error: 'Token inválido' };
};

// Obtener información del usuario
const getUserInfo = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.idUsuario, u.nombre, u.correo, u.vigencia, t.nombre as rol, u.idColaborador
       FROM USUARIO u 
       JOIN TIPO_USUARIO t ON u.idTipoUsu = t.idTipoUsu 
       WHERE u.idUsuario = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const user = rows[0];
    
    // Obtener datos del colaborador si existe
    let colaborador = null;
    if (user.idColaborador) {
      const [colaboradorRows] = await pool.execute(
        `SELECT c.idColaborador, CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as nombreCompleto 
         FROM COLABORADOR c 
         WHERE c.idColaborador = ?`,
        [user.idColaborador]
      );
      
      if (colaboradorRows.length > 0) {
        colaborador = colaboradorRows[0];
      }
    }
    
    return {
      success: true,
      user: {
        id: user.idUsuario,
        name: user.nombre,
        email: user.correo,
        role: user.rol,
        active: user.vigencia === 1,
        colaboradorId: user.idColaborador,
        colaboradorName: colaborador ? colaborador.nombreCompleto : null
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
