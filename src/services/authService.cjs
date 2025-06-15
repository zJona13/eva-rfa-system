const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'supersecreto123'; // Usa variable de entorno en producción

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
          expiration DATETIME NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_code (code),
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
      const requiredColumns = ['id', 'email', 'code', 'expiration', 'used', 'created_at'];
      
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('⚠️ Faltan columnas en PASSWORD_RESET_CODES, recreando tabla...');
        await pool.execute('DROP TABLE IF EXISTS PASSWORD_RESET_CODES');
        await pool.execute(`
          CREATE TABLE PASSWORD_RESET_CODES (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            code VARCHAR(6) NOT NULL,
            expiration DATETIME NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_code (code),
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
      'INSERT INTO PASSWORD_RESET_CODES (email, code, expiration) VALUES (?, ?, ?)',
      [email, code, expiration]
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
      message: 'Código verificado correctamente'
    };
  } catch (error) {
    console.error('❌ Error verificando código de recuperación:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

const resetPassword = async (email, code, newPassword) => {
  try {
    console.log('🔐 Restableciendo contraseña para:', email);
    
    // Verificar que el código existe y es válido
    const [codes] = await pool.execute(
      'SELECT * FROM PASSWORD_RESET_CODES WHERE email = ? AND code = ? AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );

    if (codes.length === 0) {
      return { success: false, message: 'Código no válido o ya utilizado' };
    }

    const resetData = codes[0];
    
    // Verificar si el código ha expirado
    const now = new Date();
    const expirationDate = new Date(resetData.expiration);
    
    if (now > expirationDate) {
      return { success: false, message: 'El código ha expirado. Solicita uno nuevo.' };
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

const login = async (correo, contrasena) => {
  try {
    console.log('🔐 Iniciando proceso de login para:', correo);
    // Consulta ajustada a la estructura real de la base de datos
    const [users] = await pool.execute(
      `SELECT u.idUsuario, u.correo, u.contrasena, u.estado,
              t.nombre as role, t.idTipoUsuario as roleId, u.idColaborador,
              CASE 
                WHEN u.idColaborador IS NOT NULL 
                THEN CONCAT(c.nombreColaborador, ' ', c.apePaColaborador, ' ', c.apeMaColaborador)
                ELSE ''
              END as colaboradorName
       FROM USUARIO u 
       JOIN TIPO_USUARIO t ON u.idTipoUsuario = t.idTipoUsuario 
       LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       WHERE u.correo = ?`,
      [correo]
    );

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado:', correo);
      return { success: false, message: 'Usuario no encontrado' };
    }

    const user = users[0];

    if (user.estado !== 'Activo') {
      console.log('❌ Usuario inactivo:', correo);
      return { success: false, message: 'Usuario inactivo' };
    }

    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta para:', correo);
      return { success: false, message: 'Contraseña incorrecta' };
    }

    let estudianteName = null;
    if (user.role.toLowerCase() === 'estudiante') {
      // Buscar nombre completo del estudiante
      const [estRows] = await pool.execute(
        `SELECT CONCAT(nombreEstudiante, ' ', apePaEstudiante, ' ', apeMaEstudiante) as estudianteName FROM ESTUDIANTE WHERE idUsuario = ?`,
        [user.idUsuario]
      );
      if (estRows.length > 0) {
        estudianteName = estRows[0].estudianteName;
      }
    }

    // Login exitoso, generar token
    const payload = {
      id: user.idUsuario,
      email: user.correo,
      role: user.role,
      colaboradorId: user.idColaborador,
      colaboradorName: user.colaboradorName,
      estudianteName: estudianteName,
      name: user.colaboradorName || estudianteName || user.correo
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '8h' });

    return {
      success: true,
      user: payload,
      token
    };
  } catch (error) {
    console.error('❌ Error en login:', error);
    return { success: false, message: 'Error en el servidor' };
  }
};

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
  resetPassword,
  SECRET_KEY
};
