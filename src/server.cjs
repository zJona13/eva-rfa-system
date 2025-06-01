const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('./utils/dbConnection.cjs');
const authService = require('./services/authService.cjs');
const userService = require('./services/userService.cjs');
const evaluacionService = require('./services/evaluacionService.cjs');
const asignacionService = require('./services/asignacionService.cjs');

const app = express();
const PORT = process.env.PORT || 3306;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Acceso denegado. Token no proporcionado.' 
    });
  }

  jwt.verify(token, 'iesrfa_secret_key', (err, user) => {
    if (err) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido o expirado.' 
      });
    }
    req.user = user;
    next();
  });
};

// Rutas públicas
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Usuario y contraseña son requeridos' 
      });
    }
    
    const result = await authService.login(username, password);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Rutas protegidas
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.getUserById(userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para obtener evaluaciones pendientes del usuario
app.get('/api/evaluaciones/pendientes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await evaluacionService.getEvaluacionesPendientes(userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          evaluaciones: result.evaluaciones
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al obtener evaluaciones pendientes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para obtener evaluaciones completadas del usuario
app.get('/api/evaluaciones/completadas', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await evaluacionService.getEvaluacionesCompletadas(userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          evaluaciones: result.evaluaciones
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al obtener evaluaciones completadas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para obtener detalle de una evaluación
app.get('/api/evaluaciones/:id', authenticateToken, async (req, res) => {
  try {
    const evaluacionId = req.params.id;
    const userId = req.user.id;
    
    const result = await evaluacionService.getEvaluacionById(evaluacionId, userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al obtener evaluación:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para completar una evaluación
app.post('/api/evaluaciones/:id/completar', authenticateToken, async (req, res) => {
  try {
    const evaluacionId = req.params.id;
    const userId = req.user.id;
    const { respuestas, comentario } = req.body;
    
    if (!respuestas || !Array.isArray(respuestas)) {
      return res.status(400).json({
        success: false,
        error: 'Las respuestas son requeridas y deben ser un array'
      });
    }
    
    const result = await evaluacionService.completarEvaluacion(
      evaluacionId, 
      userId, 
      respuestas,
      comentario
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          message: result.message
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al completar evaluación:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para obtener áreas
app.get('/api/areas', authenticateToken, async (req, res) => {
  try {
    const result = await asignacionService.getAreas();
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          areas: result.areas
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para crear una asignación
app.post('/api/asignaciones', authenticateToken, async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para crear asignaciones'
      });
    }
    
    const result = await asignacionService.createAsignacion(req.body);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          asignacion: result.asignacion,
          message: result.message
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para obtener todas las asignaciones
app.get('/api/asignaciones', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Obteniendo todas las asignaciones...');
    const result = await asignacionService.getAllAsignaciones();
    
    if (result.success) {
      console.log(`✅ ${result.asignaciones.length} asignaciones obtenidas`);
      res.json({
        success: true,
        data: {
          asignaciones: result.asignaciones
        }
      });
    } else {
      console.log('❌ Error al obtener asignaciones:', result.message);
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en endpoint /asignaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta para actualizar una asignación
app.put('/api/asignaciones/:id', authenticateToken, async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para actualizar asignaciones'
      });
    }
    
    const asignacionId = req.params.id;
    const result = await asignacionService.updateAsignacion(asignacionId, req.body);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          message: result.message
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para eliminar una asignación
app.delete('/api/asignaciones/:id', authenticateToken, async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar asignaciones'
      });
    }
    
    const asignacionId = req.params.id;
    const result = await asignacionService.deleteAsignacion(asignacionId);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          message: result.message
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
