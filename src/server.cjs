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

// Usuario mock temporal (sin autenticación)
const MOCK_USER = {
  id: 2,
  name: 'Usuario Administrador',
  email: 'admin@iesrfa.edu.pe',
  role: 'Administrador',
  roleId: 1,
  active: true,
  colaboradorId: 1,
  colaboradorName: 'Administrador Sistema'
};

// Middleware simplificado sin autenticación JWT
const authenticateToken = async (req, res, next) => {
  console.log('⚠️ AUTENTICACIÓN DESHABILITADA - Usando usuario mock');
  
  // Asignar usuario mock directamente
  req.user = MOCK_USER;
  console.log('Usuario asignado:', req.user.name, 'Rol:', req.user.role);
  
  next();
};

// ========================
// RUTAS DE AUTENTICACIÓN
// ========================

// Login simplificado (sin JWT)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for:', email);
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }
  
  try {
    // Simulación de login exitoso
    const mockResponse = {
      success: true,
      user: MOCK_USER,
      token: 'mock-token' // Token simulado
    };
    
    console.log('Login successful (mock) for user:', email);
    res.json(mockResponse);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener información del usuario actual
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userInfo = {
      success: true,
      user: req.user
    };
    
    res.json(userInfo);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
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

// ========================
// RUTAS DE REPORTES
// ========================

// Configurando rutas de reportes...

// Reporte de evaluaciones aprobadas
app.get('/api/reportes/evaluaciones-aprobadas', authenticateToken, async (req, res) => {
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
app.get('/api/reportes/evaluaciones-desaprobadas', authenticateToken, async (req, res) => {
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
app.get('/api/reportes/evaluados-con-incidencias', authenticateToken, async (req, res) => {
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
app.get('/api/reportes/personal-de-baja', authenticateToken, async (req, res) => {
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
app.get('/api/reportes/personal-alta-calificacion', authenticateToken, async (req, res) => {
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
app.get('/api/reportes/evaluaciones-por-semestre', authenticateToken, async (req, res) => {
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
app.get('/api/reportes/evaluaciones-por-area', authenticateToken, async (req, res) => {
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
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
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
app.get('/api/dashboard/recent-evaluations', authenticateToken, async (req, res) => {
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
});

module.exports = app;
