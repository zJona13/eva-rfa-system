const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const authService = require('./services/authService.cjs');
const userService = require('./services/userService.cjs');
const roleService = require('./services/roleService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const tipoContratoService = require('./services/tipoContratoService.cjs');
const evaluacionService = require('./services/evaluacionService.cjs');
const criteriosService = require('./services/criteriosService.cjs');
const incidenciaService = require('./services/incidenciaService.cjs');
const notificacionService = require('./services/notificacionService.cjs');
const reportesService = require('./services/reportesService.cjs');
const passwordResetService = require('./services/passwordResetService.cjs');

const app = express();
const PORT = process.env.PORT || 3306;

// Middleware setup
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = require('./config/dbConfig.cjs');
let pool;

async function initializePool() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Connected to the database!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

initializePool();

// Test route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  const result = await authService.login(correo, contrasena);
  res.json(result);
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization;
  const result = await authService.verifyToken(token);

  if (result.valid) {
    res.json({ success: true, user: result.user });
  } else {
    res.status(401).json({ success: false, message: result.error });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  const result = await authService.register(nombre, correo, contrasena);
  res.json(result);
});

app.post('/api/auth/logout', async (req, res) => {
  const token = req.headers.authorization;
  const result = await authService.invalidateToken(token);
  if (result.success) {
    res.json({ success: true, message: 'Logged out successfully' });
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

// User routes
app.get('/api/users', async (req, res) => {
  const result = await userService.getAllUsers();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.get('/api/users/available-colaboradores', async (req, res) => {
  const excludeUserId = req.query.excludeUserId;
  const result = await userService.getAvailableColaboradores(excludeUserId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.post('/api/users', async (req, res) => {
  const userData = req.body;
  const result = await userService.createUser(userData);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const userData = req.body;
  const result = await userService.updateUser(userId, userData);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const result = await userService.deleteUser(userId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

// Role routes
app.get('/api/roles', async (req, res) => {
  const result = await roleService.getAllRoles();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

// Colaborador routes
app.get('/api/colaboradores', async (req, res) => {
  const result = await colaboradorService.getAllColaboradores();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.post('/api/colaboradores', async (req, res) => {
  const colaboradorData = req.body;
  const result = await colaboradorService.createColaborador(colaboradorData);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.put('/api/colaboradores/:id', async (req, res) => {
  const colaboradorId = req.params.id;
  const colaboradorData = req.body;
  const result = await colaboradorService.updateColaborador(colaboradorId, colaboradorData);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.delete('/api/colaboradores/:id', async (req, res) => {
  const colaboradorId = req.params.id;
  const result = await colaboradorService.deleteColaborador(colaboradorId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

// TipoColaborador routes
app.get('/api/tipo-colaborador', async (req, res) => {
  const result = await tipoColaboradorService.getAllTipoColaborador();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.post('/api/tipo-colaborador', async (req, res) => {
  const tipoColaboradorData = req.body;
  const result = await tipoColaboradorService.createTipoColaborador(tipoColaboradorData);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.put('/api/tipo-colaborador/:id', async (req, res) => {
  const tipoColaboradorId = req.params.id;
  const tipoColaboradorData = req.body;
  const result = await tipoColaboradorService.updateTipoColaborador(tipoColaboradorId, tipoColaboradorData);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.delete('/api/tipo-colaborador/:id', async (req, res) => {
  const tipoColaboradorId = req.params.id;
  const result = await tipoColaboradorService.deleteTipoColaborador(tipoColaboradorId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

// TipoContrato routes
app.get('/api/tipo-contrato', async (req, res) => {
  const result = await tipoContratoService.getAllTipoContrato();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.post('/api/tipo-contrato', async (req, res) => {
  const tipoContratoData = req.body;
  const result = await tipoContratoService.createTipoContrato(tipoContratoData);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.put('/api/tipo-contrato/:id', async (req, res) => {
  const tipoContratoId = req.params.id;
  const tipoContratoData = req.body;
  const result = await tipoContratoService.updateTipoContrato(tipoContratoId, tipoContratoData);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

app.delete('/api/tipo-contrato/:id', async (req, res) => {
  const tipoContratoId = req.params.id;
  const result = await tipoContratoService.deleteTipoContrato(tipoContratoId);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
});

// Evaluacion routes
app.get('/api/evaluaciones', async (req, res) => {
    try {
        const evaluaciones = await evaluacionService.getAllEvaluaciones();
        res.json(evaluaciones);
    } catch (error) {
        console.error("Error al obtener las evaluaciones:", error);
        res.status(500).send("Error al obtener las evaluaciones");
    }
});

app.get('/api/evaluaciones/:id', async (req, res) => {
    try {
        const evaluacionId = req.params.id;
        const evaluacion = await evaluacionService.getEvaluacionById(evaluacionId);
        if (evaluacion) {
            res.json(evaluacion);
        } else {
            res.status(404).send('Evaluación no encontrada');
        }
    } catch (error) {
        console.error("Error al obtener la evaluación:", error);
        res.status(500).send("Error al obtener la evaluación");
    }
});

app.post('/api/evaluaciones', async (req, res) => {
    try {
        const nuevaEvaluacion = req.body;
        const resultado = await evaluacionService.createEvaluacion(nuevaEvaluacion);
        res.status(201).json({ id: resultado.insertId, ...nuevaEvaluacion });
    } catch (error) {
        console.error("Error al crear la evaluación:", error);
        res.status(500).send("Error al crear la evaluación");
    }
});

app.put('/api/evaluaciones/:id', async (req, res) => {
    try {
        const evaluacionId = req.params.id;
        const datosActualizados = req.body;
        await evaluacionService.updateEvaluacion(evaluacionId, datosActualizados);
        res.json({ message: 'Evaluación actualizada correctamente' });
    } catch (error) {
        console.error("Error al actualizar la evaluación:", error);
        res.status(500).send("Error al actualizar la evaluación");
    }
});

app.delete('/api/evaluaciones/:id', async (req, res) => {
    try {
        const evaluacionId = req.params.id;
        await evaluacionService.deleteEvaluacion(evaluacionId);
        res.json({ message: 'Evaluación eliminada correctamente' });
    } catch (error) {
        console.error("Error al eliminar la evaluación:", error);
        res.status(500).send("Error al eliminar la evaluación");
    }
});

// Criterios routes
app.get('/api/criterios', async (req, res) => {
    try {
        const criterios = await criteriosService.getAllCriterios();
        res.json(criterios);
    } catch (error) {
        console.error("Error al obtener los criterios:", error);
        res.status(500).send("Error al obtener los criterios");
    }
});

app.get('/api/criterios/:id', async (req, res) => {
    try {
        const criterioId = req.params.id;
        const criterio = await criteriosService.getCriterioById(criterioId);
        if (criterio) {
            res.json(criterio);
        } else {
            res.status(404).send('Criterio no encontrado');
        }
    } catch (error) {
        console.error("Error al obtener el criterio:", error);
        res.status(500).send("Error al obtener el criterio");
    }
});

app.post('/api/criterios', async (req, res) => {
    try {
        const nuevoCriterio = req.body;
        const resultado = await criteriosService.createCriterio(nuevoCriterio);
        res.status(201).json({ id: resultado.insertId, ...nuevoCriterio });
    } catch (error) {
        console.error("Error al crear el criterio:", error);
        res.status(500).send("Error al crear el criterio");
    }
});

app.put('/api/criterios/:id', async (req, res) => {
    try {
        const criterioId = req.params.id;
        const datosActualizados = req.body;
        await criteriosService.updateCriterio(criterioId, datosActualizados);
        res.json({ message: 'Criterio actualizado correctamente' });
    } catch (error) {
        console.error("Error al actualizar el criterio:", error);
        res.status(500).send("Error al actualizar el criterio");
    }
});

app.delete('/api/criterios/:id', async (req, res) => {
    try {
        const criterioId = req.params.id;
        await criteriosService.deleteCriterio(criterioId);
        res.json({ message: 'Criterio eliminado correctamente' });
    } catch (error) {
        console.error("Error al eliminar el criterio:", error);
        res.status(500).send("Error al eliminar el criterio");
    }
});

// Incidencia routes
app.get('/api/incidencias', async (req, res) => {
  try {
    const incidencias = await incidenciaService.getAllIncidencias();
    res.json(incidencias);
  } catch (error) {
    console.error("Error al obtener las incidencias:", error);
    res.status(500).send("Error al obtener las incidencias");
  }
});

app.get('/api/incidencias/:id', async (req, res) => {
  try {
    const incidenciaId = req.params.id;
    const incidencia = await incidenciaService.getIncidenciaById(incidenciaId);
    if (incidencia) {
      res.json(incidencia);
    } else {
      res.status(404).send('Incidencia no encontrada');
    }
  } catch (error) {
    console.error("Error al obtener la incidencia:", error);
    res.status(500).send("Error al obtener la incidencia");
  }
});

app.post('/api/incidencias', async (req, res) => {
  try {
    const nuevaIncidencia = req.body;
    const resultado = await incidenciaService.createIncidencia(nuevaIncidencia);
    res.status(201).json({ id: resultado.insertId, ...nuevaIncidencia });
  } catch (error) {
    console.error("Error al crear la incidencia:", error);
    res.status(500).send("Error al crear la incidencia");
  }
});

app.put('/api/incidencias/:id', async (req, res) => {
  try {
    const incidenciaId = req.params.id;
    const datosActualizados = req.body;
    await incidenciaService.updateIncidencia(incidenciaId, datosActualizados);
    res.json({ message: 'Incidencia actualizada correctamente' });
  } catch (error) {
    console.error("Error al actualizar la incidencia:", error);
    res.status(500).send("Error al actualizar la incidencia");
  }
});

app.delete('/api/incidencias/:id', async (req, res) => {
  try {
    const incidenciaId = req.params.id;
    await incidenciaService.deleteIncidencia(incidenciaId);
    res.json({ message: 'Incidencia eliminada correctamente' });
  } catch (error) {
    console.error("Error al eliminar la incidencia:", error);
    res.status(500).send("Error al eliminar la incidencia");
  }
});

// Notificacion routes
app.get('/api/notificaciones', async (req, res) => {
  try {
    const notificaciones = await notificacionService.getAllNotificaciones();
    res.json(notificaciones);
  } catch (error) {
    console.error("Error al obtener las notificaciones:", error);
    res.status(500).send("Error al obtener las notificaciones");
  }
});

app.get('/api/notificaciones/:id', async (req, res) => {
  try {
    const notificacionId = req.params.id;
    const notificacion = await notificacionService.getNotificacionById(notificacionId);
    if (notificacion) {
      res.json(notificacion);
    } else {
      res.status(404).send('Notificación no encontrada');
    }
  } catch (error) {
    console.error("Error al obtener la notificación:", error);
    res.status(500).send("Error al obtener la notificación");
  }
});

app.post('/api/notificaciones', async (req, res) => {
  try {
    const nuevaNotificacion = req.body;
    const resultado = await notificacionService.createNotificacion(nuevaNotificacion);
    res.status(201).json({ id: resultado.insertId, ...nuevaNotificacion });
  } catch (error) {
    console.error("Error al crear la notificación:", error);
    res.status(500).send("Error al crear la notificación");
  }
});

app.put('/api/notificaciones/:id', async (req, res) => {
  try {
    const notificacionId = req.params.id;
    const datosActualizados = req.body;
    await notificacionService.updateNotificacion(notificacionId, datosActualizados);
    res.json({ message: 'Notificación actualizada correctamente' });
  } catch (error) {
    console.error("Error al actualizar la notificación:", error);
    res.status(500).send("Error al actualizar la notificación");
  }
});

app.delete('/api/notificaciones/:id', async (req, res) => {
  try {
    const notificacionId = req.params.id;
    await notificacionService.deleteNotificacion(notificacionId);
    res.json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error("Error al eliminar la notificación:", error);
    res.status(500).send("Error al eliminar la notificación");
  }
});

// Reportes routes
app.get('/api/reportes', async (req, res) => {
  try {
    const reportes = await reportesService.getAllReportes();
    res.json(reportes);
  } catch (error) {
    console.error("Error al obtener los reportes:", error);
    res.status(500).send("Error al obtener los reportes");
  }
});

app.get('/api/reportes/:id', async (req, res) => {
  try {
    const reporteId = req.params.id;
    const reporte = await reportesService.getReporteById(reporteId);
    if (reporte) {
      res.json(reporte);
    } else {
      res.status(404).send('Reporte no encontrado');
    }
  } catch (error) {
    console.error("Error al obtener el reporte:", error);
    res.status(500).send("Error al obtener el reporte");
  }
});

app.post('/api/reportes', async (req, res) => {
  try {
    const nuevoReporte = req.body;
    const resultado = await reportesService.createReporte(nuevoReporte);
    res.status(201).json({ id: resultado.insertId, ...nuevoReporte });
  } catch (error) {
    console.error("Error al crear el reporte:", error);
    res.status(500).send("Error al crear el reporte");
  }
});

app.put('/api/reportes/:id', async (req, res) => {
  try {
    const reporteId = req.params.id;
    const datosActualizados = req.body;
    await reportesService.updateReporte(reporteId, datosActualizados);
    res.json({ message: 'Reporte actualizado correctamente' });
  } catch (error) {
    console.error("Error al actualizar el reporte:", error);
    res.status(500).send("Error al actualizar el reporte");
  }
});

app.delete('/api/reportes/:id', async (req, res) => {
  try {
    const reporteId = req.params.id;
    await reportesService.deleteReporte(reporteId);
    res.json({ message: 'Reporte eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar el reporte:", error);
    res.status(500).send("Error al eliminar el reporte");
  }
});

// Rutas de recuperación de contraseña
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email es requerido' });
    }
    
    const emailCheck = await passwordResetService.checkEmailExists(email);
    
    if (!emailCheck.success) {
      return res.status(404).json({ success: false, message: 'Correo electrónico no encontrado' });
    }
    
    res.json({ success: true, message: 'Email verificado correctamente' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword, verificationCode } = req.body;
    
    if (!email || !newPassword || !verificationCode) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }
    
    const result = await passwordResetService.resetPassword(email, newPassword, verificationCode);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
