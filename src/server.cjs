const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const areaService = require('./services/areaService.cjs');
const asignacionService = require('./services/asignacionService.cjs');
const userService = require('./services/userService.cjs');
const roleService = require('./services/roleService.cjs');
const { pool } = require('./utils/dbConnection.cjs');

const app = express();
const port = 3306;

app.use(cors());
app.use(express.json());

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('⚠️ No se proporcionó token');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      console.log('❌ Token inválido:', err.message);
      return res.sendStatus(403);
    }
    
    // Obtener el rol del usuario desde la base de datos
    const [dbUser] = await pool.execute(
      'SELECT u.idUsuario as id, u.nombre, u.correo, tu.nombre as role, c.idColaborador as colaboradorId, CONCAT(c.nombres, " ", c.apePat, " ", c.apeMat) as colaboradorName FROM USUARIO u JOIN TIPO_USUARIO tu ON u.idTipoUsu = tu.idTipoUsu LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador WHERE u.idUsuario = ?',
      [user.id]
    );
    
    if (dbUser.length === 0) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return res.sendStatus(403);
    }
    
    req.user = dbUser[0];
    next();
  });
};

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Attempting login for email: ${email}`);

    const result = await userService.authenticateUser(email, password);

    if (result.success) {
      const user = result.user;
      console.log(`User authenticated: ${user.nombre}`);

      // Crear el token JWT con la información del usuario
      const token = jwt.sign({
        id: user.id,
        email: user.correo,
        role: user.role
      }, process.env.JWT_SECRET, { expiresIn: '24h' });

      console.log(`JWT Token generated for user ${user.id}`);

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.nombre,
          email: user.correo,
          role: user.role,
          colaboradorId: user.colaboradorId,
          colaboradorName: user.colaboradorName
        },
        token: token,
        message: 'Login exitoso'
      });
    } else {
      console.log(`Authentication failed: ${result.message}`);
      res.status(401).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  console.log(`Verifying token for user: ${req.user.nombre}`);
  
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.nombre,
      email: req.user.correo,
      role: req.user.role,
      colaboradorId: req.user.colaboradorId,
      colaboradorName: req.user.colaboradorName
    }
  });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // En un sistema real, aquí se invalidaría el token en el servidor
  console.log(`User ${req.user.nombre} logged out`);
  res.json({ success: true, message: 'Logout exitoso' });
});

// Rutas de roles
app.get('/api/roles', authenticateToken, async (req, res) => {
  try {
    console.log('Obteniendo todos los roles...');
    const result = await roleService.getAllRoles();
    
    if (result.success) {
      console.log('Roles obtenidos exitosamente:', result.roles?.length || 0);
      res.json({
        success: true,
        data: {
          roles: result.roles || []
        }
      });
    } else {
      console.log('Error al obtener roles:', result.message);
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error en endpoint /api/roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Rutas de áreas
app.get('/api/areas', async (req, res) => {
  try {
    console.log('🔍 Obteniendo todas las áreas...');
    const result = await areaService.getAllAreas();
    
    if (result.success) {
      console.log('✅ Áreas obtenidas exitosamente:', result.areas?.length || 0);
      res.json({
        success: true,
        data: {
          areas: result.areas || []
        }
      });
    } else {
      console.log('❌ Error al obtener áreas:', result.message);
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en endpoint /api/areas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Rutas de asignaciones
app.get('/api/asignaciones', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Obteniendo asignaciones...');
    const result = await asignacionService.getAllAsignaciones();
    
    if (result.success) {
      console.log('✅ Asignaciones obtenidas:', result.asignaciones?.length || 0);
      res.json({
        success: true,
        data: {
          asignaciones: result.asignaciones || []
        }
      });
    } else {
      console.log('❌ Error al obtener asignaciones:', result.message);
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en endpoint /api/asignaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

app.post('/api/asignaciones', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Creando nueva asignación:', req.body);
    const result = await asignacionService.createAsignacion(req.body);
    
    if (result.success) {
      console.log('✅ Asignación creada exitosamente');
      res.json({
        success: true,
        data: result,
        message: result.message
      });
    } else {
      console.log('❌ Error al crear asignación:', result.message);
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en POST /api/asignaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

app.put('/api/asignaciones/:id', authenticateToken, async (req, res) => {
  try {
    const asignacionId = req.params.id;
    console.log(`📝 Actualizando asignación ${asignacionId}:`, req.body);
    
    const result = await asignacionService.updateAsignacion(asignacionId, req.body);
    
    if (result.success) {
      console.log('✅ Asignación actualizada exitosamente');
      res.json({
        success: true,
        data: result,
        message: result.message
      });
    } else {
      console.log('❌ Error al actualizar asignación:', result.message);
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en PUT /api/asignaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

app.delete('/api/asignaciones/:id', authenticateToken, async (req, res) => {
  try {
    const asignacionId = req.params.id;
    console.log(`🗑️ Eliminando asignación ${asignacionId}`);
    
    const result = await asignacionService.deleteAsignacion(asignacionId);
    
    if (result.success) {
      console.log('✅ Asignación eliminada exitosamente');
      res.json({
        success: true,
        message: result.message
      });
    } else {
      console.log('❌ Error al eliminar asignación:', result.message);
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error en DELETE /api/asignaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Nuevo endpoint para obtener evaluaciones según el rol del usuario
app.get('/api/evaluaciones/my-evaluations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`🔍 Obteniendo evaluaciones para usuario ${userId} con rol ${userRole}`);
    
    let query = '';
    let params = [userId];
    
    // Filtrar evaluaciones según el rol del usuario
    switch (userRole) {
      case 'Evaluador':
        // Supervisión (Evaluador-Evaluado)
        query = `
          SELECT e.*, c.nombres, c.apePat, c.apeMat, a.areaNombre, asig.fecha_inicio, asig.fecha_fin
          FROM EVALUACION e
          JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
          JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
          JOIN ASIGNACION asig ON da.idAsignacion = asig.idAsignacion
          JOIN AREA a ON asig.idArea = a.idArea
          WHERE e.idUsuario = ? AND e.tipo = 'Evaluador-Evaluado'
          ORDER BY e.fechaEvaluacion DESC
        `;
        break;
        
      case 'Evaluado':
      case 'Docente':
        // Autoevaluación
        query = `
          SELECT e.*, c.nombres, c.apePat, c.apeMat, a.areaNombre, asig.fecha_inicio, asig.fecha_fin
          FROM EVALUACION e
          JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
          JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
          JOIN ASIGNACION asig ON da.idAsignacion = asig.idAsignacion
          JOIN AREA a ON asig.idArea = a.idArea
          WHERE e.idUsuario = ? AND e.tipo = 'Autoevaluacion'
          ORDER BY e.fechaEvaluacion DESC
        `;
        break;
        
      case 'Estudiante':
        // Evaluación Estudiante-Docente
        query = `
          SELECT e.*, c.nombres, c.apePat, c.apeMat, a.areaNombre, asig.fecha_inicio, asig.fecha_fin
          FROM EVALUACION e
          JOIN COLABORADOR c ON e.idColaborador = c.idColaborador
          JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
          JOIN ASIGNACION asig ON da.idAsignacion = asig.idAsignacion
          JOIN AREA a ON asig.idArea = a.idArea
          WHERE e.idUsuario = ? AND e.tipo = 'Estudiante-Docente'
          ORDER BY e.fechaEvaluacion DESC
        `;
        break;
        
      default:
        return res.status(403).json({
          success: false,
          message: 'Rol no autorizado para ver evaluaciones'
        });
    }
    
    const [evaluaciones] = await pool.execute(query, params);
    
    console.log(`✅ Encontradas ${evaluaciones.length} evaluaciones para el usuario`);
    
    res.json({
      success: true,
      data: {
        evaluaciones: evaluaciones,
        userRole: userRole
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo evaluaciones del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
