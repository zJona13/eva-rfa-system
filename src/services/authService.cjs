const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here_change_in_production';
const JWT_EXPIRATION = '24h';

// Crear tabla de códigos de recuperación si no existe
const createPasswordResetTable = async () => {
  try {
    // Primero verificar si la tabla existe
    const [tableExists] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'EvaluacionDesempeno' 
      AND table_name = 'PASSWORD_RESET_CODES'
    `);

    if (tableExists[0].count === 0) {
      // Crear tabla si no existe
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS PASSWORD_RESET_CODES (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          code VARCHAR(6) NOT NULL,
          reset_code_token VARCHAR(500) NOT NULL,
          expiration DATETIME NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_code (code),
          INDEX idx_reset_code_token (reset_code_token),
          INDEX idx_expiration (expiration)
        )
      `);
      console.log('✅ Tabla PASSWORD_RESET_CODES creada');
    } else {
      // Verificar si tiene todas las columnas necesarias
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.columns 
        WHERE table_schema = 'EvaluacionDesempeno' 
        AND table_name = 'PASSWORD_RESET_CODES'
      `);
      
      const columnNames = columns.map(col => col.COLUMN_NAME);
      const requiredColumns = ['id', 'email', 'code', 'reset_code_token', 'expiration', 'used', 'created_at'];
      
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('⚠️ Faltan columnas en PASSWORD_RESET_CODES, recreando tabla...');
        await pool.execute('DROP TABLE IF EXISTS PASSWORD_RESET_CODES');
        await pool.execute(`
          CREATE TABLE PASSWORD_RESET_CODES (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            code VARCHAR(6) NOT NULL,
            reset_code_token VARCHAR(500) NOT NULL,
            expiration DATETIME NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_code (code),
            INDEX idx_reset_code_token (reset_code_token),
            INDEX idx_expiration (expiration)
          )
        `);
        console.log('✅ Tabla PASSWORD_RESET_CODES recreada con estructura correcta');
      } else {
        console.log('✅ Tabla PASSWORD_RESET_CODES verificada/existe');
      }
    }
  } catch (error) {
    console.error('❌ Error creando tabla PASSWORD_RESET_CODES:', error);
  }
};

// Inicializar tablas al cargar el módulo
createPasswordResetTable();

// Generar código de verificación para recuperación de contraseña
const generatePasswordResetCode = async (email) => {
  try {
    console.log('🔐 Generando código de recuperación para:', email);
    
    // Verificar que el usuario existe
    const [users] = await pool.execute(
      'SELECT idUsuario FROM USUARIO WHERE correo = ?',
      [email]
    );

    if (users.length === 0) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generar token único para la validación
    const resetToken = jwt.sign({ email, code }, JWT_SECRET, { expiresIn: '15m' });
    
    // Calcular fecha de expiración (15 minutos)
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);

    // Limpiar códigos anteriores del mismo email
    await pool.execute(
      'DELETE FROM PASSWORD_RESET_CODES WHERE email = ?',
      [email]
    );

    // Guardar código en BD
    await pool.execute(
      'INSERT INTO PASSWORD_RESET_CODES (email, code, reset_code_token, expiration) VALUES (?, ?, ?, ?)',
      [email, code, resetToken, expiration]
    );

    // Simular envío de email (en producción aquí iría el servicio de email)
    console.log(`📧 CÓDIGO DE VERIFICACIÓN para ${email}: ${code}`);
    console.log(`⏰ Válido hasta: ${expiration.toLocaleString()}`);

    return {
      success: true,
      message: 'Código de verificación enviado',
      // En producción, NO enviar el código en la respuesta
      code: code // Solo para desarrollo
    };
  } catch (error) {
    console.error('❌ Error generando código de recuperación:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

// Verificar código de recuperación
const verifyPasswordResetCode = async (email, code) => {
  try {
    console.log('🔍 Verificando código de recuperación para:', email);
    console.log('🔍 Código recibido:', code);
    
    // Obtener el código más reciente para este email
    const [codes] = await pool.execute(
      'SELECT * FROM PASSWORD_RESET_CODES WHERE email = ? AND code = ? ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );
    
    console.log('🔍 Códigos encontrados:', codes.length);
    
    if (codes.length === 0) {
      console.log('❌ Código no encontrado para el email y código proporcionados');
      return { success: false, message: 'Código inválido' };
    }

    const resetData = codes[0];
    console.log('🔍 Datos del código encontrado:', {
      code: resetData.code,
      expiration: resetData.expiration,
      used: resetData.used,
      created_at: resetData.created_at
    });
    
    // Verificar si el código ya fue usado
    if (resetData.used) {
      console.log('❌ Código ya fue usado');
      return { success: false, message: 'El código ya ha sido utilizado' };
    }
    
    // Verificar si el código ha expirado
    const now = new Date();
    const expirationDate = new Date(resetData.expiration);
    console.log('🕒 Fecha actual:', now);
    console.log('🕒 Fecha de expiración:', expirationDate);
    
    if (now > expirationDate) {
      console.log('❌ Código expirado');
      return { success: false, message: 'El código ha expirado. Solicita uno nuevo.' };
    }
    
    // Marcar código como usado para evitar reutilización
    await pool.execute(
      'UPDATE PASSWORD_RESET_CODES SET used = TRUE WHERE id = ?',
      [resetData.id]
    );

    console.log('✅ Código verificado correctamente para:', email);

    return {
      success: true,
      reset_code_token: resetData.reset_code_token,
      message: 'Código verificado correctamente'
    };
  } catch (error) {
    console.error('❌ Error verificando código de recuperación:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

// Restablecer contraseña
const resetPassword = async (email, token, newPassword) => {
  try {
    console.log('🔐 Restableciendo contraseña para:', email);
    
    // Verificar token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.email !== email) {
        return { success: false, message: 'Token inválido' };
      }
    } catch (error) {
      return { success: false, message: 'Token expirado o inválido' };
    }

    // Verificar que el token existe en BD y no ha sido usado
    const [tokens] = await pool.execute(
      'SELECT * FROM PASSWORD_RESET_CODES WHERE email = ? AND token = ? AND used = TRUE',
      [email, token]
    );

    if (tokens.length === 0) {
      return { success: false, message: 'Token no válido o ya utilizado' };
    }

    // Hash de la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña en BD
    const [result] = await pool.execute(
      'UPDATE USUARIO SET contrasena = ? WHERE correo = ?',
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Limpiar todos los códigos de recuperación del usuario
    await pool.execute(
      'DELETE FROM PASSWORD_RESET_CODES WHERE email = ?',
      [email]
    );

    // Invalidar todos los tokens activos del usuario
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

    console.log('✅ Contraseña restablecida correctamente para:', email);

    return {
      success: true,
      message: 'Contraseña actualizada correctamente'
    };
  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

// Login sin token
const login = async (correo, contrasena) => {
  try {
    console.log('🔐 Iniciando proceso de login para:', correo);
    
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

    // Login exitoso, retornar solo el usuario
    return {
      success: true,
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

// Registro sin token
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

    // Registro exitoso, retornar solo el usuario
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
    console.error('❌ Error en registro:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

module.exports = {
  login,
  register,
  generatePasswordResetCode,
  verifyPasswordResetCode,
  resetPassword
};
