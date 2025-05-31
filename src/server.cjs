const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const authService = require('./services/authService.cjs');
const userService = require('./services/userService.cjs');
const roleService = require('./services/roleService.cjs');
const areaService = require('./services/areaService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const tipoContratoService = require('./services/tipoContratoService.cjs');
const evaluacionService = require('./services/evaluacionService.cjs');
const criteriosService = require('./services/criteriosService.cjs');
const reportesService = require('./services/reportesService.cjs');
const incidenciaService = require('./services/incidenciaService.cjs');
const notificacionService = require('./services/notificacionService.cjs');
const asignacionService = require('./services/asignacionService.cjs');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Simple route to check if the server is running
app.get('/api', (req, res) => {
  res.send('The API is running!');
});

// Authentication routes
app.post('/api/register', async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/register:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/login:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/validate-token', async (req, res) => {
    try {
        const result = await authService.validateToken(req.body.token);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/validate-token:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// User routes
app.get('/api/users', async (req, res) => {
    try {
        const result = await userService.getAllUsers();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/users:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.get('/api/users/available-colaboradores', async (req, res) => {
    try {
        const { excludeUserId } = req.query;
        const result = await userService.getAvailableColaboradores(excludeUserId);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/users/available-colaboradores:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/users:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const result = await userService.updateUser(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/users/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const result = await userService.deleteUser(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/users/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Role routes
app.get('/api/roles', async (req, res) => {
    try {
        const result = await roleService.getAllRoles();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/roles:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.get('/api/roles/:id/users', async (req, res) => {
    try {
        const result = await roleService.getUsersByRole(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/roles/:id/users', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/roles', async (req, res) => {
    try {
        const result = await roleService.createRole(req.body.name);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/roles:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/roles/:id', async (req, res) => {
    try {
        const result = await roleService.updateRole(req.params.id, req.body.name);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/roles/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/roles/:id', async (req, res) => {
    try {
        const result = await roleService.deleteRole(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/roles/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Area routes
app.get('/api/areas', async (req, res) => {
    try {
        const result = await areaService.getAllAreas();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/areas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/areas', async (req, res) => {
    try {
        const result = await areaService.createArea(req.body.name);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/areas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/areas/:id', async (req, res) => {
    try {
        const result = await areaService.updateArea(req.params.id, req.body.name);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/areas/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/areas/:id', async (req, res) => {
    try {
        const result = await areaService.deleteArea(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/areas/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Colaborador routes
app.get('/api/colaboradores', async (req, res) => {
    try {
        const result = await colaboradorService.getAllColaboradores();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/colaboradores:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/colaboradores', async (req, res) => {
    try {
        const result = await colaboradorService.createColaborador(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/colaboradores:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/colaboradores/:id', async (req, res) => {
    try {
        const result = await colaboradorService.updateColaborador(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/colaboradores/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/colaboradores/:id', async (req, res) => {
    try {
        const result = await colaboradorService.deleteColaborador(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/colaboradores/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// TipoColaborador routes
app.get('/api/tipo-colaborador', async (req, res) => {
    try {
        const result = await tipoColaboradorService.getAllTipoColaborador();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/tipo-colaborador:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/tipo-colaborador', async (req, res) => {
    try {
        const result = await tipoColaboradorService.createTipoColaborador(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/tipo-colaborador:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/tipo-colaborador/:id', async (req, res) => {
    try {
        const result = await tipoColaboradorService.updateTipoColaborador(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/tipo-colaborador/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/tipo-colaborador/:id', async (req, res) => {
    try {
        const result = await tipoColaboradorService.deleteTipoColaborador(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/tipo-colaborador/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// TipoContrato routes
app.get('/api/tipo-contrato', async (req, res) => {
    try {
        const result = await tipoContratoService.getAllTipoContrato();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/tipo-contrato:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/tipo-contrato', async (req, res) => {
    try {
        const result = await tipoContratoService.createTipoContrato(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/tipo-contrato:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/tipo-contrato/:id', async (req, res) => {
    try {
        const result = await tipoContratoService.updateTipoContrato(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/tipo-contrato/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/tipo-contrato/:id', async (req, res) => {
    try {
        const result = await tipoContratoService.deleteTipoContrato(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/tipo-contrato/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Evaluacion routes
app.get('/api/evaluaciones', async (req, res) => {
    try {
        const result = await evaluacionService.getAllEvaluaciones();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/evaluaciones:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/evaluaciones', async (req, res) => {
    try {
        const result = await evaluacionService.createEvaluacion(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/evaluaciones:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/evaluaciones/:id', async (req, res) => {
    try {
        const result = await evaluacionService.updateEvaluacion(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/evaluaciones/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/evaluaciones/:id', async (req, res) => {
    try {
        const result = await evaluacionService.deleteEvaluacion(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/evaluaciones/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Criterios routes
app.get('/api/criterios', async (req, res) => {
    try {
        const result = await criteriosService.getAllCriterios();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/criterios:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/criterios', async (req, res) => {
    try {
        const result = await criteriosService.createCriterio(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/criterios:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/criterios/:id', async (req, res) => {
    try {
        const result = await criteriosService.updateCriterio(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/criterios/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/criterios/:id', async (req, res) => {
    try {
        const result = await criteriosService.deleteCriterio(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/criterios/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Reportes routes
app.get('/api/reportes', async (req, res) => {
    try {
        const result = await reportesService.getAllReportes();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/reportes:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/reportes', async (req, res) => {
    try {
        const result = await reportesService.createReporte(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/reportes:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/reportes/:id', async (req, res) => {
    try {
        const result = await reportesService.updateReporte(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/reportes/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/reportes/:id', async (req, res) => {
    try {
        const result = await reportesService.deleteReporte(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/reportes/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Incidencia routes
app.get('/api/incidencias', async (req, res) => {
    try {
        const result = await incidenciaService.getAllIncidencias();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/incidencias:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/incidencias', async (req, res) => {
    try {
        const result = await incidenciaService.createIncidencia(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/incidencias:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/incidencias/:id', async (req, res) => {
    try {
        const result = await incidenciaService.updateIncidencia(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/incidencias/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/incidencias/:id', async (req, res) => {
    try {
        const result = await incidenciaService.deleteIncidencia(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/incidencias/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Notificacion routes
app.get('/api/notificaciones', async (req, res) => {
    try {
        const result = await notificacionService.getAllNotificaciones();
        res.json(result);
    } catch (error) {
        console.error('Error en /api/notificaciones:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/notificaciones', async (req, res) => {
    try {
        const result = await notificacionService.createNotificacion(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/notificaciones:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/api/notificaciones/:id', async (req, res) => {
    try {
        const result = await notificacionService.updateNotificacion(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/notificaciones/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.delete('/api/notificaciones/:id', async (req, res) => {
    try {
        const result = await notificacionService.deleteNotificacion(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error en /api/notificaciones/:id', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Rutas para asignaciones de evaluación
app.get('/api/asignaciones', async (req, res) => {
  try {
    const result = await asignacionService.getAllAsignaciones();
    res.json(result);
  } catch (error) {
    console.error('Error en /api/asignaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/api/asignaciones/evaluadores', async (req, res) => {
  try {
    const result = await asignacionService.getEvaluadores();
    res.json(result);
  } catch (error) {
    console.error('Error en /api/asignaciones/evaluadores:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/api/asignaciones/validar-horario', async (req, res) => {
  try {
    const { fechaInicio, fechaFin, horaInicio, horaFin, evaluadorId, excludeId } = req.query;
    
    const result = await asignacionService.validarDisponibilidadHorario(
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      evaluadorId,
      excludeId || null
    );
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error en /api/asignaciones/validar-horario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/api/asignaciones', async (req, res) => {
  try {
    const result = await asignacionService.createAsignacion(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en POST /api/asignaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/api/asignaciones/:id', async (req, res) => {
  try {
    const result = await asignacionService.updateAsignacion(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en PUT /api/asignaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/api/asignaciones/:id', async (req, res) => {
  try {
    const result = await asignacionService.deleteAsignacion(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error en DELETE /api/asignaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
