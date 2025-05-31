
const express = require('express');
const cors = require('cors');
const session = require('express-session');

// Importar rutas
const authRoutes = require('./routes/authRoutes.cjs');
const userRoutes = require('./routes/userRoutes.cjs');
const roleRoutes = require('./routes/roleRoutes.cjs');
const colaboradorRoutes = require('./routes/colaboradorRoutes.cjs');
const areaRoutes = require('./routes/areaRoutes.cjs');
const tipoColaboradorRoutes = require('./routes/tipoColaboradorRoutes.cjs');
const tipoContratoRoutes = require('./routes/tipoContratoRoutes.cjs');
const evaluacionRoutes = require('./routes/evaluacionRoutes.cjs');
const incidenciaRoutes = require('./routes/incidenciaRoutes.cjs');
const notificacionRoutes = require('./routes/notificacionRoutes.cjs');
const reportesRoutes = require('./routes/reportesRoutes.cjs');
const asignacionRoutes = require('./routes/asignacionRoutes.cjs');

const app = express();
const PORT = process.env.PORT || 3306;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], 
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/tipo-colaborador', tipoColaboradorRoutes);
app.use('/api/tipo-contrato', tipoContratoRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/asignaciones', asignacionRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
