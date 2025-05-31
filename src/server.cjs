const express = require('express');
const cors = require('cors');
const asignacionService = require('./services/asignacionService.cjs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas para asignaciones
app.get('/asignaciones', async (req, res) => {
  try {
    const result = await asignacionService.getAllAsignaciones();
    res.json(result);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/asignaciones', async (req, res) => {
  try {
    const result = await asignacionService.createAsignacion(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/asignaciones/:id', async (req, res) => {
  try {
    const result = await asignacionService.updateAsignacion(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/asignaciones/:id', async (req, res) => {
  try {
    const result = await asignacionService.deleteAsignacion(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/asignaciones/validar-horario', async (req, res) => {
  try {
    console.log('Recibida solicitud de validación de horario:', req.query);
    
    const { fechaInicio, fechaFin, horaInicio, horaFin, evaluadorId, excludeId } = req.query;
    
    // Validar parámetros requeridos
    if (!fechaInicio || !fechaFin || !horaInicio || !horaFin || !evaluadorId) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos para la validación'
      });
    }
    
    const result = await asignacionService.validarDisponibilidadHorario(
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      parseInt(evaluadorId),
      excludeId ? parseInt(excludeId) : null
    );
    
    console.log('Resultado de validación:', result);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al validar horario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al validar horario' 
    });
  }
});

app.get('/asignaciones/evaluadores', async (req, res) => {
  try {
    const result = await asignacionService.getEvaluadores();
    res.json(result);
  } catch (error) {
    console.error('Error al obtener evaluadores:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/asignaciones/evaluador/:id', async (req, res) => {
  try {
    const result = await asignacionService.getAsignacionesByEvaluador(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener asignaciones del evaluador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
