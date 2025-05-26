const express = require('express');
const cors = require('cors');
const session = require('express-session');
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

const app = express();
const PORT = process.env.PORT || 3306;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true // Permitir cookies
}));
app.use(express.json());

// Configurar sesiones
app.use(session({
  secret: 'your-secret-key-here', // En producción, usar una variable de entorno
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // En producción con HTTPS, cambiar a true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Agregar logging middleware para debug
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

// Middleware de autenticación híbrido (sesiones + tokens)
const authenticateSession = async (req, res, next) => {
  console.log('Session middleware - checking authentication...');
  
  // Primero verificar si hay un token en las cookies o headers
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.session?.token || 
                req.cookies?.authToken;
  
  if (token) {
    console.log('Token found, validating...');
    const tokenResult = await authService.validateUserToken(token);
    
    if (tokenResult.success) {
      req.user = tokenResult.user;
      req.session.user = tokenResult.user;
      req.session.token = token;
      console.log('Usuario autenticado via token:', req.user.name, 'Rol:', req.user.role);
      return next();
    } else {
      console.log('Token inválido o expirado');
    }
  }
  
  // Si no hay token válido, verificar sesión tradicional
  if (req.session?.user) {
    req.user = req.session.user;
    console.log('Usuario autenticado via sesión:', req.user.name, 'Rol:', req.user.role);
    return next();
  }
  
  console.log('No hay autenticación válida');
  return res.status(401).json({ message: 'No autenticado' });
};

// ========================
// RUTAS DE AUTENTICACIÓN
// ========================

// Login con tokens y sesiones
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for:', email);
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }
  
  try {
    const result = await authService.login(email, password);
    
    if (result.success) {
      // Guardar usuario y token en la sesión
      req.session.user = result.user;
      req.session.token = result.token;
      
      console.log('User session created for:', result.user.email);
      console.log('Token generated:', result.token.substring(0, 16) + '...');
      
      // También enviar el token en una cookie segura
      res.cookie('authToken', result.token, {
        httpOnly: true,
        secure: false, // En producción cambiar a true
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'lax'
      });
      
      res.json({
        success: true,
        token: result.token,
        user: result.user
      });
    } else {
      res.status(401).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Logout con revocación de tokens
app.post('/api/auth/logout', authenticateSession, async (req, res) => {
  try {
    // Revocar el token si existe
    if (req.session?.token) {
      await authService.revokeUserToken(req.session.token);
      console.log('Token revocado:', req.session.token.substring(0, 16) + '...');
    }
    
    // Destruir la sesión
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Error al cerrar sesión' });
      }
      
      // Limpiar cookie del token
      res.clearCookie('authToken');
      
      console.log('Session and token destroyed successfully');
      res.json({ success: true, message: 'Logout exitoso' });
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener información del usuario actual
app.get('/api/auth/me', authenticateSession, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Verificar validez del token
app.post('/api/auth/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token requerido' });
    }
    
    const result = await authService.validateUserToken(token);
    
    if (result.success) {
      res.json({
        success: true,
        user: result.user
      });
    } else {
      res.status(401).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Revocar todos los tokens de un usuario
app.post('/api/auth/revoke-all-tokens', authenticateSession, async (req, res) => {
  try {
    const result = await authService.revokeAllUserTokens(req.user.id);
    
    if (result.success) {
      res.json({ success: true, message: 'Todos los tokens han sido revocados' });
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error revocando tokens:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ========================
// RESTO DE LAS RUTAS
// ========================

// Rutas de roles
app.get('/api/roles', authenticateSession, async (req, res) => {
  const result = await roleService.getAllRoles();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/roles', authenticateSession, async (req, res) => {
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

app.put('/api/roles/:roleId', authenticateSession, async (req, res) => {
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

app.delete('/api/roles/:roleId', authenticateSession, async (req, res) => {
  const { roleId } = req.params;
  const result = await roleService.deleteRole(roleId);
  
  if (!result.success) {
    return res.status(result.message === 'Rol no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas de tipos de colaborador
app.get('/api/tiposcolaborador', authenticateSession, async (req, res) => {
  const result = await tipoColaboradorService.getAllTiposColaborador();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/tiposcolaborador', authenticateSession, async (req, res) => {
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

app.put('/api/tiposcolaborador/:id', authenticateSession, async (req, res) => {
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

app.delete('/api/tiposcolaborador/:id', authenticateSession, async (req, res) => {
  const { id } = req.params;
  const result = await tipoColaboradorService.deleteTipoColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Tipo de colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas de tipos de contrato
app.get('/api/tiposcontrato', authenticateSession, async (req, res) => {
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

app.post('/api/tiposcontrato', authenticateSession, async (req, res) => {
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

app.put('/api/tiposcontrato/:id', authenticateSession, async (req, res) => {
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

app.delete('/api/tiposcontrato/:id', authenticateSession, async (req, res) => {
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
app.get('/api/colaboradores', authenticateSession, async (req, res) => {
  const result = await colaboradorService.getAllColaboradores();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/colaboradores', authenticateSession, async (req, res) => {
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
    contractTypeId: colaboradorData.contractTypeId
  };
  
  const result = await colaboradorService.createColaborador(normalizedData);
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.status(201).json(result);
});

app.put('/api/colaboradores/:id', authenticateSession, async (req, res) => {
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
    contractTypeId: colaboradorData.contractTypeId
  };
  
  const result = await colaboradorService.updateColaborador(id, normalizedData);
  
  if (!result.success) {
    return res.status(result.message === 'Colaborador no encontrado' ? 404 : 500).json({ message: result.message });
  }
  
  res.json(result);
});

app.delete('/api/colaboradores/:id', authenticateSession, async (req, res) => {
  const { id } = req.params;
  const result = await colaboradorService.deleteColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas de usuarios
app.get('/api/users', authenticateSession, async (req, res) => {
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

app.get('/api/users/available-colaboradores', authenticateSession, async (req, res) => {
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

app.post('/api/users', authenticateSession, async (req, res) => {
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

app.put('/api/users/:id', authenticateSession, async (req, res) => {
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

app.delete('/api/users/:id', authenticateSession, async (req, res) => {
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
app.get('/api/evaluaciones', authenticateSession, async (req, res) => {
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

app.get('/api/evaluaciones/evaluador/:userId', authenticateSession, async (req, res) => {
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

app.get('/api/evaluaciones/colaborador/:colaboradorId', authenticateSession, async (req, res) => {
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

app.post('/api/evaluaciones', authenticateSession, async (req, res) => {
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

app.put('/api/evaluaciones/:id', authenticateSession, async (req, res) => {
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

app.delete('/api/evaluaciones/:id', authenticateSession, async (req, res) => {
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

app.get('/api/colaboradores-para-evaluar', authenticateSession, async (req, res) => {
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
app.get('/api/criterios', authenticateSession, async (req, res) => {
  try {
    const result = await criteriosService.getAllCriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en GET /api/criterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener subcriterios por criterio
app.get('/api/criterios/:id/subcriterios', authenticateSession, async (req, res) => {
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
app.get('/api/subcriterios', authenticateSession, async (req, res) => {
  try {
    const result = await criteriosService.getAllSubcriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en GET /api/subcriterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Agregar el nuevo endpoint para obtener colaborador por user ID
app.get('/api/colaborador-by-user/:userId', authenticateSession, async (req, res) => {
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
app.post('/api/incidencias', authenticateSession, async (req, res) => {
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
app.get('/api/incidencias/user/:userId', authenticateSession, async (req, res) => {
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
app.get('/api/incidencias', authenticateSession, async (req, res) => {
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
app.put('/api/incidencias/:id/estado', authenticateSession, async (req, res) => {
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
app.get('/api/notificaciones/user/:userId', authenticateSession, async (req, res) => {
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
app.put('/api/notificaciones/:id/read', authenticateSession, async (req, res) => {
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
app.get('/api/notificaciones/unread-count/:userId', authenticateSession, async (req, res) => {
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
app.get('/api/reportes/evaluaciones-aprobadas', authenticateSession, async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluaciones-aprobadas - Usuario:', req.user?.name, 'Rol:', req.user?.role);
    
    // Verificar permisos (solo admin y evaluadores)
    const userRole = req.user?.role?.toLowerCase();
    console.log('Verificando permisos para rol:', userRole);
    
    if (!userRole || (!userRole.includes('admin') && !userRole.includes('evaluador'))) {
      console.log('Acceso denegado para rol:', userRole);
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a los reportes'
      });
    }

    console.log('Acceso autorizado, obteniendo datos...');
    const result = await reportesService.getEvaluacionesAprobadas();
    console.log('Resultado evaluaciones aprobadas:', result);
    
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
app.get('/api/reportes/evaluaciones-desaprobadas', authenticateSession, async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluaciones-desaprobadas - Usuario:', req.user?.name, 'Rol:', req.user?.role);
    
    const userRole = req.user?.role?.toLowerCase();
    if (!userRole || (!userRole.includes('admin') && !userRole.includes('evaluador'))) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a los reportes'
      });
    }

    const result = await reportesService.getEvaluacionesDesaprobadas();
    console.log('Resultado evaluaciones desaprobadas:', result);
    
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
app.get('/api/reportes/evaluados-con-incidencias', authenticateSession, async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluados-con-incidencias - Usuario:', req.user?.name, 'Rol:', req.user?.role);
    
    const userRole = req.user?.role?.toLowerCase();
    if (!userRole || (!userRole.includes('admin') && !userRole.includes('evaluador'))) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a los reportes'
      });
    }

    const result = await reportesService.getEvaluadosConIncidencias();
    console.log('Resultado evaluados con incidencias:', result);
    
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
app.get('/api/reportes/personal-de-baja', authenticateSession, async (req, res) => {
  try {
    console.log('GET /api/reportes/personal-de-baja - Usuario:', req.user?.name, 'Rol:', req.user?.role);
    
    const userRole = req.user?.role?.toLowerCase();
    if (!userRole || (!userRole.includes('admin') && !userRole.includes('evaluador'))) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a los reportes'
      });
    }

    const result = await reportesService.getPersonalDeBaja();
    console.log('Resultado personal de baja:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in /api/reportes/personal-de-baja:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Reporte de personal con alta calificación
app.get('/api/reportes/personal-alta-calificacion', authenticateSession, async (req, res) => {
  try {
    console.log('GET /api/reportes/personal-alta-calificacion - Usuario:', req.user?.name, 'Rol:', req.user?.role);
    
    const userRole = req.user?.role?.toLowerCase();
    if (!userRole || (!userRole.includes('admin') && !userRole.includes('evaluador'))) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a los reportes'
      });
    }

    const result = await reportesService.getPersonalAltaCalificacion();
    console.log('Resultado personal alta calificación:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in /api/reportes/personal-alta-calificacion:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Reporte de evaluaciones por semestre
app.get('/api/reportes/evaluaciones-por-semestre', authenticateSession, async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluaciones-por-semestre - Usuario:', req.user?.name, 'Rol:', req.user?.role);
    
    const userRole = req.user?.role?.toLowerCase();
    if (!userRole || (!userRole.includes('admin') && !userRole.includes('evaluador'))) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a los reportes'
      });
    }

    const result = await reportesService.getEvaluacionesPorSemestre();
    console.log('Resultado evaluaciones por semestre:', result);
    
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
app.get('/api/reportes/evaluaciones-por-area', authenticateSession, async (req, res) => {
  try {
    console.log('GET /api/reportes/evaluaciones-por-area - Usuario:', req.user?.name, 'Rol:', req.user?.role);
    
    const userRole = req.user?.role?.toLowerCase();
    if (!userRole || (!userRole.includes('admin') && !userRole.includes('evaluador'))) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a los reportes'
      });
    }

    const result = await reportesService.getEvaluacionesPorArea();
    console.log('Resultado evaluaciones por área:', result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in GET /api/reportes/evaluaciones-por-area:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

console.log('Rutas de reportes configuradas exitosamente');

// Endpoint para obtener estadísticas del dashboard
app.get('/api/dashboard/stats', authenticateSession, async (req, res) => {
  try {
    console.log(`GET /api/dashboard/stats - Usuario: ${req.user?.name} Rol: ${req.user?.role}`);
    
    const userId = req.user.id;
    const userRole = req.user.role;
    const colaboradorId = req.user.colaboradorId;
    
    let stats = {};
    
    if (userRole === 'Evaluado' && colaboradorId) {
      // Estadísticas para evaluados (docentes)
      const [evaluacionesRecibidas] = await pool.execute(
        'SELECT COUNT(*) as total FROM EVALUACION WHERE idColaborador = ?',
        [colaboradorId]
      );
      
      const [evaluacionesAprobadas] = await pool.execute(
        'SELECT COUNT(*) as total FROM EVALUACION WHERE idColaborador = ? AND puntaje >= 11',
        [colaboradorId]
      );
      
      const [promedioCalificacion] = await pool.execute(
        'SELECT AVG(puntaje) as promedio FROM EVALUACION WHERE idColaborador = ?',
        [colaboradorId]
      );
      
      const [incidenciasPersonales] = await pool.execute(
        `SELECT COUNT(i.idIncidencia) as total 
         FROM INCIDENCIA i 
         JOIN USUARIO u ON i.idUsuarioAfectado = u.idUsuario 
         WHERE u.idColaborador = ?`,
        [colaboradorId]
      );
      
      stats = {
        evaluacionesRecibidas: evaluacionesRecibidas[0].total,
        evaluacionesAprobadas: evaluacionesAprobadas[0].total,
        promedioCalificacion: parseFloat(promedioCalificacion[0].promedio || 0).toFixed(1),
        incidenciasPersonales: incidenciasPersonales[0].total
      };
      
    } else if (userRole === 'Administrador' || userRole === 'Evaluador') {
      // Estadísticas generales para administradores y evaluadores
      const [totalEvaluaciones] = await pool.execute(
        'SELECT COUNT(*) as total FROM EVALUACION'
      );
      
      const [evaluacionesPendientes] = await pool.execute(
        'SELECT COUNT(*) as total FROM EVALUACION WHERE estado = "Pendiente"'
      );
      
      const [totalIncidencias] = await pool.execute(
        'SELECT COUNT(*) as total FROM INCIDENCIA'
      );
      
      const [validacionesPendientes] = await pool.execute(
        'SELECT COUNT(*) as total FROM EVALUACION WHERE estado = "En Revisión"'
      );
      
      const [promedioGeneral] = await pool.execute(
        'SELECT AVG(puntaje) as promedio FROM EVALUACION'
      );
      
      stats = {
        totalEvaluaciones: totalEvaluaciones[0].total,
        evaluacionesPendientes: evaluacionesPendientes[0].total,
        totalIncidencias: totalIncidencias[0].total,
        validacionesPendientes: validacionesPendientes[0].total,
        promedioGeneral: parseFloat(promedioGeneral[0].promedio || 0).toFixed(1)
      };
    }
    
    console.log('Dashboard stats obtenidas:', stats);
    res.json({ success: true, stats });
    
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las estadísticas' });
  }
});

// Endpoint para obtener evaluaciones recientes para el dashboard
app.get('/api/dashboard/recent-evaluations', authenticateSession, async (req, res) => {
  try {
    console.log('Getting recent evaluations for user:', req.user.id, 'Role:', req.user.role);

    let query;
    let params = [];

    if (req.user.role === 'Evaluado') {
      // Para usuarios evaluados: mostrar sus evaluaciones recibidas
      query = `
        SELECT e.idEvaluacion as id, e.fechaEvaluacion as fecha, 
               e.puntaje, e.tipo, e.estado,
               CONCAT(evaluador.nombres, ' ', evaluador.apePat, ' ', evaluador.apeMat) as evaluadorNombre
        FROM EVALUACION e
        JOIN USUARIO u_evaluador ON e.idUsuario = u_evaluador.idUsuario
        JOIN COLABORADOR evaluador ON u_evaluador.idColaborador = evaluador.idColaborador
        WHERE e.idColaborador = ?
        ORDER BY e.fechaEvaluacion DESC
        LIMIT 10
      `;
      params = [req.user.colaboradorId];
    } else {
      // Para administradores y evaluadores: mostrar evaluaciones del sistema
      query = `
        SELECT e.idEvaluacion as id, e.fechaEvaluacion as fecha, 
               e.puntaje, e.tipo, e.estado,
               CONCAT(evaluado.nombres, ' ', evaluado.apePat, ' ', evaluado.apeMat) as evaluadoNombre,
               CONCAT(evaluador.nombres, ' ', evaluador.apePat, ' ', evaluador.apeMat) as evaluadorNombre
        FROM EVALUACION e
        JOIN COLABORADOR evaluado ON e.idColaborador = evaluado.idColaborador
        JOIN USUARIO u_evaluador ON e.idUsuario = u_evaluador.idUsuario
        JOIN COLABORADOR evaluador ON u_evaluador.idColaborador = evaluador.idColaborador
        ORDER BY e.fechaEvaluacion DESC
        LIMIT 10
      `;
    }

    const [evaluaciones] = await pool.execute(query, params);
    
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log('Sistema de tokens personalizado activado');
});

module.exports = app;
