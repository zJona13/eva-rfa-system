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

const app = express();
const PORT = process.env.PORT || 3306;

// Middleware
app.use(cors());
app.use(express.json());

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
const authenticateRequest = (req, res, next) => {
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

// Rutas públicas
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }
  
  try {
    const result = await authService.login(email, password);
    
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Rutas protegidas - usando el middleware temporal
// Obtener información del usuario actual
app.get('/api/auth/me', authenticateRequest, async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  
  try {
    const tokenInfo = await authService.verifyToken(token);
    
    if (!tokenInfo.valid) {
      return res.status(401).json({ message: tokenInfo.error });
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

// Rutas para gestión de roles de usuario
app.get('/api/roles', authenticateRequest, async (req, res) => {
  const result = await roleService.getAllRoles();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/roles', authenticateRequest, async (req, res) => {
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

app.put('/api/roles/:roleId', authenticateRequest, async (req, res) => {
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

app.delete('/api/roles/:roleId', authenticateRequest, async (req, res) => {
  const { roleId } = req.params;
  const result = await roleService.deleteRole(roleId);
  
  if (!result.success) {
    return res.status(result.message === 'Rol no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas para gestión de tipos de colaborador
app.get('/api/tiposcolaborador', authenticateRequest, async (req, res) => {
  const result = await tipoColaboradorService.getAllTiposColaborador();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/tiposcolaborador', authenticateRequest, async (req, res) => {
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

app.put('/api/tiposcolaborador/:id', authenticateRequest, async (req, res) => {
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

app.delete('/api/tiposcolaborador/:id', authenticateRequest, async (req, res) => {
  const { id } = req.params;
  const result = await tipoColaboradorService.deleteTipoColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Tipo de colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas para gestión de tipos de contrato
app.get('/api/tiposcontrato', authenticateRequest, async (req, res) => {
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

app.post('/api/tiposcontrato', authenticateRequest, async (req, res) => {
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

app.put('/api/tiposcontrato/:id', authenticateRequest, async (req, res) => {
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

app.delete('/api/tiposcontrato/:id', authenticateRequest, async (req, res) => {
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

// Rutas para gestión de usuarios
app.get('/api/users', authenticateRequest, async (req, res) => {
  const result = await userService.getAllUsers();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/users', authenticateRequest, async (req, res) => {
  const { name, email, password, active, roleId } = req.body;
  
  if (!name || !email || !password || roleId === undefined) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }
  
  const result = await userService.createUser({ name, email, password, active, roleId });
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.status(201).json(result);
});

app.put('/api/users/:userId', authenticateRequest, async (req, res) => {
  const { userId } = req.params;
  const { name, email, password, active, roleId } = req.body;
  
  if (!name || !email || roleId === undefined) {
    return res.status(400).json({ message: 'Los campos name, email y roleId son requeridos' });
  }
  
  const result = await userService.updateUser(userId, { name, email, password, active, roleId });
  
  if (!result.success) {
    return res.status(result.message === 'Usuario no encontrado' ? 404 : 500).json({ message: result.message });
  }
  
  res.json(result);
});

app.delete('/api/users/:userId', authenticateRequest, async (req, res) => {
  const { userId } = req.params;
  const result = await userService.deleteUser(userId);
  
  if (!result.success) {
    return res.status(result.message === 'Usuario no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas para gestión de colaboradores
app.get('/api/colaboradores', authenticateRequest, async (req, res) => {
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

app.post('/api/colaboradores', authenticateRequest, async (req, res) => {
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

app.put('/api/colaboradores/:id', authenticateRequest, async (req, res) => {
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

app.delete('/api/colaboradores/:id', authenticateRequest, async (req, res) => {
  const { id } = req.params;
  const result = await colaboradorService.deleteColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas para gestión de evaluaciones
app.get('/api/evaluaciones', authenticateRequest, async (req, res) => {
  try {
    console.log('GET /api/evaluaciones - Fetching all evaluaciones');
    const result = await evaluacionService.getAllEvaluaciones();
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in GET /api/evaluaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/api/evaluaciones/evaluador/:userId', authenticateRequest, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`GET /api/evaluaciones/evaluador/${userId} - Fetching evaluaciones by evaluador`);
    
    const result = await evaluacionService.getEvaluacionesByEvaluador(userId);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error in GET /api/evaluaciones/evaluador/${req.params.userId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/api/evaluaciones/colaborador/:colaboradorId', authenticateRequest, async (req, res) => {
  try {
    const { colaboradorId } = req.params;
    console.log(`GET /api/evaluaciones/colaborador/${colaboradorId} - Fetching evaluaciones by colaborador`);
    
    const result = await evaluacionService.getEvaluacionesByColaborador(colaboradorId);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error in GET /api/evaluaciones/colaborador/${req.params.colaboradorId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/api/colaboradores-para-evaluar', authenticateRequest, async (req, res) => {
  try {
    console.log('GET /api/colaboradores-para-evaluar - Fetching colaboradores available for evaluation');
    const result = await evaluacionService.getColaboradoresParaEvaluar();
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in GET /api/colaboradores-para-evaluar:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.post('/api/evaluaciones', authenticateRequest, async (req, res) => {
  try {
    const evaluacionData = req.body;
    console.log('POST /api/evaluaciones - Creating new evaluacion:', evaluacionData);
    
    if (!evaluacionData.type || !evaluacionData.evaluatorId || !evaluacionData.evaluatedId) {
      return res.status(400).json({ message: 'Faltan campos requeridos para crear la evaluación' });
    }
    
    const result = await evaluacionService.createEvaluacion(evaluacionData);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /api/evaluaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.put('/api/evaluaciones/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const evaluacionData = req.body;
    console.log(`PUT /api/evaluaciones/${id} - Updating evaluacion:`, evaluacionData);
    
    if (!evaluacionData.type) {
      return res.status(400).json({ message: 'Tipo de evaluación es requerido' });
    }
    
    const result = await evaluacionService.updateEvaluacion(id, evaluacionData);
    
    if (!result.success) {
      return res.status(result.message === 'Evaluación no encontrada' ? 404 : 500).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error in PUT /api/evaluaciones/${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.delete('/api/evaluaciones/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/evaluaciones/${id} - Deleting evaluacion`);
    
    const result = await evaluacionService.deleteEvaluacion(id);
    
    if (!result.success) {
      return res.status(result.message === 'Evaluación no encontrada' ? 404 : 400).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error in DELETE /api/evaluaciones/${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
