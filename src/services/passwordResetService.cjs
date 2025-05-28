
const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');

// Verificar si un email existe en la base de datos
const checkEmailExists = async (email) => {
  try {
    const [rows] = await pool.execute(
      'SELECT idUsuario, nombre FROM USUARIO WHERE correo = ? AND vigencia = 1',
      [email]
    );
    
    return {
      success: rows.length > 0,
      user: rows.length > 0 ? rows[0] : null
    };
  } catch (error) {
    console.error('Error verificando email:', error);
    return { success: false, error: 'Error del servidor' };
  }
};

// Crear tabla de códigos de verificación si no existe
const createVerificationCodesTable = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS PASSWORD_RESET_CODES (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_code (email, code),
        INDEX idx_expires (expires_at)
      )
    `);
    console.log('✅ Tabla PASSWORD_RESET_CODES verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla PASSWORD_RESET_CODES:', error);
  }
};

// Inicializar tabla al cargar el módulo
createVerificationCodesTable();

// Guardar código de verificación
const saveVerificationCode = async (email, code) => {
  try {
    // Limpiar códigos expirados del email
    await pool.execute(
      'DELETE FROM PASSWORD_RESET_CODES WHERE email = ? OR expires_at < NOW()',
      [email]
    );
    
    // Crear nuevo código con expiración de 10 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    await pool.execute(
      'INSERT INTO PASSWORD_RESET_CODES (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt]
    );
    
    console.log('✅ Código de verificación guardado para:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error guardando código:', error);
    return { success: false, error: 'Error del servidor' };
  }
};

// Verificar código de verificación
const verifyCode = async (email, code) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id FROM PASSWORD_RESET_CODES WHERE email = ? AND code = ? AND expires_at > NOW() AND used = FALSE',
      [email, code]
    );
    
    if (rows.length === 0) {
      return { success: false, error: 'Código inválido o expirado' };
    }
    
    return { success: true, codeId: rows[0].id };
  } catch (error) {
    console.error('❌ Error verificando código:', error);
    return { success: false, error: 'Error del servidor' };
  }
};

// Marcar código como usado y actualizar contraseña
const resetPassword = async (email, newPassword, verificationCode) => {
  try {
    // Verificar código primero
    const verification = await verifyCode(email, verificationCode);
    if (!verification.success) {
      return verification;
    }
    
    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Actualizar contraseña
    const [updateResult] = await pool.execute(
      'UPDATE USUARIO SET contrasena = ? WHERE correo = ?',
      [hashedPassword, email]
    );
    
    if (updateResult.affectedRows === 0) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Marcar código como usado
    await pool.execute(
      'UPDATE PASSWORD_RESET_CODES SET used = TRUE WHERE id = ?',
      [verification.codeId]
    );
    
    console.log('✅ Contraseña actualizada para:', email);
    return { success: true, message: 'Contraseña actualizada exitosamente' };
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    return { success: false, error: 'Error del servidor' };
  }
};

module.exports = {
  checkEmailExists,
  saveVerificationCode,
  verifyCode,
  resetPassword
};
