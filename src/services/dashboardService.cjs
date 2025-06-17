const { pool } = require('../utils/dbConnection.cjs');

const dashboardService = {
  async getStats(userId, userRole, userArea) {
    try {
      const normalizedRole = (userRole || '').toLowerCase();
      console.log(`📊 Obteniendo estadísticas para usuario ${userId} con rol ${userRole} (normalizado: ${normalizedRole}) y área ${userArea}`);
      
      let stats = {};
      
      if (['evaluated', 'evaluado'].includes(normalizedRole)) {
        // Docente evaluado: evaluaciones donde es evaluado
        const [evaluacionesRecibidas] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION WHERE idEvaluado = ?',
          [userId]
        );
        
        const [evaluacionesAprobadas] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION WHERE idEvaluado = ? AND puntajeTotal >= 11 AND (estado = "Activo" OR estado = "Completada")',
          [userId]
        );
        
        const [promedioCalificacion] = await pool.query(
          'SELECT AVG(puntajeTotal) as promedio FROM EVALUACION WHERE idEvaluado = ? AND (estado = "Activo" OR estado = "Completada")',
          [userId]
        );
        
        const [incidenciasPersonales] = await pool.query(
          'SELECT COUNT(*) as total FROM INCIDENCIA WHERE idUsuarioAfectado = ?',
          [userId]
        );
        
        stats = {
          evaluacionesRecibidas: evaluacionesRecibidas[0].total,
          evaluacionesAprobadas: evaluacionesAprobadas[0].total,
          promedioCalificacion: promedioCalificacion[0].promedio || 0,
          incidenciasPersonales: incidenciasPersonales[0].total
        };
      } else if (['admin', 'administrador'].includes(normalizedRole)) {
        // Administrador: todas las evaluaciones
        const [totalEvaluaciones] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION'
        );
        const [evaluacionesPendientes] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION WHERE estado = "Pendiente"'
        );
        const [validacionesPendientes] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION WHERE estado = "Pendiente"'
        );
        const [promedioGeneral] = await pool.query(
          'SELECT AVG(puntajeTotal) as promedio FROM EVALUACION WHERE estado = "Activo"'
        );
        const [incidenciasActivas] = await pool.query(
          'SELECT COUNT(*) as total FROM INCIDENCIA WHERE estado = "Pendiente"'
        );
        const [evaluacionesAprobadas] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION WHERE puntajeTotal >= 11'
        );
        const [evaluacionesDesaprobadas] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION WHERE puntajeTotal < 11'
        );
        console.log('[ADMIN] Query incidencias activas: SELECT COUNT(*) as total FROM incidencias WHERE estado = "Pendiente"');
        console.log('[ADMIN] Resultado incidencias activas:', incidenciasActivas);
        stats = {
          totalEvaluaciones: totalEvaluaciones[0].total,
          evaluacionesPendientes: evaluacionesPendientes[0].total,
          validacionesPendientes: validacionesPendientes[0].total,
          promedioGeneral: promedioGeneral[0].promedio || 0,
          incidenciasActivas: incidenciasActivas[0].total,
          evaluacionesAprobadas: evaluacionesAprobadas[0].total,
          evaluacionesDesaprobadas: evaluacionesDesaprobadas[0].total
        };
      } else if (['evaluator', 'evaluador'].includes(normalizedRole)) {
        // Evaluador: evaluaciones de su área (filtrar por área del evaluado)
        const [totalEvaluaciones] = await pool.query(
          `SELECT COUNT(*) as total FROM EVALUACION e
           JOIN USUARIO u ON e.idEvaluado = u.idUsuario
           WHERE u.idArea = ?`,
          [userArea]
        );
        const [evaluacionesPendientes] = await pool.query(
          `SELECT COUNT(*) as total FROM EVALUACION e
           JOIN USUARIO u ON e.idEvaluado = u.idUsuario
           WHERE e.estado = 'Pendiente' AND u.idArea = ?`,
          [userArea]
        );
        const [validacionesPendientes] = await pool.query(
          `SELECT COUNT(*) as total FROM EVALUACION e
           JOIN USUARIO u ON e.idEvaluado = u.idUsuario
           WHERE e.estado = 'Pendiente' AND u.idArea = ?`,
          [userArea]
        );
        const [promedioGeneral] = await pool.query(
          `SELECT AVG(e.puntajeTotal) as promedio FROM EVALUACION e
           JOIN USUARIO u ON e.idEvaluado = u.idUsuario
           WHERE e.estado = 'Activo' AND u.idArea = ?`,
          [userArea]
        );
        const query = 'SELECT COUNT(*) as total FROM INCIDENCIA i JOIN USUARIO ur ON i.idUsuarioReportador = ur.idUsuario JOIN USUARIO ua ON i.idUsuarioAfectado = ua.idUsuario WHERE i.estado = "Pendiente" AND (ur.idArea = ? OR ua.idArea = ?)';
        const params = [userArea, userArea];
        const [incidenciasActivas] = await pool.query(query, params);
        console.log('[EVALUATOR] Query incidencias activas:', query, params);
        console.log('[EVALUATOR] Resultado incidencias activas:', incidenciasActivas);
        stats = {
          totalEvaluaciones: totalEvaluaciones[0].total,
          evaluacionesPendientes: evaluacionesPendientes[0].total,
          validacionesPendientes: validacionesPendientes[0].total,
          promedioGeneral: promedioGeneral[0].promedio || 0,
          incidenciasActivas: incidenciasActivas[0].total
        };
      } else if (['student', 'estudiante'].includes(normalizedRole)) {
        // Estudiante: evaluaciones donde es evaluador y tipo = 1 (Evaluación Estudiante al Docente)
        const [evaluacionesPendientes] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION WHERE idEvaluador = ? AND idTipoEvaluacion = 1 AND estado = "Pendiente"',
          [userId]
        );
        const query = 'SELECT COUNT(*) as total FROM INCIDENCIA WHERE estado = "Pendiente" AND (idUsuarioReportador = ? OR idUsuarioAfectado = ?)';
        const params = [userId, userId];
        const [incidenciasActivas] = await pool.query(query, params);
        console.log('[STUDENT] Query incidencias activas:', query, params);
        console.log('[STUDENT] Resultado incidencias activas:', incidenciasActivas);
        const [validacionesPendientes] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION WHERE estado = "Pendiente"'
        );
        const [totalResultados] = await pool.query(
          'SELECT COUNT(*) as total FROM EVALUACION WHERE idEvaluador = ? AND idTipoEvaluacion = 1 AND estado = "Activo"',
          [userId]
        );
        stats = {
          evaluacionesPendientes: evaluacionesPendientes[0].total,
          incidenciasActivas: incidenciasActivas[0].total,
          validacionesPendientes: validacionesPendientes[0].total,
          totalResultados: totalResultados[0].total
        };
      }
      
      console.log('✅ Estadísticas obtenidas exitosamente:', stats);
      return { success: true, stats };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return { 
        success: false, 
        message: 'Error al obtener estadísticas',
        error: error.message 
      };
    }
  }
};

module.exports = dashboardService; 