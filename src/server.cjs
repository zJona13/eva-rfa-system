
const express = require('express');
const cors = require('cors');
const authService = require('./services/authService.cjs');
const roleService = require('./services/roleService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const userService = require('./services/userService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');
const dbConfig = require('./config/dbConfig.cjs');

const app = express();
const PORT = 3306;

// Middleware
app.use(cors());
app.use(express.json());

// Simple token verification middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token' });
  }
  
  const result = await authService.verifyToken(token);
  
  if (!result.valid) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
  
  req.user = result.user;
  next();
};

// Rutas de autenticación (no requieren token)
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  const result = await authService.login(correo, contrasena);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(401).json({ message: result.message });
  }
});

// Rutas protegidas (requieren token)

// Roles
app.get('/api/roles', verifyToken, async (req, res) => {
  const result = await roleService.getAllRoles();
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.post('/api/roles', verifyToken, async (req, res) => {
  const { name } = req.body;
  const result = await roleService.createRole(name);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.put('/api/roles/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = await roleService.updateRole(id, name);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.delete('/api/roles/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await roleService.deleteRole(id);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

// Tipos de Colaborador
app.get('/api/tiposcolaborador', verifyToken, async (req, res) => {
  const result = await tipoColaboradorService.getAllTiposColaborador();
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.post('/api/tiposcolaborador', verifyToken, async (req, res) => {
  const { name } = req.body;
  const result = await tipoColaboradorService.createTipoColaborador(name);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.put('/api/tiposcolaborador/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = await tipoColaboradorService.updateTipoColaborador(id, name);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.delete('/api/tiposcolaborador/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await tipoColaboradorService.deleteTipoColaborador(id);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

// Usuarios
app.get('/api/users', verifyToken, async (req, res) => {
  const result = await userService.getAllUsers();
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.post('/api/users', verifyToken, async (req, res) => {
  const userData = req.body;
  const result = await userService.createUser(userData);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.put('/api/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userData = req.body;
  const result = await userService.updateUser(id, userData);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.delete('/api/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await userService.deleteUser(id);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

// Colaboradores
app.get('/api/colaboradores', verifyToken, async (req, res) => {
  const result = await colaboradorService.getAllColaboradores();
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.post('/api/colaboradores', verifyToken, async (req, res) => {
  const colaboradorData = req.body;
  const result = await colaboradorService.createColaborador(colaboradorData);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.put('/api/colaboradores/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const colaboradorData = req.body;
  const result = await colaboradorService.updateColaborador(id, colaboradorData);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.delete('/api/colaboradores/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await colaboradorService.deleteColaborador(id);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

// Tipos de Contrato
app.get('/api/tiposcontrato', verifyToken, async (req, res) => {
  const result = await colaboradorService.getAllTiposContrato();
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

app.post('/api/tiposcontrato', verifyToken, async (req, res) => {
  const { name } = req.body;
  const result = await colaboradorService.createTipoContrato(name);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ message: result.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`MySQL configurado en ${dbConfig.host}:${dbConfig.port}`);
});

module.exports = app;
