const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { pool } = require('./utils/dbConnection.cjs');
const authService = require('./services/authService.cjs');

const app = express();
const port = 3306;

// Configurar CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(bodyParser.json());

// Middleware para verificar token en rutas protegidas
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    
    // Extraer token del header Authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // También verificar en el body para compatibilidad
    if (!token && req.body.token) {
      token = req.body.token;
    }
    
    console.log('Verificando token:', token ? token.substring(0, 16) + '...' : 'No token provided');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    // Validar token con el servicio de autenticación
    const result = await authService.validateUserToken(token);
    
    if (!result.success) {
      console.log('Token validation failed:', result.message);
      return res.status(401).json({ 
        success: false, 
        message: result.message 
      });
    }

    // Agregar información del usuario a la request
    req.user = result.user;
    req.token = token;
    console.log('Token validated successfully for user:', result.user.name);
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Rutas de prueba
app.get('/api', (req, res) => {
  res.send('¡Hola desde la API!');
});

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Acceso concedido',
    user: req.user
  });
});

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    
    const result = await authService.login(email, password);
    
    if (result.success) {
      console.log('Login successful, sending response');
      res.json(result);
    } else {
      console.log('Login failed:', result.message);
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Verificar token
app.post('/api/auth/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    
    // Extraer token del header Authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // También verificar en el body para compatibilidad
    if (!token && req.body.token) {
      token = req.body.token;
    }
    
    console.log('Verify token request:', token ? token.substring(0, 16) + '...' : 'No token');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    const result = await authService.validateUserToken(token);
    
    if (result.success) {
      console.log('Token verification successful for user:', result.user.name);
      res.json(result);
    } else {
      console.log('Token verification failed:', result.message);
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Logout
app.post('/api/auth/logout', verifyToken, async (req, res) => {
  try {
    const token = req.token;
    console.log('Logout request for token:', token.substring(0, 16) + '...');
    
    const result = await authService.revokeUserToken(token);
    
    if (result.success) {
      console.log('Token revoked successfully');
      res.json({ success: true, message: 'Logout exitoso' });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Revocar todos los tokens del usuario
app.post('/api/auth/revoke-all-tokens', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Revoking all tokens for user:', userId);
    
    const result = await authService.revokeAllUserTokens(userId);
    
    if (result.success) {
      console.log('All tokens revoked successfully for user:', userId);
      res.json({ success: true, message: 'Todos los tokens revocados' });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error revocando todos los tokens:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener información del usuario
app.get('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await authService.getUserInfo(userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
