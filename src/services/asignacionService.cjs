
// Main entry point for assignment services
const { 
  createAsignacion,
  getAllAsignaciones,
  updateAsignacion,
  deleteAsignacion,
  cerrarAsignacion,
  getAsignacionesByEvaluador
} = require('./asignacion/asignacionService.cjs');

const { getAreas } = require('./asignacion/areasService.cjs');
const { validarDisponibilidadHorario } = require('./asignacion/asignacionValidationService.cjs');

module.exports = {
  createAsignacion,
  getAllAsignaciones,
  updateAsignacion,
  deleteAsignacion,
  cerrarAsignacion,
  validarDisponibilidadHorario,
  getAreas,
  getAsignacionesByEvaluador
};
