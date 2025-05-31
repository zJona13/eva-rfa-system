
const express = require('express');
const router = express.Router();
const asignacionService = require('../services/asignacionService.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// GET /api/asignaciones - Obtener todas las asignaciones
router.get('/', async (req, res) => {
  try {
    const result = await asignacionService.getAllAsignaciones();
    
    if (result.success) {
      res.json({
        success: true,
        asignaciones: result.asignaciones
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error en GET /asignaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/asignaciones - Crear nueva asignación
router.post('/', async (req, res) => {
  try {
    const result = await asignacionService.createAsignacion(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en POST /asignaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/asignaciones/:id - Actualizar asignación
router.put('/:id', async (req, res) => {
  try {
    const evaluacionId = req.params.id;
    const result = await asignacionService.updateAsignacion(evaluacionId, req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en PUT /asignaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/asignaciones/:id - Eliminar asignación
router.delete('/:id', async (req, res) => {
  try {
    const evaluacionId = req.params.id;
    const result = await asignacionService.deleteAsignacion(evaluacionId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en DELETE /asignaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/asignaciones/evaluadores - Obtener lista de evaluadores
router.get('/evaluadores', async (req, res) => {
  try {
    const result = await asignacionService.getEvaluadores();
    
    if (result.success) {
      res.json({
        success: true,
        evaluadores: result.evaluadores
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error en GET /asignaciones/evaluadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/asignaciones/validar-horario - Validar disponibilidad de horario
router.get('/validar-horario', async (req, res) => {
  try {
    const { fechaInicio, fechaFin, horaInicio, horaFin, evaluadorId, excludeId } = req.query;
    
    const result = await asignacionService.validarDisponibilidadHorario(
      fechaInicio,
      fechaFin, 
      horaInicio,
      horaFin,
      evaluadorId,
      excludeId
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error en GET /asignaciones/validar-horario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
