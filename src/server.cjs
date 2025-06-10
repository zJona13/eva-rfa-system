const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de ejemplo (puedes eliminarlas o modificarlas)
app.get('/api/hello', (req, res) => {
  res.json({ message: '¡Hola desde el servidor!' });
});

app.post('/api/data', (req, res) => {
  const receivedData = req.body;
  console.log('Datos recibidos:', receivedData);
  res.json({ message: 'Datos recibidos correctamente', data: receivedData });
});

// Importar servicios
const authService = require('./services/authService.cjs');
const userService = require('./services/userService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');
const tipoColaboradorService = require('./services/tipoColaboradorService.cjs');
const evaluacionService = require('./services/evaluacionService.cjs');

// ===== RUTAS PARA AUTENTICACIÓN =====
app.post('/register', async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /register:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ===== RUTAS PARA USUARIOS =====
app.get('/users', async (req, res) => {
  try {
    const result = await userService.getAllUsers();
    res.json(result);
  } catch (error) {
    console.error('Error en /users:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.getUserById(id);
    res.json(result);
  } catch (error) {
    console.error('Error en /users/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const result = await userService.createUser(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /users:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.updateUser(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /users/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    res.json(result);
  } catch (error) {
    console.error('Error en /users/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ===== RUTAS PARA COLABORADORES =====
app.get('/colaboradores', async (req, res) => {
  try {
    const result = await colaboradorService.getAllColaboradores();
    res.json(result);
  } catch (error) {
    console.error('Error en /colaboradores:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/colaboradores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await colaboradorService.getColaboradorById(id);
    res.json(result);
  } catch (error) {
    console.error('Error en /colaboradores/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/colaboradores', async (req, res) => {
  try {
    const result = await colaboradorService.createColaborador(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /colaboradores:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/colaboradores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await colaboradorService.updateColaborador(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /colaboradores/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/colaboradores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await colaboradorService.deleteColaborador(id);
    res.json(result);
  } catch (error) {
    console.error('Error en /colaboradores/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ===== RUTAS PARA TIPO_COLABORADOR =====
app.get('/tipo-colaborador', async (req, res) => {
  try {
    const result = await tipoColaboradorService.getAllTipoColaborador();
    res.json(result);
  } catch (error) {
    console.error('Error en /tipo-colaborador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/tipo-colaborador/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tipoColaboradorService.getTipoColaboradorById(id);
    res.json(result);
  } catch (error) {
    console.error('Error en /tipo-colaborador/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/tipo-colaborador', async (req, res) => {
  try {
    const result = await tipoColaboradorService.createTipoColaborador(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /tipo-colaborador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/tipo-colaborador/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tipoColaboradorService.updateTipoColaborador(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /tipo-colaborador/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/tipo-colaborador/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tipoColaboradorService.deleteTipoColaborador(id);
    res.json(result);
  } catch (error) {
    console.error('Error en /tipo-colaborador/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ===== RUTAS PARA EVALUACIONES =====
app.get('/evaluaciones', async (req, res) => {
  try {
    const result = await evaluacionService.getAllEvaluaciones();
    res.json(result);
  } catch (error) {
    console.error('Error en /evaluaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/evaluaciones-evaluador/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await evaluacionService.getEvaluacionesByEvaluador(userId);
    res.json(result);
  } catch (error) {
    console.error('Error en /evaluaciones-evaluador/:userId', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/evaluaciones-colaborador/:colaboradorId', async (req, res) => {
  try {
    const { colaboradorId } = req.params;
    const result = await evaluacionService.getEvaluacionesByColaborador(colaboradorId);
    res.json(result);
  } catch (error) {
    console.error('Error en /evaluaciones-colaborador/:colaboradorId', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/evaluaciones', async (req, res) => {
  try {
    const result = await evaluacionService.createEvaluacion(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /evaluaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/evaluaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await evaluacionService.updateEvaluacion(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en /evaluaciones/:id', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/evaluaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await evaluacionService.deleteEvaluacion(id);
    res.json(result);
  } catch (error) {
    console.error('Error en /evaluaciones/:id', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/colaboradores-para-evaluar', async (req, res) => {
  try {
    const result = await evaluacionService.getColaboradoresParaEvaluar();
    res.json(result);
  } catch (error) {
    console.error('Error en /colaboradores-para-evaluar', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/colaborador-by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await evaluacionService.getColaboradorByUserId(userId);
    res.json(result);
  } catch (error) {
    console.error('Error en /colaborador-by-user/:userId', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Importar servicios adicionales
const criteriosService = require('./services/criteriosService.cjs');

// ===== RUTAS PARA CRITERIOS Y SUBCRITERIOS =====

// Obtener todos los criterios
app.get('/criterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllCriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en /criterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener subcriterios por criterio
app.get('/criterios/:idCriterio/subcriterios', async (req, res) => {
  try {
    const { idCriterio } = req.params;
    const result = await criteriosService.getSubcriteriosByCriterio(idCriterio);
    res.json(result);
  } catch (error) {
    console.error('Error en /criterios/:idCriterio/subcriterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener todos los subcriterios
app.get('/subcriterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllSubcriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en /subcriterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
