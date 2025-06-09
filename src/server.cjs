const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./utils/dbConnection.cjs');
const authService = require('./services/authService.cjs');
const userService = require('./services/userService.cjs');
const roleService = require('./services/roleService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const tipoContratoService = require('./services/tipoContratoService.cjs');
const evaluacionService = require('./services/evaluacionService.cjs');
const criteriosService = require('./services/criteriosService.cjs');
const incidenciaService = require('./services/incidenciaService.cjs');
const notificacionService = require('./services/notificacionService.cjs');
const reportesService = require('./services/reportesService.cjs');
const areaService = require('./services/areaService.cjs');
const estudianteService = require('./services/estudianteService.cjs');

const app = express();
const PORT = process.env.PORT || 3309;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test database connection on startup
testConnection()
  .then(success => {
    if (success) {
      console.log('✅ Base de datos conectada y lista para usar');
    } else {
      console.log('❌ No se pudo establecer conexión con la base de datos');
    }
  })
  .catch(error => {
    console.error('❌ Error al probar la conexión:', error);
  });

// ========================
// RUTAS DE AUTENTICACIÓN (SIN PROTECCIÓN)
// ========================

// Login sin JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Intento de login para:', email);
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      });
    }
    
    const result = await authService.login(email, password);
    
    if (result.success) {
      console.log('✅ Login exitoso para:', email);
      res.json({
        success: true,
        message: 'Login exitoso',
        user: result.user
      });
    } else {
      console.log('❌ Login fallido para:', email, '-', result.message);
      res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Solicitar código de recuperación de contraseña
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('🔐 Solicitud de recuperación de contraseña para:', email);
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email es requerido' 
      });
    }
    
    const result = await authService.generatePasswordResetCode(email);
    
    if (result.success) {
      console.log('✅ Código de recuperación generado para:', email);
      res.json({
        success: true,
        message: result.message
      });
    } else {
      console.log('❌ Error generando código para:', email, '-', result.message);
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Verificar código de recuperación
app.post('/api/auth/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    console.log('🔍 Verificación de código para:', email);
    console.log('🔍 Datos recibidos:', { email: !!email, code: !!code, codeLength: code?.length });
    
    if (!email || !code) {
      console.log('❌ Faltan datos requeridos');
      return res.status(400).json({ 
        success: false, 
        message: 'Email y código son requeridos' 
      });
    }

    // Validar formato del código (debe ser 6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      console.log('❌ Formato de código inválido:', code);
      return res.status(400).json({ 
        success: false, 
        message: 'El código debe tener 6 dígitos' 
      });
    }
    
    const result = await authService.verifyPasswordResetCode(email, code);
    
    if (result.success) {
      console.log('✅ Código verificado para:', email);
      res.json({
        success: true,
        message: result.message
      });
    } else {
      console.log('❌ Error verificando código para:', email, '-', result.message);
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en verify-reset-code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Restablecer contraseña
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    console.log('🔐 Restablecimiento de contraseña para:', email);
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, código y nueva contraseña son requeridos' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    const result = await authService.resetPassword(email, code, newPassword);
    
    if (result.success) {
      console.log('✅ Contraseña restablecida para:', email);
      res.json({
        success: true,
        message: result.message
      });
    } else {
      console.log('❌ Error restableciendo contraseña para:', email, '-', result.message);
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    console.log('🔓 Logout exitoso');
    res.json({ success: true, message: 'Logout exitoso' });
  } catch (error) {
    console.error('❌ Error en logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Rutas de roles
app.get('/api/roles', async (req, res) => {
  try {
    console.log('📋 Obteniendo roles');
    const result = await roleService.getAllRoles();
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error en GET /api/roles:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.post('/api/roles', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Nombre del rol es requerido' });
  }
  
  const result = await roleService.createRole(name);
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.status(201).json(result);
});

app.put('/api/roles/:roleId', async (req, res) => {
  const { roleId } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Nombre del rol es requerido' });
  }
  
  const result = await roleService.updateRole(roleId, name);
  
  if (!result.success) {
    return res.status(result.message === 'Rol no encontrado' ? 404 : 500).json({ message: result.message });
  }
  
  res.json(result);
});

app.delete('/api/roles/:roleId', async (req, res) => {
  const { roleId } = req.params;
  const result = await roleService.deleteRole(roleId);
  
  if (!result.success) {
    return res.status(result.message === 'Rol no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas de tipos de colaborador
app.get('/api/tiposcolaborador', async (req, res) => {
  const result = await tipoColaboradorService.getAllTiposColaborador();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/tiposcolaborador', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Nombre del tipo de colaborador es requerido' });
  }
  
  const result = await tipoColaboradorService.createTipoColaborador(name);
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.status(201).json(result);
});

app.put('/api/tiposcolaborador/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Nombre del tipo de colaborador es requerido' });
  }
  
  const result = await tipoColaboradorService.updateTipoColaborador(id, name);
  
  if (!result.success) {
    return res.status(result.message === 'Tipo de colaborador no encontrado' ? 404 : 500).json({ message: result.message });
  }
  
  res.json(result);
});

app.delete('/api/tiposcolaborador/:id', async (req, res) => {
  const { id } = req.params;
  const result = await tipoColaboradorService.deleteTipoColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Tipo de colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas de tipos de contrato
app.get('/api/tiposcontrato', async (req, res) => {
  try {
    console.log('GET /api/tiposcontrato - Fetching all tipos contrato');
    const result = await tipoContratoService.getAllTiposContrato();
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in GET /api/tiposcontrato:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.post('/api/tiposcontrato', async (req, res) => {
  try {
    const { name } = req.body;
    console.log('POST /api/tiposcontrato - Creating new tipo contrato:', name);
    
    if (!name) {
      return res.status(400).json({ message: 'Nombre del tipo de contrato es requerido' });
    }
    
    const result = await tipoContratoService.createTipoContrato(name);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /api/tiposcontrato:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.put('/api/tiposcontrato/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    console.log(`PUT /api/tiposcontrato/${id} - Updating tipo contrato:`, name);
    
    if (!name) {
      return res.status(400).json({ message: 'Nombre del tipo de contrato es requerido' });
    }
    
    const result = await tipoContratoService.updateTipoContrato(id, name);
    
    if (!result.success) {
      return res.status(result.message === 'Tipo de contrato no encontrado' ? 404 : 500).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error in PUT /api/tiposcontrato/${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.delete('/api/tiposcontrato/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/tiposcontrato/${id} - Deleting tipo contrato`);
    
    const result = await tipoContratoService.deleteTipoContrato(id);
    
    if (!result.success) {
      return res.status(result.message === 'Tipo de contrato no encontrado' ? 404 : 400).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error in DELETE /api/tiposcontrato/${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Rutas de colaboradores
app.get('/api/colaboradores', async (req, res) => {
  const result = await colaboradorService.getAllColaboradores();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/colaboradores', async (req, res) => {
  const colaboradorData = req.body;
  
  if (!colaboradorData.nombres || !colaboradorData.apePat || !colaboradorData.dni || !colaboradorData.roleId || !colaboradorData.contractTypeId) {
    return res.status(400).json({ message: 'Faltan campos requeridos para crear el colaborador' });
  }
  
  // Validar y normalizar los datos antes de enviarlos al servicio
  const normalizedData = {
    nombres: colaboradorData.nombres,
    apePat: colaboradorData.apePat,
    apeMat: colaboradorData.apeMat || null,
    birthDate: colaboradorData.birthDate,
    address: colaboradorData.address || null,
    phone: colaboradorData.phone,
    dni: colaboradorData.dni,
    active: colaboradorData.active !== undefined ? colaboradorData.active : true,
    roleId: colaboradorData.roleId,
    startDate: colaboradorData.startDate,
    endDate: colaboradorData.endDate,
    contractActive: colaboradorData.contractActive !== undefined ? colaboradorData.contractActive : true,
    contractTypeId: colaboradorData.contractTypeId,
    areaId: colaboradorData.areaId
  };
  
  const result = await colaboradorService.createColaborador(normalizedData);
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.status(201).json(result);
});

app.put('/api/colaboradores/:id', async (req, res) => {
  const { id } = req.params;
  const colaboradorData = req.body;
  
  if (!colaboradorData.nombres || !colaboradorData.apePat || !colaboradorData.dni || !colaboradorData.roleId || !colaboradorData.contractTypeId) {
    return res.status(400).json({ message: 'Faltan campos requeridos para actualizar el colaborador' });
  }
  
  // Validar y normalizar los datos antes de enviarlos al servicio
  const normalizedData = {
    nombres: colaboradorData.nombres,
    apePat: colaboradorData.apePat,
    apeMat: colaboradorData.apeMat || null,
    birthDate: colaboradorData.birthDate,
    address: colaboradorData.address || null,
    phone: colaboradorData.phone,
    dni: colaboradorData.dni,
    active: colaboradorData.active !== undefined ? colaboradorData.active : true,
    roleId: colaboradorData.roleId,
    startDate: colaboradorData.startDate,
    endDate: colaboradorData.endDate,
    contractActive: colaboradorData.contractActive !== undefined ? colaboradorData.contractActive : true,
    contractTypeId: colaboradorData.contractTypeId,
    areaId: colaboradorData.areaId
  };
  
  const result = await colaboradorService.updateColaborador(id, normalizedData);
  
  if (!result.success) {
    return res.status(result.message === 'Colaborador no encontrado' ? 404 : 500).json({ message: result.message });
  }
  
  res.json(result);
});

app.delete('/api/colaboradores/:id', async (req, res) => {
  const { id } = req.params;
  const result = await colaboradorService.deleteColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas de usuarios
app.get('/api/users', async (req, res) => {
  try {
    const result = await userService.getAllUsers();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error en la ruta de usuarios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/api/users/available-colaboradores', async (req, res) => {
  try {
    const { excludeUserId } = req.query;
    const result = await userService.getAvailableColaboradores(excludeUserId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error en la ruta de colaboradores disponibles:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const result = await userService.createUser(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en la creación de usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await userService.updateUser(userId, req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en la actualización de usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await userService.deleteUser(userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en la eliminación de usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Rutas para gestión de evaluaciones
app.get('/api/evaluaciones', async (req, res) => {
  try {
    const result = await evaluacionService.getAllEvaluaciones();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error en /api/evaluaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/api/evaluaciones/evaluador/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await evaluacionService.getEvaluacionesByEvaluador(userId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error en /api/evaluaciones/evaluador:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/api/evaluaciones/colaborador/:colaboradorId', async (req, res) => {
  try {
    const { colaboradorId } = req.params;
    const result = await evaluacionService.getEvaluacionesByColaborador(colaboradorId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error en /api/evaluaciones/colaborador:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.post('/api/evaluaciones', async (req, res) => {
  try {
    const evaluacionData = req.body;
    console.log('Received evaluation data:', evaluacionData);
    
    const result = await evaluacionService.createEvaluacion(evaluacionData);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in POST /api/evaluaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.put('/api/evaluaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const evaluacionData = req.body;
    
    const result = await evaluacionService.updateEvaluacion(id, evaluacionData);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in PUT /api/evaluaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.delete('/api/evaluaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await evaluacionService.deleteEvaluacion(id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in DELETE /api/evaluaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/api/colaboradores-para-evaluar', async (req, res) => {
  try {
    const result = await evaluacionService.getColaboradoresParaEvaluar();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in /api/colaboradores-para-evaluar:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ========================
// CRITERIOS ROUTES
// ========================

// Obtener todos los criterios
app.get('/api/criterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllCriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en GET /api/criterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener subcriterios por criterio
app.get('/api/criterios/:id/subcriterios', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await criteriosService.getSubcriteriosByCriterio(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Error en GET /api/criterios/:id/subcriterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener todos los subcriterios
app.get('/api/subcriterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllSubcriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en GET /api/subcriterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Agregar el nuevo endpoint para obtener colaborador por user ID
app.get('/api/colaborador-by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await evaluacionService.getColaboradorByUserId(userId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in /api/colaborador-by-user:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ========================
// RUTAS DE INCIDENCIAS
// ========================

// Crear nueva incidencia
app.post('/api/incidencias', async (req, res) => {
  try {
    const incidenciaData = req.body;
    console.log('Creating incidencia:', incidenciaData);
    
    const result = await incidenciaService.createIncidencia(incidenciaData);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in POST /api/incidencias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener incidencias por usuario
app.get('/api/incidencias/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await incidenciaService.getIncidenciasByUser(userId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in GET /api/incidencias/user:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener todas las incidencias
app.get('/api/incidencias', async (req, res) => {
  try {
    const result = await incidenciaService.getAllIncidencias();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in GET /api/incidencias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar estado de incidencia
app.put('/api/incidencias/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const result = await incidenciaService.updateIncidenciaEstado(id, estado);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in PUT /api/incidencias/estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ========================
// RUTAS DE NOTIFICACIONES
// ========================

// Obtener notificaciones por usuario
app.get('/api/notificaciones/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await notificacionService.getNotificacionesByUser(userId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in GET /api/notificaciones/user:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Marcar notificación como leída
app.put('/api/notificaciones/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificacionService.markNotificacionAsRead(id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in PUT /api/notificaciones/read:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener contador de notificaciones no leídas
app.get('/api/notificaciones/unread-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await notificacionService.getUnreadNotificationsCount(userId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in GET /api/notificaciones/unread-count:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ========================
// RUTAS DE REPORTES
// ========================

// Configurando rutas de reportes...

// Reporte de evaluaciones aprobadas
app.get('/api/reportes/evaluaciones-aprobadas', async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluaciones-aprobadas');
    
    const result = await reportesService.getEvaluacionesAprobadas();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error en /api/reportes/evaluaciones-aprobadas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Reporte de evaluaciones desaprobadas
app.get('/api/reportes/evaluaciones-desaprobadas', async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluaciones-desaprobadas');
    
    const result = await reportesService.getEvaluacionesDesaprobadas();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error en /api/reportes/evaluaciones-desaprobadas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Reporte de evaluados con incidencias
app.get('/api/reportes/evaluados-con-incidencias', async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluados-con-incidencias');
    
    const result = await reportesService.getEvaluadosConIncidencias();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in /api/reportes/evaluados-con-incidencias:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Reporte de personal de baja
app.get('/api/reportes/personal-de-baja', async (req, res) => {
  try {
    console.log('GET /api/reportes/personal-de-baja');
    
    const result = await reportesService.getPersonalDeBaja();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in /api/reportes/personal-de-baja:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Reporte de personal con alta calificación
app.get('/api/reportes/personal-alta-calificacion', async (req, res) => {
  try {
    console.log('GET /api/reportes/personal-alta-calificacion');
    
    const result = await reportesService.getPersonalAltaCalificacion();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in /api/reportes/personal-alta-calificacion:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Reporte de evaluaciones por semestre
app.get('/api/reportes/evaluaciones-por-semestre', async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluaciones-por-semestre');
    
    const result = await reportesService.getEvaluacionesPorSemestre();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in GET /api/reportes/evaluaciones-por-semestre:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Reporte de evaluaciones por área
app.get('/api/reportes/evaluaciones-por-area', async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluaciones-por-area');
    
    const result = await reportesService.getEvaluacionesPorArea();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in GET /api/reportes/evaluaciones-por-area:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

console.log('Rutas de reportes configuradas exitosamente');

// Endpoint para obtener datos del gráfico de evaluaciones para el dashboard
app.get('/api/dashboard/evaluations-chart', async (req, res) => {
  try {
    console.log('GET /api/dashboard/evaluations-chart');
    
    // Obtener conteo de evaluaciones por estado
    const [completadas] = await pool.execute(
      'SELECT COUNT(*) as total FROM EVALUACION WHERE estado = "Completada"'
    );
    
    const [pendientes] = await pool.execute(
      'SELECT COUNT(*) as total FROM EVALUACION WHERE estado = "Pendiente"'
    );
    
    const [enRevision] = await pool.execute(
      'SELECT COUNT(*) as total FROM EVALUACION WHERE estado = "En Revisión"'
    );
    
    const [canceladas] = await pool.execute(
      'SELECT COUNT(*) as total FROM EVALUACION WHERE estado = "Cancelada"'
    );
    
    const chartData = [
      { 
        name: 'Completadas', 
        value: completadas[0].total, 
        color: '#22c55e' 
      },
      { 
        name: 'Pendientes', 
        value: pendientes[0].total, 
        color: '#eab308' 
      },
      { 
        name: 'En Revisión', 
        value: enRevision[0].total, 
        color: '#3b82f6' 
      },
      { 
        name: 'Canceladas', 
        value: canceladas[0].total, 
        color: '#ef4444' 
      }
    ];
    
    console.log('Chart data obtenida:', chartData);
    res.json({ 
      success: true, 
      chartData: chartData 
    });
    
  } catch (error) {
    console.error('Error al obtener datos del gráfico de evaluaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los datos del gráfico' 
    });
  }
});

// Endpoint para obtener estadísticas del dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    console.log('GET /api/dashboard/stats');
  
    
    res.json({ success: true, stats: {} });
    
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las estadísticas' });
  }
});

// Endpoint para obtener evaluaciones recientes para el dashboard
app.get('/api/dashboard/recent-evaluations', async (req, res) => {
  try {
    console.log('GET /api/dashboard/recent-evaluations');

    // Sin usuario autenticado, se puede devolver evaluaciones generales o vacías
    const [evaluaciones] = await pool.execute(
      `SELECT e.idEvaluacion as id, e.fechaEvaluacion as fecha, 
              e.puntaje, e.tipo, e.estado,
              CONCAT(evaluado.nombres, ' ', evaluado.apePat, ' ', evaluado.apeMat) as evaluadoNombre,
              CONCAT(evaluador.nombres, ' ', evaluador.apePat, ' ', evaluador.apeMat) as evaluadorNombre
       FROM EVALUACION e
       JOIN COLABORADOR evaluado ON e.idColaborador = evaluado.idColaborador
       JOIN USUARIO u_evaluador ON e.idUsuario = u_evaluador.idUsuario
       JOIN COLABORADOR evaluador ON u_evaluador.idColaborador = evaluador.idColaborador
       ORDER BY e.fechaEvaluacion DESC
       LIMIT 10`
    );
    
    console.log('Recent evaluations fetched:', evaluaciones.length);
    
    res.json({
      success: true,
      evaluaciones: evaluaciones
    });
  } catch (error) {
    console.error('Error fetching recent evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las evaluaciones recientes'
    });
  }
});

// ========================
// RUTAS DE ÁREA (PROTEGIDAS)
// ========================

app.get('/api/areas', async (req, res) => {
  const result = await areaService.getAllAreas();
  if (result.success) {
    res.json({ success: true, areas: result.areas });
  } else {
    res.status(500).json(result);
  }
});

app.post('/api/areas', async (req, res) => {
  const { name, descripcion } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'El nombre es requerido' });
  }
  const result = await areaService.createArea(name, descripcion || '');
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.put('/api/areas/:id', async (req, res) => {
  const { id } = req.params;
  const { name, descripcion } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'El nombre es requerido' });
  }
  const result = await areaService.updateArea(id, name, descripcion || '');
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.delete('/api/areas/:id', async (req, res) => {
  const { id } = req.params;
  const result = await areaService.deleteArea(id);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// Ejecutar la cancelación automática de borradores vencidos cada hora
setInterval(() => {
  evaluacionService.cancelarBorradoresVencidos();
}, 60 * 60 * 1000); // cada 1 hora

// Ejecutar también al iniciar el servidor
(async () => {
  await evaluacionService.cancelarBorradoresVencidos();
})();

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`🔓 Sistema sin autenticación JWT`);
});

app.put('/api/evaluaciones/:id/finalizar', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await evaluacionService.finalizarEvaluacion(id);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error al finalizar evaluación:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ========================
// RUTAS DE ESTUDIANTES
// ========================

// Listar estudiantes
app.get('/api/estudiantes', async (req, res) => {
  try {
    const result = await estudianteService.getAllEstudiantes();
    res.json(result);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Crear estudiante
app.post('/api/estudiantes', async (req, res) => {
  try {
    const result = await estudianteService.createEstudiante(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Actualizar estudiante
app.put('/api/estudiantes/:id', async (req, res) => {
  try {
    const result = await estudianteService.updateEstudiante(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Eliminar estudiante
app.delete('/api/estudiantes/:id', async (req, res) => {
  try {
    const result = await estudianteService.deleteEstudiante(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = app;
