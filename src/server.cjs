const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session');

// Import services
const authService = require('./services/authService.cjs');
const userService = require('./services/userService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');
const evaluacionService = require('./services/evaluacionService.cjs');
const criteriosService = require('./services/criteriosService.cjs');
const estudianteService = require('./services/estudianteService.cjs');
const incidenciaService = require('./services/incidenciaService.cjs');
const notificacionService = require('./services/notificacionService.cjs');
const reportesService = require('./services/reportesService.cjs');
const roleService = require('./services/roleService.cjs');
const areaService = require('./services/areaService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const tipoContratoService = require('./services/tipoContratoService.cjs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(session({
  secret: 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.static(path.join(__dirname, '../dist')));

// Auth routes
app.post('/auth/login', async (req, res) => {
  try {
    const result = await authService.login(req.body.correo, req.body.contrasena);
    if (result.success) {
      req.session.user = result.user;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/auth/me', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'No autenticado' });
  }
});

// User routes
app.get('/users', async (req, res) => {
  try {
    const result = await userService.getAllUsers();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/users/:id', async (req, res) => {
    try {
        const result = await userService.getUserById(req.params.id);
        res.json({ success: result.success, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/users', async (req, res) => {
  try {
    const result = await userService.createUser(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Colaborador routes
app.get('/colaboradores', async (req, res) => {
  try {
    const result = await colaboradorService.getAllColaboradores();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/colaboradores/:id', async (req, res) => {
  try {
    const result = await colaboradorService.getColaboradorById(req.params.id);
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/colaboradores', async (req, res) => {
  try {
    const result = await colaboradorService.createColaborador(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/colaboradores/:id', async (req, res) => {
  try {
    const result = await colaboradorService.updateColaborador(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/colaboradores/:id', async (req, res) => {
  try {
    const result = await colaboradorService.deleteColaborador(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/colaborador-by-user/:userId', async (req, res) => {
  try {
    const result = await evaluacionService.getColaboradorByUserId(req.params.userId);
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/colaboradores/evaluar', async (req, res) => {
  try {
    const result = await evaluacionService.getColaboradoresParaEvaluar();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Evaluacion routes
app.get('/evaluaciones', async (req, res) => {
  try {
    const result = await evaluacionService.getAllEvaluaciones();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/evaluaciones/evaluador/:userId', async (req, res) => {
  try {
    const result = await evaluacionService.getEvaluacionesByEvaluador(req.params.userId);
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/evaluaciones/colaborador/:colaboradorId', async (req, res) => {
  try {
    const result = await evaluacionService.getEvaluacionesByColaborador(req.params.colaboradorId);
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/evaluaciones', async (req, res) => {
  try {
    const result = await evaluacionService.createEvaluacion(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/evaluaciones/:id', async (req, res) => {
  try {
    const result = await evaluacionService.updateEvaluacion(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/evaluaciones/:id', async (req, res) => {
  try {
    const result = await evaluacionService.deleteEvaluacion(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/evaluaciones/finalizar/:id', async (req, res) => {
  try {
    const result = await evaluacionService.finalizarEvaluacion(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Criterios routes
app.get('/criterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllCriterios();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/criterios/tipo/:idTipoEvaluacion', async (req, res) => {
  try {
    const result = await criteriosService.getCriteriosByTipoEvaluacion(req.params.idTipoEvaluacion);
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/criterios/autoevaluacion', async (req, res) => {
  try {
    const result = await criteriosService.getCriteriosParaAutoevaluacion();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/subcriterios/:idCriterio', async (req, res) => {
  try {
    const result = await criteriosService.getSubcriteriosByCriterio(req.params.idCriterio);
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/subcriterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllSubcriterios();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Estudiante routes
app.get('/estudiantes', async (req, res) => {
  try {
    const result = await estudianteService.getAllEstudiantes();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/estudiantes/:id', async (req, res) => {
    try {
        const result = await estudianteService.getEstudianteById(req.params.id);
        res.json({ success: result.success, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/estudiantes', async (req, res) => {
  try {
    const result = await estudianteService.createEstudiante(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/estudiantes/:id', async (req, res) => {
  try {
    const result = await estudianteService.updateEstudiante(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/estudiantes/:id', async (req, res) => {
  try {
    const result = await estudianteService.deleteEstudiante(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Incidencia routes
app.get('/incidencias', async (req, res) => {
  try {
    const result = await incidenciaService.getAllIncidencias();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/incidencias/:id', async (req, res) => {
    try {
        const result = await incidenciaService.getIncidenciaById(req.params.id);
        res.json({ success: result.success, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/incidencias', async (req, res) => {
  try {
    const result = await incidenciaService.createIncidencia(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/incidencias/:id', async (req, res) => {
  try {
    const result = await incidenciaService.updateIncidencia(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/incidencias/:id', async (req, res) => {
  try {
    const result = await incidenciaService.deleteIncidencia(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Notificacion routes
app.get('/notificaciones', async (req, res) => {
  try {
    const result = await notificacionService.getAllNotificaciones();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/notificaciones/:id', async (req, res) => {
    try {
        const result = await notificacionService.getNotificacionById(req.params.id);
        res.json({ success: result.success, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/notificaciones', async (req, res) => {
  try {
    const result = await notificacionService.createNotificacion(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/notificaciones/:id', async (req, res) => {
  try {
    const result = await notificacionService.updateNotificacion(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/notificaciones/:id', async (req, res) => {
  try {
    const result = await notificacionService.deleteNotificacion(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Reportes routes
app.get('/reportes', async (req, res) => {
  try {
    const result = await reportesService.getAllReportes();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/reportes/:id', async (req, res) => {
    try {
        const result = await reportesService.getReporteById(req.params.id);
        res.json({ success: result.success, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/reportes', async (req, res) => {
  try {
    const result = await reportesService.createReporte(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/reportes/:id', async (req, res) => {
  try {
    const result = await reportesService.updateReporte(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/reportes/:id', async (req, res) => {
  try {
    const result = await reportesService.deleteReporte(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Role routes
app.get('/roles', async (req, res) => {
  try {
    const result = await roleService.getAllRoles();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/roles/:id', async (req, res) => {
    try {
        const result = await roleService.getRoleById(req.params.id);
        res.json({ success: result.success, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/roles', async (req, res) => {
  try {
    const result = await roleService.createRole(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/roles/:id', async (req, res) => {
  try {
    const result = await roleService.updateRole(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/roles/:id', async (req, res) => {
  try {
    const result = await roleService.deleteRole(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Tipo Colaborador routes
app.get('/tipo-colaborador', async (req, res) => {
  try {
    const result = await tipoColaboradorService.getAllTipoColaborador();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/tipo-colaborador/:id', async (req, res) => {
    try {
        const result = await tipoColaboradorService.getTipoColaboradorById(req.params.id);
        res.json({ success: result.success, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/tipo-colaborador', async (req, res) => {
  try {
    const result = await tipoColaboradorService.createTipoColaborador(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/tipo-colaborador/:id', async (req, res) => {
  try {
    const result = await tipoColaboradorService.updateTipoColaborador(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/tipo-colaborador/:id', async (req, res) => {
  try {
    const result = await tipoColaboradorService.deleteTipoColaborador(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Tipo Contrato routes
app.get('/tipo-contrato', async (req, res) => {
  try {
    const result = await tipoContratoService.getAllTipoContrato();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/tipo-contrato/:id', async (req, res) => {
    try {
        const result = await tipoContratoService.getTipoContratoById(req.params.id);
        res.json({ success: result.success, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/tipo-contrato', async (req, res) => {
  try {
    const result = await tipoContratoService.createTipoContrato(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/tipo-contrato/:id', async (req, res) => {
  try {
    const result = await tipoContratoService.updateTipoContrato(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/tipo-contrato/:id', async (req, res) => {
  try {
    const result = await tipoContratoService.deleteTipoContrato(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Area routes
app.get('/areas', async (req, res) => {
  try {
    const result = await areaService.getAllAreas();
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/areas/:id', async (req, res) => {
    try {
        const result = await areaService.getAreaById(req.params.id);
        res.json({ success: result.success, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.post('/areas', async (req, res) => {
  try {
    const result = await areaService.createArea(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.put('/areas/:id', async (req, res) => {
  try {
    const result = await areaService.updateArea(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.delete('/areas/:id', async (req, res) => {
  try {
    const result = await areaService.deleteArea(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Programar tarea para cancelar borradores vencidos cada hora
setInterval(async () => {
  try {
    await evaluacionService.cancelarBorradoresVencidos();
  } catch (error) {
    console.error('Error en tarea programada:', error);
  }
}, 60 * 60 * 1000); // Cada hora

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
