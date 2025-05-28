const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here_change_in_production';
const JWT_EXPIRATION = '24h';

// Crear tabla de tokens si no existe
const createTokensTable = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS USER_TOKENS (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idUsuario INT NOT NULL,
        token VARCHAR(500) NOT NULL UNIQUE,
        expiration DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (idUsuario),
        INDEX idx_expiration (expiration)
      )
    `);
    console.log('✅ Tabla USER_TOKENS verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla USER_TOKENS:', error);
  }
};

// Crear tabla para códigos de recuperación
const createPasswordResetTable = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS PASSWORD_RESET_CODES (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        reset_token VARCHAR(255) NOT NULL UNIQUE,
        expiration DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_code (code),
        INDEX idx_reset_token (reset_token),
        INDEX idx_expiration (expiration)
      )
    `);
    console.log('✅ Tabla PASSWORD_RESET_CODES verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla PASSWORD_RESET_CODES:', error);
  }
};

// Inicializar tablas al cargar el módulo
createTokensTable();
createPasswordResetTable();

// Crear token de usuario en BD
const createUserToken = async (userId, token, expiration) => {
  try {
    await pool.execute(
      'INSERT INTO USER_TOKENS (idUsuario, token, expiration) VALUES (?, ?, ?)',
      [userId, token, expiration]
    );
    console.log('✅ Token guardado en BD para usuario:', userId);
  } catch (error) {
    console.error('❌ Error guardando token en BD:', error);
    throw error;
  }
};

// Verificar si token existe en BD
const validateTokenInDB = async (token) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM USER_TOKENS WHERE token = ? AND expiration > NOW()',
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('❌ Error validando token en BD:', error);
    return null;
  }
};

// Limpiar tokens expirados
const cleanExpiredTokens = async () => {
  try {
    const [result] = await pool.execute('DELETE FROM USER_TOKENS WHERE expiration <= NOW()');
    if (result.affectedRows > 0) {
      console.log(`🧹 Limpiados ${result.affectedRows} tokens expirados`);
    }
  } catch (error) {
    console.error('❌ Error limpiando tokens expirados:', error);
  }
};

// Limpiar tokens expirados cada hora
setInterval(cleanExpiredTokens, 60 * 60 * 1000);

// Generar código de verificación de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar código de recuperación por email (simulado por consola)
const sendPasswordResetEmail = async (email, code) => {
  // En un entorno real, aquí usarías un servicio como SendGrid, Nodemailer, etc.
  console.log('📧 Enviando email de recuperación:');
  console.log(`Para: ${email}`);
  console.log(`Código de verificación: ${code}`);
  console.log('Asunto: Código de recuperación de contraseña - IES RFA');
  console.log(`Mensaje: Su código de verificación es: ${code}. Este código expira en 15 minutos.`);
  
  // Simular envío exitoso
  return { success: true };
};

