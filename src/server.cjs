const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('./utils/dbConnection.cjs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Secret key for JWT (should be in a secure environment variable)
const JWT_SECRET = 'your-secret-key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};

// Authentication routes
app.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, idColaborador } = req.body;

    // Check if the email is already in use
    const [existingUsers] = await pool.execute('SELECT * FROM USUARIO WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await pool.execute(
      'INSERT INTO USUARIO (nombre, email, password, idColaborador) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, idColaborador]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar usuario.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const [users] = await pool.execute('SELECT * FROM USUARIO WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.idUsuario, nombre: user.nombre, email: user.email, idColaborador: user.idColaborador }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: { id: user.idUsuario, nombre: user.nombre, email: user.email, idColaborador: user.idColaborador } });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
});

// Example protected route
app.get('/profile', verifyToken, (req, res) => {
  res.json({ message: `Bienvenido, ${req.user.nombre}!` });
});

const evaluacionService = require('./services/evaluacionService.cjs');
const colaboradorService = require('./services/colaboradorService.cjs');

// Rutas para evaluaciones
app.get('/evaluaciones', verifyToken, async (req, res) => {
  try {
    const result = await evaluacionService.getAllEvaluaciones();
    res.json(result);
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las evaluaciones' });
  }
});

app.get('/evaluaciones/evaluador/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await evaluacionService.getEvaluacionesByEvaluador(userId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener evaluaciones por evaluador:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las evaluaciones' });
  }
});

app.get('/evaluaciones/colaborador/:colaboradorId', verifyToken, async (req, res) => {
  try {
    const colaboradorId = req.params.colaboradorId;
    const result = await evaluacionService.getEvaluacionesByColaborador(colaboradorId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener evaluaciones por colaborador:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las evaluaciones' });
  }
});

app.post('/evaluaciones', verifyToken, async (req, res) => {
  try {
    const evaluacionData = req.body;
    const result = await evaluacionService.createEvaluacion(evaluacionData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear evaluación:', error);
    res.status(500).json({ success: false, message: 'Error al crear la evaluación' });
  }
});

app.put('/evaluaciones/:id', verifyToken, async (req, res) => {
  try {
    const evaluacionId = req.params.id;
    const evaluacionData = req.body;
    const result = await evaluacionService.updateEvaluacion(evaluacionId, evaluacionData);
    res.json(result);
  } catch (error) {
    console.error('Error al actualizar evaluación:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la evaluación' });
  }
});

app.delete('/evaluaciones/:id', verifyToken, async (req, res) => {
  try {
    const evaluacionId = req.params.id;
    const result = await evaluacionService.deleteEvaluacion(evaluacionId);
    res.json(result);
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la evaluación' });
  }
});

app.post('/evaluaciones/:id/finalizar', verifyToken, async (req, res) => {
  try {
    const evaluacionId = req.params.id;
    const result = await evaluacionService.finalizarEvaluacion(evaluacionId);
    res.json(result);
  } catch (error) {
    console.error('Error al finalizar evaluación:', error);
    res.status(500).json({ success: false, message: 'Error al finalizar la evaluación' });
  }
});

// Rutas para colaboradores
app.get('/colaboradores', verifyToken, async (req, res) => {
  try {
    const result = await evaluacionService.getColaboradoresParaEvaluar();
    res.json(result);
  } catch (error) {
    console.error('Error al obtener colaboradores:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los colaboradores' });
  }
});

app.get('/colaborador-by-user/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await evaluacionService.getColaboradorByUserId(userId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener colaborador por user ID:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la información del colaborador' });
  }
});

app.get('/colaboradores/:id', verifyToken, async (req, res) => {
  try {
    const colaboradorId = req.params.id;
    const result = await colaboradorService.getColaboradorById(colaboradorId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener información del colaborador:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la información del colaborador' });
  }
});

const criteriosService = require('./services/criteriosService.cjs');

// Rutas para criterios y subcriterios
app.get('/criterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllCriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en /criterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/subcriterios', async (req, res) => {
  try {
    const result = await criteriosService.getAllSubcriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en /subcriterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/criterios-con-subcriterios', async (req, res) => {
  try {
    const result = await criteriosService.getCriteriosConSubcriterios();
    res.json(result);
  } catch (error) {
    console.error('Error en /criterios-con-subcriterios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/subcriterios/:criterioId', async (req, res) => {
  try {
    const { criterioId } = req.params;
    const result = await criteriosService.getSubcriteriosByCriterio(criterioId);
    res.json(result);
  } catch (error) {
    console.error('Error en /subcriterios/:criterioId:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
