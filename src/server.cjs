const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3306;

// Enable CORS
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Simple route to test the server
app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando!');
});

// Routes
app.use('/api/auth', require('./routes/auth.cjs'));
app.use('/api/roles', require('./routes/roles.cjs'));
app.use('/api/users', require('./routes/users.cjs'));
app.use('/api/colaboradores', require('./routes/colaboradores.cjs'));
app.use('/api/tipo-colaborador', require('./routes/tipoColaborador.cjs'));
app.use('/api/tipo-contrato', require('./routes/tipoContrato.cjs'));
app.use('/api/evaluaciones', require('./routes/evaluaciones.cjs'));
app.use('/api/incidencias', require('./routes/incidencias.cjs'));
app.use('/api/notificaciones', require('./routes/notificaciones.cjs'));
app.use('/api/reportes', require('./routes/reportes.cjs'));

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

// Start the server
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