// Solicitar recuperación de contraseña
const requestPasswordReset = async (email) => {
  try {
    console.log('🔑 Solicitando recuperación de contraseña para:', email);
    
    // Verificar que el usuario existe
    const [users] = await pool.execute(
      'SELECT idUsuario FROM USUARIO WHERE correo = ? AND vigencia = 1',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado o inactivo:', email);
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Generar código de verificación y token de reset
    const verificationCode = generateVerificationCode();
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Calcular fecha de expiración (15 minutos)
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);

    // Limpiar códigos anteriores para este email
    await pool.execute(
      'DELETE FROM PASSWORD_RESET_CODES WHERE email = ?',
      [email]
    );

    // Guardar código en la base de datos
    await pool.execute(
      'INSERT INTO PASSWORD_RESET_CODES (email, code, reset_token, expiration) VALUES (?, ?, ?, ?)',
      [email, verificationCode, resetToken, expiration]
    );

    // Enviar email (simulado)
    const emailResult = await sendPasswordResetEmail(email, verificationCode);
    
    if (emailResult.success) {
      console.log('✅ Código de recuperación enviado para:', email);
      return { success: true, message: 'Código de verificación enviado' };
    } else {
      return { success: false, message: 'Error al enviar el email' };
    }

  } catch (error) {
    console.error('❌ Error en solicitud de recuperación:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

// Verificar código de recuperación
const verifyResetCode = async (email, code) => {
  try {
    console.log('🔍 Verificando código de recuperación para:', email);
    
    const [codes] = await pool.execute(
      'SELECT * FROM PASSWORD_RESET_CODES WHERE email = ? AND code = ? AND expiration > NOW() AND used = FALSE',
      [email, code]
    );

    if (codes.length === 0) {
      console.log('❌ Código inválido o expirado para:', email);
      return { success: false, message: 'Código inválido o expirado' };
    }

    const resetData = codes[0];
    console.log('✅ Código verificado correctamente para:', email);
    
    return { 
      success: true, 
      resetToken: resetData.reset_token,
      message: 'Código verificado correctamente' 
    };

  } catch (error) {
    console.error('❌ Error verificando código:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

// Restablecer contraseña
const resetPassword = async (email, resetToken, newPassword) => {
  try {
    console.log('🔒 Restableciendo contraseña para:', email);
    
    // Verificar token de reset
    const [codes] = await pool.execute(
      'SELECT * FROM PASSWORD_RESET_CODES WHERE email = ? AND reset_token = ? AND expiration > NOW() AND used = FALSE',
      [email, resetToken]
    );

    if (codes.length === 0) {
      console.log('❌ Token de reset inválido o expirado para:', email);
      return { success: false, message: 'Token de reset inválido o expirado' };
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña del usuario
    const [updateResult] = await pool.execute(
      'UPDATE USUARIO SET contrasena = ? WHERE correo = ?',
      [hashedPassword, email]
    );

    if (updateResult.affectedRows === 0) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Marcar código como usado
    await pool.execute(
      'UPDATE PASSWORD_RESET_CODES SET used = TRUE WHERE email = ? AND reset_token = ?',
      [email, resetToken]
    );

    // Invalidar todos los tokens de sesión del usuario
    const [users] = await pool.execute(
      'SELECT idUsuario FROM USUARIO WHERE correo = ?',
      [email]
    );

    if (users.length > 0) {
      await pool.execute(
        'DELETE FROM USER_TOKENS WHERE idUsuario = ?',
        [users[0].idUsuario]
      );
    }

    console.log('✅ Contraseña restablecida exitosamente para:', email);
    return { success: true, message: 'Contraseña actualizada correctamente' };

  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

// Iniciar sesión con JWT
const login = async (correo, contrasena) => {
  try {
    console.log('🔐 Iniciando proceso de login para:', correo);
    
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
      console.log('❌ Usuario no encontrado:', correo);
      return { success: false, message: 'Usuario no encontrado' };
    }

    const user = users[0];

    if (!user.vigencia) {
      console.log('❌ Usuario inactivo:', correo);
      return { success: false, message: 'Usuario inactivo' };
    }

    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);
    
    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta para:', correo);
      return { success: false, message: 'Contraseña incorrecta' };
    }

    const tokenPayload = { 
      id: user.idUsuario, 
      email: user.correo, 
      role: user.role,
      roleId: user.roleId,
      colaboradorId: user.idColaborador,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRATION,
      algorithm: 'HS256' 
    });

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);

    await createUserToken(user.idUsuario, token, expiration);

    console.log('✅ Login exitoso para:', correo, 'Token generado y guardado');

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
    console.error('❌ Error en login:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

// Verificar token JWT
const verifyToken = async (token) => {
  try {
    if (!token || typeof token !== 'string') {
      console.log('❌ Token inválido o no proporcionado');
      return { valid: false, error: 'Token no proporcionado' };
    }

    const cleanToken = token.replace('Bearer ', '').trim();

    const tokenInDB = await validateTokenInDB(cleanToken);
    if (!tokenInDB) {
      console.log('❌ Token no encontrado en BD o expirado');
      return { valid: false, error: 'Token no válido o expirado' };
    }

    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    console.log('✅ Token JWT verificado para usuario ID:', decoded.id);
    
    const userInfo = await getUserInfo(decoded.id);
    
    if (!userInfo.success) {
      console.log('❌ Usuario no encontrado para token válido');
      return { valid: false, error: 'Usuario no encontrado' };
    }
    
    return { 
      valid: true,
      user: userInfo.user,
      decoded
    };
  } catch (error) {
    console.error('❌ Error verificando token:', error.name, ':', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Token JWT inválido' };
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
    console.error('❌ Error obteniendo información del usuario:', error);
    return { success: false, message: 'Error al obtener información del usuario' };
  }
};

// Registrar nuevo usuario con token
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

    const tokenPayload = { 
      id: result.insertId, 
      email: correo, 
      role: 'Estudiante',
      roleId: roleId,
      colaboradorId: null,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRATION,
      algorithm: 'HS256' 
    });

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);

    await createUserToken(result.insertId, token, expiration);

    console.log('✅ Usuario registrado y token generado para:', correo);

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
    console.error('❌ Error en registro:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

// Invalidar token (logout)
const invalidateToken = async (token) => {
  try {
    const cleanToken = token.replace('Bearer ', '').trim();
    const [result] = await pool.execute('DELETE FROM USER_TOKENS WHERE token = ?', [cleanToken]);
    console.log('🔓 Token invalidado:', result.affectedRows > 0 ? 'exitosamente' : 'no encontrado');
    return { success: true };
  } catch (error) {
    console.error('❌ Error invalidando token:', error);
    return { success: false, message: 'Error al invalidar token' };
  }
};

module.exports = {
  login,
  register,
  verifyToken,
  getUserInfo,
  invalidateToken,
  requestPasswordReset,
  verifyResetCode,
  resetPassword
};
