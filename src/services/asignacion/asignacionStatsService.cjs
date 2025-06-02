
const { pool } = require('../../utils/dbConnection.cjs');

// Get statistics for a single assignment
const getAsignacionStats = async (asignacionId) => {
  const [statsRows] = await pool.execute(
    `SELECT 
      COUNT(da.idEvaluacion) as totalEvaluaciones,
      SUM(CASE WHEN e.estado = 'Completada' THEN 1 ELSE 0 END) as evaluacionesCompletadas,
      SUM(CASE WHEN e.estado = 'Pendiente' THEN 1 ELSE 0 END) as evaluacionesPendientes,
      SUM(CASE WHEN e.tipo = 'Autoevaluacion' THEN 1 ELSE 0 END) as autoevaluaciones,
      SUM(CASE WHEN e.tipo = 'Evaluador-Evaluado' THEN 1 ELSE 0 END) as evaluacionesEvaluador,
      SUM(CASE WHEN e.tipo = 'Estudiante-Docente' THEN 1 ELSE 0 END) as evaluacionesEstudiante
     FROM DETALLE_ASIGNACION da
     LEFT JOIN EVALUACION e ON da.idEvaluacion = e.idEvaluacion
     WHERE da.idAsignacion = ?`,
    [asignacionId]
  );
  
  const stats = statsRows[0] || {};
  
  const estadisticas = {
    totalEvaluaciones: parseInt(stats.totalEvaluaciones) || 0,
    evaluacionesCompletadas: parseInt(stats.evaluacionesCompletadas) || 0,
    evaluacionesPendientes: parseInt(stats.evaluacionesPendientes) || 0,
    autoevaluaciones: parseInt(stats.autoevaluaciones) || 0,
    evaluacionesEvaluador: parseInt(stats.evaluacionesEvaluador) || 0,
    evaluacionesEstudiante: parseInt(stats.evaluacionesEstudiante) || 0
  };
  
  const progreso = estadisticas.totalEvaluaciones > 0 ? 
    Math.round((estadisticas.evaluacionesCompletadas / estadisticas.totalEvaluaciones) * 100) : 0;
  
  return {
    estadisticas,
    progreso
  };
};

// Add statistics to assignment data
const addStatsToAsignacion = async (asignacionData) => {
  const { estadisticas, progreso } = await getAsignacionStats(asignacionData.id);
  
  return {
    ...asignacionData,
    estadisticas,
    progreso
  };
};

// Add statistics to multiple assignments
const addStatsToAsignaciones = async (asignaciones) => {
  const asignacionesConEstadisticas = [];
  
  for (const asignacion of asignaciones) {
    const asignacionConStats = await addStatsToAsignacion(asignacion);
    asignacionesConEstadisticas.push(asignacionConStats);
  }
  
  return asignacionesConEstadisticas;
};

module.exports = {
  getAsignacionStats,
  addStatsToAsignacion,
  addStatsToAsignaciones
};
