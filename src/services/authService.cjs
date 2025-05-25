const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key_here';

// Iniciar sesión
const login = async (correo, contrasena) => {
  try {
    // Consulta mejorada para obtener también el nombre del colaborador
    const [users] = await pool.execute(
      `SELECT u.idUsuario, u.nombre, u.correo, u.vigencia, 
              t.nombre as role, t.idTipoUsu as roleId, u.idColaborador,
              CASE 
                WHEN u.idColaborador IS NOT NULL 
                THEN CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat)
                ELSE u.nombre
              END as colaboradorNombre
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

    const token = jwt.sign(
      { 
        id: user.idUsuario, 
        email: user.correo, 
        role: user.role,
        roleId: user.roleId,
        colaboradorId: user.idColaborador
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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
        colaboradorNombre: user.colaboradorNombre
      }
    };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: 'Error en el servidor' };
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
      `SELECT u.idUsuario, u.nombre, u.correo, u.vigencia, 
              t.nombre as role, t.idTipoUsu as roleId, u.idColaborador,
              CASE 
                WHEN u.idColaborador IS NOT NULL 
                THEN CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat)
                ELSE u.nombre
              END as colaboradorNombre
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
        colaboradorNombre: user.colaboradorNombre
      }
    };
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return { success: false, message: 'Error al obtener información del usuario' };
  }
};

// Registrar nuevo usuario
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

    const token = jwt.sign(
      { 
        id: result.insertId, 
        email: correo, 
        role: 'Estudiante',
        roleId: roleId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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
        colaboradorNombre: nombre
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
