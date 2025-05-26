const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generar token personalizado (UUID-like)
const generateCustomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Función para limpiar tokens expirados
const cleanExpiredTokens = async () => {
  try {
    await pool.execute(
      'DELETE FROM USER_TOKENS WHERE expiration < NOW()'
    );
  } catch (error) {
    console.error('Error cleaning expired tokens:', error);
  }
};

// Crear token en la base de datos
const createUserToken = async (userId, token) => {
  try {
    // Limpiar tokens expirados
    await cleanExpiredTokens();
    
    // Crear nuevo token con expiración de 24 horas
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);
    
    await pool.execute(
      'INSERT INTO USER_TOKENS (idUsuario, token, expiration, created_at) VALUES (?, ?, ?, NOW())',
      [userId, token, expirationDate]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error creating user token:', error);
    return { success: false, message: 'Error al crear token' };
  }
};

// Validar token
const validateUserToken = async (token) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ut.idUsuario, ut.expiration, u.nombre, u.correo, u.vigencia,
              t.nombre as role, t.idTipoUsu as roleId, u.idColaborador,
              CASE 
                WHEN u.idColaborador IS NOT NULL 
                THEN CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat)
                ELSE u.nombre
              END as colaboradorName
       FROM USER_TOKENS ut
       JOIN USUARIO u ON ut.idUsuario = u.idUsuario
       JOIN TIPO_USUARIO t ON u.idTipoUsu = t.idTipoUsu 
       LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       WHERE ut.token = ? AND ut.expiration > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Token inválido o expirado' };
    }

    const userData = rows[0];
    
    if (!userData.vigencia) {
      return { success: false, message: 'Usuario inactivo' };
    }

    return {
      success: true,
      user: {
        id: userData.idUsuario,
        name: userData.nombre,
        email: userData.correo,
        role: userData.role,
        roleId: userData.roleId,
        colaboradorId: userData.idColaborador,
        colaboradorName: userData.colaboradorName
      }
    };
  } catch (error) {
    console.error('Error validating token:', error);
    return { success: false, message: 'Error al validar token' };
  }
};

// Eliminar token específico
const revokeUserToken = async (token) => {
  try {
    await pool.execute(
      'DELETE FROM USER_TOKENS WHERE token = ?',
      [token]
    );
    return { success: true };
  } catch (error) {
    console.error('Error revoking token:', error);
    return { success: false, message: 'Error al revocar token' };
  }
};

// Eliminar todos los tokens de un usuario
const revokeAllUserTokens = async (userId) => {
  try {
    await pool.execute(
      'DELETE FROM USER_TOKENS WHERE idUsuario = ?',
      [userId]
    );
    return { success: true };
  } catch (error) {
    console.error('Error revoking all user tokens:', error);
    return { success: false, message: 'Error al revocar tokens' };
  }
};

// Iniciar sesión - CON TOKENS PERSONALIZADOS
const login = async (correo, contrasena) => {
  try {
    // Consulta para obtener información del usuario y colaborador
    const [users] = await pool.execute(
      `SELECT u.idUsuario, u.nombre, u.correo, u.vigencia, u.contrasena,
              t.nombre as role, t.idTipoUsu as roleId, u.idColaborador,
              CASE 
                WHEN u.idColaborador IS NOT NULL 
                THEN CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat)
                ELSE u.nombre
              END as colaboradorName
       FROM USUARIO u 
       JOIN TIPO_USUARIO t ON u.idTipoUsu = t.idTipoUsu 
       LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       WHERE u.correo = ?`,
      [correo]
    );

    if (users.length === 0) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const user = users[0];

    if (!user.vigencia) {
      return { success: false, message: 'Usuario inactivo' };
    }

    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);
    
    if (!isPasswordValid) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Generar token personalizado
    const customToken = generateCustomToken();
    
    // Guardar token en la base de datos
    const tokenResult = await createUserToken(user.idUsuario, customToken);
    
    if (!tokenResult.success) {
      return { success: false, message: 'Error al generar token de sesión' };
    }

    console.log('Login exitoso para usuario:', user.correo);

    return {
      success: true,
      token: customToken,
      user: {
        id: user.idUsuario,
        name: user.nombre,
        email: user.correo,
        role: user.role,
        roleId: user.roleId,
        colaboradorId: user.idColaborador,
        colaboradorName: user.colaboradorName
      }
    };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

// Obtener información del usuario por token
const getUserByToken = async (token) => {
  return await validateUserToken(token);
};

// Obtener información del usuario
const getUserInfo = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.idUsuario, u.nombre, u.correo, u.vigencia, 
              t.nombre as role, t.idTipoUsu as roleId, u.idColaborador,
              CASE 
                WHEN u.idColaborador IS NOT NULL 
                THEN CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat)
                ELSE u.nombre
              END as colaboradorName
       FROM USUARIO u 
       JOIN TIPO_USUARIO t ON u.idTipoUsu = t.idTipoUsu 
       LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       WHERE u.idUsuario = ?`,
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
        role: user.role,
        roleId: user.roleId,
        active: user.vigencia === 1,
        colaboradorId: user.idColaborador,
        colaboradorName: user.colaboradorName
      }
    };
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return { success: false, message: 'Error al obtener información del usuario' };
  }
};

// Registrar nuevo usuario - SIN TOKENS JWT
const register = async (nombre, correo, contrasena, roleId = 4) => {
  try {
    const [existingUsers] = await pool.execute(
      'SELECT idUsuario FROM USUARIO WHERE correo = ?',
      [correo]
    );

    if (existingUsers.length > 0) {
      return { success: false, message: 'El correo ya está registrado' };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    const [result] = await pool.execute(
      'INSERT INTO USUARIO (nombre, correo, contrasena, vigencia, idTipoUsu) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, hashedPassword, 1, roleId]
    );

    console.log('Usuario registrado exitosamente:', correo);

    return {
      success: true,
      user: {
        id: result.insertId,
        name: nombre,
        email: correo,
        role: 'Estudiante',
        roleId: roleId,
        colaboradorId: null,
        colaboradorName: nombre
      }
    };
  } catch (error) {
    console.error('Error en registro:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

module.exports = {
  login,
  register,
  getUserInfo,
  getUserByToken,
  validateUserToken,
  revokeUserToken,
  revokeAllUserTokens,
  generateCustomToken,
  createUserToken
};
