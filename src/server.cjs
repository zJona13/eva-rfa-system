
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

// Import services
const authService = require('./services/authService.cjs');
const asignacionService = require('./services/asignacionService.cjs');
const evaluacionService = require('./services/evaluacionService.cjs');
const userService = require('./services/userService.cjs');
const roleService = require('./services/roleService.cjs');
const areaService = require('./services/areaService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const tipoContratoService = require('./services/tipoContratoService.cjs');
const criteriosService = require('./services/criteriosService.cjs');
const reportesService = require('./services/reportesService.cjs');
const incidenciaService = require('./services/incidenciaService.cjs');
const notificacionService = require('./services/notificacionService.cjs');

const app = express();
const PORT = process.env.PORT || 3306;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret_here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 Middleware de autenticación - Headers recibidos:', req.headers);
    
    const authHeader = req.headers['authorization'];
    console.log('🔍 Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log('❌ No se encontró header de Authorization');
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido',
        error: 'NO_AUTHORIZATION_HEADER' 
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    if (!token || token.trim() === '') {
      console.log('❌ Token vacío o inválido');
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido',
        error: 'NO_TOKEN_PROVIDED' 
      });
    }

    console.log('🔍 Token extraído para validación:', token.substring(0, 20) + '...');

    const verification = await authService.verifyToken(token);
    console.log('🔍 Resultado de verificación:', verification);
    
    if (!verification.valid) {
      console.log('❌ Token inválido:', verification.error);
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido o expirado',
        error: verification.error || 'INVALID_TOKEN'
      });
    }

    req.user = verification.user;
    req.token = token;
    
    console.log('✅ Usuario autenticado:', req.user.name, 'ID:', req.user.id);
    next();
  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: 'AUTHENTICATION_ERROR' 
    });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes (no auth required)
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Intento de login:', req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      });
    }

    const result = await authService.login(email, password);
    
    if (result.success) {
      console.log('✅ Login exitoso para:', email);
      res.json(result);
    } else {
      console.log('❌ Login fallido para:', email, '-', result.message);
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const result = await authService.invalidateToken(req.token);
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('❌ Error en logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    res.json({ 
      success: true, 
      user: req.user 
    });
  } catch (error) {
    console.error('❌ Error obteniendo datos del usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Password recovery routes
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.generatePasswordResetCode(email);
    res.json(result);
  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyPasswordResetCode(email, code);
    res.json(result);
  } catch (error) {
    console.error('❌ Error en verify-code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const result = await authService.resetPassword(email, token, newPassword);
    res.json(result);
  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Protected routes (require authentication)

// Asignaciones routes
app.get('/api/asignaciones', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Obteniendo asignaciones para usuario:', req.user.name);
    const result = await asignacionService.getAllAsignaciones();
    res.json({
      success: result.success,
      data: {
        asignaciones: result.asignaciones || []
      },
      message: result.message
    });
  } catch (error) {
    console.error('❌ Error obteniendo asignaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.post('/api/asignaciones', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Creando nueva asignación por usuario:', req.user.name);
    console.log('📋 Datos recibidos:', req.body);
    
    const result = await asignacionService.createAsignacion(req.body);
    
    if (result.success) {
      console.log('✅ Asignación creada exitosamente');
      res.status(201).json(result);
    } else {
      console.log('❌ Error creando asignación:', result.message);
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error en creación de asignación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.put('/api/asignaciones/:id', authenticateToken, async (req, res) => {
  try {
    const asignacionId = req.params.id;
    const result = await asignacionService.updateAsignacion(asignacionId, req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error actualizando asignación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.delete('/api/asignaciones/:id', authenticateToken, async (req, res) => {
  try {
    const asignacionId = req.params.id;
    const result = await asignacionService.deleteAsignacion(asignacionId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error eliminando asignación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.post('/api/asignaciones/:id/cerrar', authenticateToken, async (req, res) => {
  try {
    const asignacionId = req.params.id;
    const result = await asignacionService.cerrarAsignacion(asignacionId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error cerrando asignación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Areas routes
app.get('/api/areas', authenticateToken, async (req, res) => {
  try {
    console.log('🏢 Obteniendo áreas para usuario:', req.user.name);
    const result = await asignacionService.getAreas();
    res.json({
      success: true,
      data: {
        areas: result.areas || []
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo áreas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Evaluaciones routes
app.get('/api/evaluaciones/disponibles', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Obteniendo evaluaciones disponibles para usuario:', req.user.name);
    const result = await evaluacionService.getEvaluacionesDisponibles(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('❌ Error obteniendo evaluaciones disponibles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.get('/api/evaluaciones/:id', authenticateToken, async (req, res) => {
  try {
    const evaluacionId = req.params.id;
    console.log('📝 Obteniendo evaluación ID:', evaluacionId, 'para usuario:', req.user.name);
    const result = await evaluacionService.getEvaluacionById(evaluacionId, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('❌ Error obteniendo evaluación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

app.post('/api/evaluaciones/:id/completar', authenticateToken, async (req, res) => {
  try {
    const evaluacionId = req.params.id;
    console.log('✅ Completando evaluación ID:', evaluacionId, 'por usuario:', req.user.name);
    console.log('📝 Datos de evaluación recibidos:', req.body);
    
    const result = await evaluacionService.completarEvaluacion(evaluacionId, req.body, req.user.id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error completando evaluación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Static files
app.use(express.static(path.join(__dirname, '../dist')));

// Catch all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📍 API disponible en: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
});

module.exports = app;
