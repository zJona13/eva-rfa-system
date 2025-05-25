const express = require('express');
const cors = require('cors');
const { testConnection } = require('./utils/dbConnection.cjs');
const roleService = require('./services/roleService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const tipoContratoService = require('./services/tipoContratoService.cjs');
const userService = require('./services/userService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');
const evaluacionService = require('./services/evaluacionService.cjs');
const authService = require('./services/authService.cjs');
const criteriosService = require('./services/criteriosService.cjs');
const incidenciaService = require('./services/incidenciaService.cjs');
const notificacionService = require('./services/notificacionService.cjs');

const app = express();
const PORT = process.env.PORT || 3306;

// Middleware
app.use(cors());
app.use(express.json());

// Agregar logging middleware para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test database connection on startup
testConnection()
  .then(connected => {
    if (connected) {
      console.log('Base de datos conectada y lista para usar');
    } else {
      console.error('No se pudo establecer conexión con la base de datos');
    }
  });

// Simple middleware for basic authentication (temporary placeholder)
const authenticateToken = (req, res, next) => {
  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  // For now, just check if token is present
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  next();
};

// ========================
// RUTAS DE AUTENTICACIÓN
// ========================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for:', email);
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }
  
  try {
    const result = await authService.login(email, password);
    
    if (!result.success) {
      console.log('Login failed:', result.message);
      return res.status(401).json({ message: result.message });
    }
    
    console.log('Login successful for user:', result.user.email);
    res.json(result);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Logout (opcional)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Aquí podrías invalidar el token si tienes una blacklist
    res.json({ success: true, message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener información del usuario actual
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  
  try {
    const tokenInfo = await authService.verifyToken(token);
    
    if (!tokenInfo.valid) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    const userId = tokenInfo.user.id;
    const userInfo = await authService.getUserInfo(userId);
    
    if (!userInfo.success) {
      return res.status(404).json({ message: userInfo.message });
    }
    
    res.json(userInfo);
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
 
// ========================
// RESTO DE LAS RUTAS
// ========================

// Rutas de roles
app.get('/api/roles', authenticateToken, async (req, res) => {
  const result = await roleService.getAllRoles();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/roles', authenticateToken, async (req, res) => {
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

app.put('/api/roles/:roleId', authenticateToken, async (req, res) => {
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

app.delete('/api/roles/:roleId', authenticateToken, async (req, res) => {
  const { roleId } = req.params;
  const result = await roleService.deleteRole(roleId);
  
  if (!result.success) {
    return res.status(result.message === 'Rol no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas de tipos de colaborador
app.get('/api/tiposcolaborador', authenticateToken, async (req, res) => {
  const result = await tipoColaboradorService.getAllTiposColaborador();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/tiposcolaborador', authenticateToken, async (req, res) => {
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

app.put('/api/tiposcolaborador/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/tiposcolaborador/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await tipoColaboradorService.deleteTipoColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Tipo de colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas de tipos de contrato
app.get('/api/tiposcontrato', authenticateToken, async (req, res) => {
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

app.post('/api/tiposcontrato', authenticateToken, async (req, res) => {
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

app.put('/api/tiposcontrato/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/tiposcontrato/:id', authenticateToken, async (req, res) => {
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
app.get('/api/colaboradores', authenticateToken, async (req, res) => {
  const result = await colaboradorService.getAllColaboradores();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

// app.get('/api/tiposcontrato', authenticateRequest, async (req, res) => {
//   const result = await colaboradorService.getAllTiposContrato();
  
//   if (!result.success) {
//     return res.status(500).json({ message: result.message });
//   }
  
//   res.json(result);
// });

app.post('/api/colaboradores', authenticateToken, async (req, res) => {
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

app.put('/api/colaboradores/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/colaboradores/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await colaboradorService.deleteColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas de usuarios
app.get('/api/users', authenticateToken, async (req, res) => {
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

app.get('/api/users/available-colaboradores', authenticateToken, async (req, res) => {
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

app.post('/api/users', authenticateToken, async (req, res) => {
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

app.put('/api/users/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
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
app.get('/api/evaluaciones', authenticateToken, async (req, res) => {
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

app.get('/api/evaluaciones/evaluador/:userId', authenticateToken, async (req, res) => {
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

app.get('/api/evaluaciones/colaborador/:colaboradorId', authenticateToken, async (req, res) => {
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

app.post('/api/evaluaciones', authenticateToken, async (req, res) => {
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

app.put('/api/evaluaciones/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/evaluaciones/:id', authenticateToken, async (req, res) => {
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

app.get('/api/colaboradores-para-evaluar', authenticateToken, async (req, res) => {
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
app.get('/api/criterios', authenticateToken, async (req, res) => {
  try {
    const result = await criteriosService.getAllCriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en GET /api/criterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener subcriterios por criterio
app.get('/api/criterios/:id/subcriterios', authenticateToken, async (req, res) => {
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
app.get('/api/subcriterios', authenticateToken, async (req, res) => {
  try {
    const result = await criteriosService.getAllSubcriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en GET /api/subcriterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Agregar el nuevo endpoint para obtener colaborador por user ID
app.get('/api/colaborador-by-user/:userId', authenticateToken, async (req, res) => {
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
app.post('/api/incidencias', authenticateToken, async (req, res) => {
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
app.get('/api/incidencias/user/:userId', authenticateToken, async (req, res) => {
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
app.get('/api/incidencias', authenticateToken, async (req, res) => {
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
app.put('/api/incidencias/:id/estado', authenticateToken, async (req, res) => {
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
app.get('/api/notificaciones/user/:userId', authenticateToken, async (req, res) => {
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
app.put('/api/notificaciones/:id/read', authenticateToken, async (req, res) => {
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
app.get('/api/notificaciones/unread-count/:userId', authenticateToken, async (req, res) => {
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
