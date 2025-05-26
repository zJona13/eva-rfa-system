const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key_here';

// Iniciar sesión - MEJORADO PARA GENERAR TOKENS MÁS SEGUROS
const login = async (correo, contrasena) => {
  try {
    // Consulta mejorada para obtener también el nombre del colaborador
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

    // Generar token JWT más robusto con datos adicionales
    const tokenPayload = { 
      id: user.idUsuario, 
      email: user.correo, 
      role: user.role,
      roleId: user.roleId,
      colaboradorId: user.idColaborador,
      iat: Math.floor(Date.now() / 1000)
    };
    
    console.log('Generando token para usuario:', user.correo, 'Payload:', tokenPayload);
    
    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    console.log('Token generado exitosamente, longitud:', token.length);

    return {
      success: true,
      token,
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

// Verificar token - MEJORADO CON MEJOR MANEJO DE ERRORES
const verifyToken = async (token) => {
  try {
    // Validar formato básico del token
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.log('Token con formato inválido recibido');
      return { valid: false, error: 'Token con formato inválido' };
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verificado exitosamente para usuario ID:', decoded.id);
    
    // Obtener información actualizada del usuario
    const userInfo = await getUserInfo(decoded.id);
    
    if (!userInfo.success) {
      return { valid: false, error: 'Usuario no encontrado' };
    }
    
    return { 
      valid: true,
      user: userInfo.user
    };
  } catch (error) {
    console.error('Error al verificar token:', error.name, ':', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Token JWT inválido: ' + error.message };
    } else if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token JWT expirado' };
    } else if (error.name === 'NotBeforeError') {
      return { valid: false, error: 'Token JWT no activo todavía' };
    } else {
      return { valid: false, error: 'Error de verificación de token' };
    }
  }
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

// Registrar nuevo usuario - MEJORADO PARA GENERAR TOKENS CONSISTENTES
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

    // Generar token consistente con el proceso de login
    const tokenPayload = { 
      id: result.insertId, 
      email: correo, 
      role: 'Estudiante',
      roleId: roleId,
      colaboradorId: null,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    console.log('Token de registro generado exitosamente para:', correo);

    return {
      success: true,
      token,
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
  verifyToken,
  getUserInfo
};
