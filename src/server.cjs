
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./utils/dbConnection.cjs');
const authService = require('./services/authService.cjs');
const roleService = require('./services/roleService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const userService = require('./services/userService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Middleware para verificar JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  
  const token = authHeader.split(' ')[1];
  const { valid, user, error } = authService.verifyToken(token);
  
  if (!valid) {
    return res.status(403).json({ message: 'Token inválido', error });
  }
  
  req.user = user;
  next();
};

// Rutas públicas
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }
  
  const result = await authService.login(email, password);
  
  if (!result.success) {
    return res.status(401).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas protegidas
// Obtener información del usuario actual
app.get('/api/auth/me', authenticateJWT, async (req, res) => {
  const result = await authService.getUserInfo(req.user.id);
  
  if (!result.success) {
    return res.status(404).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas para gestión de roles de usuario
app.get('/api/roles', authenticateJWT, async (req, res) => {
  const result = await roleService.getAllRoles();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/roles', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
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

app.put('/api/roles/:roleId', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
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

app.delete('/api/roles/:roleId', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
  const { roleId } = req.params;
  const result = await roleService.deleteRole(roleId);
  
  if (!result.success) {
    return res.status(result.message === 'Rol no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas para gestión de roles de colaborador
app.get('/api/tiposcolaborador', authenticateJWT, async (req, res) => {
  const result = await tipoColaboradorService.getAllTiposColaborador();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/tiposcolaborador', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
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

app.put('/api/tiposcolaborador/:id', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
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

app.delete('/api/tiposcolaborador/:id', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
  const { id } = req.params;
  const result = await tipoColaboradorService.deleteTipoColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Tipo de colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas para gestión de usuarios
app.get('/api/users', authenticateJWT, async (req, res) => {
  const result = await userService.getAllUsers();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/users', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
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

app.put('/api/users/:userId', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
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

app.delete('/api/users/:userId', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
  const { userId } = req.params;
  const result = await userService.deleteUser(userId);
  
  if (!result.success) {
    return res.status(result.message === 'Usuario no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Rutas para gestión de colaboradores
app.get('/api/colaboradores', authenticateJWT, async (req, res) => {
  const result = await colaboradorService.getAllColaboradores();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.get('/api/tiposcontrato', authenticateJWT, async (req, res) => {
  const result = await colaboradorService.getAllTiposContrato();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.post('/api/colaboradores', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
  const colaboradorData = req.body;
  
  if (!colaboradorData.nombres || !colaboradorData.apePat || !colaboradorData.dni || !colaboradorData.roleId || !colaboradorData.contractTypeId) {
    return res.status(400).json({ message: 'Faltan campos requeridos para crear el colaborador' });
  }
  
  const result = await colaboradorService.createColaborador(colaboradorData);
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.status(201).json(result);
});

app.put('/api/colaboradores/:id', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
  const { id } = req.params;
  const colaboradorData = req.body;
  
  if (!colaboradorData.nombres || !colaboradorData.apePat || !colaboradorData.dni || !colaboradorData.roleId || !colaboradorData.contractTypeId) {
    return res.status(400).json({ message: 'Faltan campos requeridos para actualizar el colaborador' });
  }
  
  const result = await colaboradorService.updateColaborador(id, colaboradorData);
  
  if (!result.success) {
    return res.status(result.message === 'Colaborador no encontrado' ? 404 : 500).json({ message: result.message });
  }
  
  res.json(result);
});

app.delete('/api/colaboradores/:id', authenticateJWT, async (req, res) => {
  // Verificar si el usuario tiene rol de administrador
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
  const { id } = req.params;
  const result = await colaboradorService.deleteColaborador(id);
  
  if (!result.success) {
    return res.status(result.message === 'Colaborador no encontrado' ? 404 : 400).json({ message: result.message });
  }
  
  res.json(result);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
