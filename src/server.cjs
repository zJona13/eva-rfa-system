const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('./utils/dbConnection.cjs');
const app = express();
const PORT = 3306;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

// Importar el servicio de asignaciones
const asignacionService = require('./services/asignacionService.cjs');

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Verificar credenciales
    const [users] = await pool.execute(
      'SELECT u.idUsuario, u.username, u.password, u.idRol, r.nombre as rol FROM USUARIO u JOIN ROL r ON u.idRol = r.idRol WHERE u.username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    
    const user = users[0];
    
    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.idUsuario, 
        username: user.username,
        role: user.rol
      }, 
      'your_jwt_secret', 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token,
      user: {
        id: user.idUsuario,
        username: user.username,
        role: user.rol
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta protegida de ejemplo
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Esta es una ruta protegida', user: req.user });
});

// ====================== RUTAS DE ASIGNACIONES ======================
// Obtener todas las asignaciones
app.get('/api/asignaciones', authenticateToken, async (req, res) => {
  try {
    const result = await asignacionService.getAllAsignaciones();
    res.json(result);
  } catch (error) {
    console.error('Error en GET /api/asignaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener áreas para asignaciones
app.get('/api/asignaciones/areas', authenticateToken, async (req, res) => {
  try {
    const result = await asignacionService.getAreas();
    res.json(result);
  } catch (error) {
    console.error('Error en GET /api/asignaciones/areas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear una nueva asignación
app.post('/api/asignaciones', authenticateToken, async (req, res) => {
  try {
    const { areaId, fechaInicio, fechaFin, horaInicio } = req.body;
    
    if (!areaId || !fechaInicio || !fechaFin || !horaInicio) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    const result = await asignacionService.createAsignacion({
      areaId,
      fechaInicio,
      fechaFin,
      horaInicio
    });

    res.json(result);
  } catch (error) {
    console.error('Error en POST /api/asignaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Actualizar una asignación
app.put('/api/asignaciones/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { areaId, fechaInicio, fechaFin, horaInicio } = req.body;
    
    if (!areaId || !fechaInicio || !fechaFin || !horaInicio) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    const result = await asignacionService.updateAsignacion(id, {
      areaId,
      fechaInicio,
      fechaFin,
      horaInicio
    });

    res.json(result);
  } catch (error) {
    console.error('Error en PUT /api/asignaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Eliminar una asignación
app.delete('/api/asignaciones/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await asignacionService.deleteAsignacion(id);
    res.json(result);
  } catch (error) {
    console.error('Error en DELETE /api/asignaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Cerrar una asignación
app.put('/api/asignaciones/:id/cerrar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await asignacionService.cerrarAsignacion(id);
    res.json(result);
  } catch (error) {
    console.error('Error en PUT /api/asignaciones/cerrar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
