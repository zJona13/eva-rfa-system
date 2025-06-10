const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

// Import services
const authService = require('./services/authService.cjs');
const userService = require('./services/userService.cjs');
const roleService = require('./services/roleService.cjs');
const areaService = require('./services/areaService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const tipoContratoService = require('./services/tipoContratoService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');
const estudianteService = require('./services/estudianteService.cjs');
const evaluacionService = require('./services/evaluacionService.cjs');
const criteriosService = require('./services/criteriosService.cjs');
const incidenciaService = require('./services/incidenciaService.cjs');
const notificacionService = require('./services/notificacionService.cjs');
const reportesService = require('./services/reportesService.cjs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: 'evaluation-system-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Auth routes
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    if (result.success) {
      req.session.user = result.user;
      req.session.isAuthenticated = true;
      
      res.json({
        success: true,
        message: result.message,
        user: result.user
      });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  });
});

app.get('/user', (req, res) => {
  if (req.session.isAuthenticated) {
    res.json({
      success: true,
      user: req.session.user
    });
  } else {
    res.status(401).json({ success: false, message: 'No autenticado' });
  }
});

// Users routes
app.get('/users', async (req, res) => {
  try {
    const result = await userService.getAllUsers();
    res.json(result);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const result = await userService.createUser(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Roles routes
app.get('/roles', async (req, res) => {
  try {
    const result = await roleService.getAllRoles();
    res.json(result);
  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/roles', async (req, res) => {
  try {
    const result = await roleService.createRole(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/roles/:id', async (req, res) => {
  try {
    const result = await roleService.updateRole(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/roles/:id', async (req, res) => {
  try {
    const result = await roleService.deleteRole(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Areas routes
app.get('/areas', async (req, res) => {
  try {
    const result = await areaService.getAllAreas();
    res.json(result);
  } catch (error) {
    console.error('Error getting areas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/areas', async (req, res) => {
  try {
    const result = await areaService.createArea(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating area:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/areas/:id', async (req, res) => {
  try {
    const result = await areaService.updateArea(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating area:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/areas/:id', async (req, res) => {
  try {
    const result = await areaService.deleteArea(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting area:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Tipo Colaborador routes
app.get('/tipo-colaboradores', async (req, res) => {
  try {
    const result = await tipoColaboradorService.getAllTipoColaboradores();
    res.json(result);
  } catch (error) {
    console.error('Error getting tipo colaboradores:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/tipo-colaboradores', async (req, res) => {
  try {
    const result = await tipoColaboradorService.createTipoColaborador(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating tipo colaborador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/tipo-colaboradores/:id', async (req, res) => {
  try {
    const result = await tipoColaboradorService.updateTipoColaborador(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating tipo colaborador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/tipo-colaboradores/:id', async (req, res) => {
  try {
    const result = await tipoColaboradorService.deleteTipoColaborador(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting tipo colaborador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Tipo Contrato routes
app.get('/tipo-contratos', async (req, res) => {
  try {
    const result = await tipoContratoService.getAllTipoContratos();
    res.json(result);
  } catch (error) {
    console.error('Error getting tipo contratos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/tipo-contratos', async (req, res) => {
  try {
    const result = await tipoContratoService.createTipoContrato(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating tipo contrato:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/tipo-contratos/:id', async (req, res) => {
  try {
    const result = await tipoContratoService.updateTipoContrato(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating tipo contrato:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/tipo-contratos/:id', async (req, res) => {
  try {
    const result = await tipoContratoService.deleteTipoContrato(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting tipo contrato:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Colaboradores routes
app.get('/colaboradores', async (req, res) => {
  try {
    const result = await colaboradorService.getAllColaboradores();
    res.json(result);
  } catch (error) {
    console.error('Error getting colaboradores:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/colaboradores', async (req, res) => {
  try {
    const result = await colaboradorService.createColaborador(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating colaborador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/colaboradores/:id', async (req, res) => {
  try {
    const result = await colaboradorService.updateColaborador(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating colaborador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/colaboradores/:id', async (req, res) => {
  try {
    const result = await colaboradorService.deleteColaborador(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting colaborador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Estudiantes routes
app.get('/estudiantes', async (req, res) => {
  try {
    const result = await estudianteService.getAllEstudiantes();
    res.json(result);
  } catch (error) {
    console.error('Error getting estudiantes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/estudiantes', async (req, res) => {
  try {
    const result = await estudianteService.createEstudiante(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating estudiante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/estudiantes/:id', async (req, res) => {
  try {
    const result = await estudianteService.updateEstudiante(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating estudiante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/estudiantes/:id', async (req, res) => {
  try {
    const result = await estudianteService.deleteEstudiante(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting estudiante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Evaluaciones routes
app.get('/evaluaciones', async (req, res) => {
  try {
    const result = await evaluacionService.getAllEvaluaciones();
    res.json(result);
  } catch (error) {
    console.error('Error getting evaluaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/evaluaciones/evaluador/:userId', async (req, res) => {
  try {
    const result = await evaluacionService.getEvaluacionesByEvaluador(req.params.userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting evaluaciones by evaluador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/evaluaciones/colaborador/:colaboradorId', async (req, res) => {
  try {
    const result = await evaluacionService.getEvaluacionesByColaborador(req.params.colaboradorId);
    res.json(result);
  } catch (error) {
    console.error('Error getting evaluaciones by colaborador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/evaluaciones', async (req, res) => {
  try {
    const result = await evaluacionService.createEvaluacion(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating evaluacion:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/evaluaciones/:id', async (req, res) => {
  try {
    const result = await evaluacionService.updateEvaluacion(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating evaluacion:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/evaluaciones/:id', async (req, res) => {
  try {
    const result = await evaluacionService.deleteEvaluacion(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting evaluacion:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/colaboradores-para-evaluar', async (req, res) => {
  try {
    const result = await evaluacionService.getColaboradoresParaEvaluar();
    res.json(result);
  } catch (error) {
    console.error('Error getting colaboradores para evaluar:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/colaborador-by-user/:userId', async (req, res) => {
  try {
    const result = await evaluacionService.getColaboradorByUserId(req.params.userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting colaborador by user:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/evaluaciones/:id/finalizar', async (req, res) => {
  try {
    const result = await evaluacionService.finalizarEvaluacion(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error finalizando evaluacion:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Criterios routes - NEW
app.get('/criterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllCriterios();
    res.json(result);
  } catch (error) {
    console.error('Error getting criterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/subcriterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllSubcriterios();
    res.json(result);
  } catch (error) {
    console.error('Error getting subcriterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/subcriterios-agrupados', async (req, res) => {
  try {
    const result = await criteriosService.getSubcriteriosAgrupados();
    res.json(result);
  } catch (error) {
    console.error('Error getting subcriterios agrupados:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/subcriterios/criterio/:criterioId', async (req, res) => {
  try {
    const result = await criteriosService.getSubcriteriosByCriterio(req.params.criterioId);
    res.json(result);
  } catch (error) {
    console.error('Error getting subcriterios by criterio:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Incidencias routes
app.get('/incidencias', async (req, res) => {
  try {
    const result = await incidenciaService.getAllIncidencias();
    res.json(result);
  } catch (error) {
    console.error('Error getting incidencias:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/incidencias', async (req, res) => {
  try {
    const result = await incidenciaService.createIncidencia(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating incidencia:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/incidencias/:id', async (req, res) => {
  try {
    const result = await incidenciaService.updateIncidencia(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating incidencia:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/incidencias/:id', async (req, res) => {
  try {
    const result = await incidenciaService.deleteIncidencia(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting incidencia:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Notificaciones routes
app.get('/notificaciones', async (req, res) => {
  try {
    const result = await notificacionService.getAllNotificaciones();
    res.json(result);
  } catch (error) {
    console.error('Error getting notificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/notificaciones/usuario/:userId', async (req, res) => {
  try {
    const result = await notificacionService.getNotificacionesByUser(req.params.userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting notificaciones by user:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/notificaciones', async (req, res) => {
  try {
    const result = await notificacionService.createNotificacion(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating notificacion:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/notificaciones/:id/marcar-leida', async (req, res) => {
  try {
    const result = await notificacionService.marcarComoLeida(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/notificaciones/:id', async (req, res) => {
  try {
    const result = await notificacionService.deleteNotificacion(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting notificacion:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Reportes routes
app.get('/reportes/evaluaciones', async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, evaluadorId, evaluadoId } = req.query;
    const result = await reportesService.getReporteEvaluaciones({
      fechaInicio,
      fechaFin,
      tipo,
      evaluadorId,
      evaluadoId
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting reporte evaluaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/reportes/estadisticas', async (req, res) => {
  try {
    const result = await reportesService.getEstadisticasGenerales();
    res.json(result);
  } catch (error) {
    console.error('Error getting estadisticas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// Catch all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Ejecutar cancelación automática cada hora
  setInterval(async () => {
    try {
      await evaluacionService.cancelarBorradoresVencidos();
    } catch (error) {
      console.error('Error en cancelación automática:', error);
    }
  }, 60 * 60 * 1000); // 1 hora
});
