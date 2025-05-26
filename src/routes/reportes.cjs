
const express = require('express');
const router = express.Router();
const reportesService = require('../services/reportesService.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Middleware para verificar roles autorizados (admin y evaluator)
const checkReportAccess = (req, res, next) => {
  const userRole = req.user.role;
  if (userRole !== 'admin' && userRole !== 'evaluator') {
    return res.status(403).json({ 
      success: false, 
      message: 'No tienes permisos para acceder a los reportes' 
    });
  }
  next();
};

router.use(checkReportAccess);

// Rutas de reportes
router.get('/evaluaciones-aprobadas', async (req, res) => {
  try {
    const result = await reportesService.getEvaluacionesAprobadas();
    res.json(result);
  } catch (error) {
    console.error('Error en ruta evaluaciones-aprobadas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

router.get('/evaluaciones-desaprobadas', async (req, res) => {
  try {
    const result = await reportesService.getEvaluacionesDesaprobadas();
    res.json(result);
  } catch (error) {
    console.error('Error en ruta evaluaciones-desaprobadas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

router.get('/evaluados-con-incidencias', async (req, res) => {
  try {
    const result = await reportesService.getEvaluadosConIncidencias();
    res.json(result);
  } catch (error) {
    console.error('Error en ruta evaluados-con-incidencias:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

router.get('/personal-de-baja', async (req, res) => {
  try {
    const result = await reportesService.getPersonalDeBaja();
    res.json(result);
  } catch (error) {
    console.error('Error en ruta personal-de-baja:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

router.get('/personal-alta-calificacion', async (req, res) => {
  try {
    const result = await reportesService.getPersonalAltaCalificacion();
    res.json(result);
  } catch (error) {
    console.error('Error en ruta personal-alta-calificacion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

router.get('/evaluaciones-por-semestre', async (req, res) => {
  try {
    const result = await reportesService.getEvaluacionesPorSemestre();
    res.json(result);
  } catch (error) {
    console.error('Error en ruta evaluaciones-por-semestre:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

router.get('/evaluaciones-por-area', async (req, res) => {
  try {
    const result = await reportesService.getEvaluacionesPorArea();
    res.json(result);
  } catch (error) {
    console.error('Error en ruta evaluaciones-por-area:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router;
