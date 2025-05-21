
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./utils/dbConnection.cjs');
const authService = require('./services/authService.cjs');
const roleService = require('./services/roleService.cjs');

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

// Rutas para gestión de roles
app.get('/api/roles', authenticateJWT, async (req, res) => {
  const result = await roleService.getAllRoles();
  
  if (!result.success) {
    return res.status(500).json({ message: result.message });
  }
  
  res.json(result);
});

app.get('/api/roles/:roleId/users', authenticateJWT, async (req, res) => {
  const { roleId } = req.params;
  const result = await roleService.getUsersByRole(roleId);
  
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
