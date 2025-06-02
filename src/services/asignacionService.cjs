const { pool } = require('../utils/dbConnection.cjs');

// Crear una nueva asignación basada en área con las 3 evaluaciones automáticamente
const createAsignacion = async (asignacionData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('=== CREANDO ASIGNACIÓN ===');
    console.log('Datos recibidos:', asignacionData);
    
    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (new Date(asignacionData.fechaFin) < new Date(asignacionData.fechaInicio)) {
      await connection.rollback();
      return {
        success: false,
        message: 'La fecha de finalización no puede ser anterior a la fecha de inicio'
      };
    }
    
    // Validar que el área existe
    const [areaExists] = await connection.execute(
      'SELECT idArea, nombre FROM AREA WHERE idArea = ?',
      [asignacionData.areaId]
    );
    
    console.log('Área encontrada:', areaExists);
    
    if (areaExists.length === 0) {
      await connection.rollback();
      return {
        success: false,
        message: 'El área seleccionada no existe'
      };
    }
    
    // Crear la asignación principal con estado 'Abierta'
    const [asignacionResult] = await connection.execute(
      `INSERT INTO ASIGNACION (idUsuario, periodo, fecha_inicio, fecha_fin, estado, idArea) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        1, // Usuario administrador por defecto
        new Date().getFullYear(),
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        'Abierta',
        asignacionData.areaId
      ]
    );
    
    const asignacionId = asignacionResult.insertId;
    console.log('Asignación creada con ID:', asignacionId);
    
    // Obtener todos los docentes del área
    const [docentes] = await connection.execute(
      `SELECT c.idColaborador, CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as nombre,
       u.idUsuario
       FROM COLABORADOR c
       JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
       JOIN USUARIO u ON c.idColaborador = u.idColaborador
       WHERE u.idArea = ? AND c.estado = 1 AND tc.nombre = 'Docente'`,
      [asignacionData.areaId]
    );
    
    console.log('Docentes encontrados:', docentes.length);
    
    // Obtener todos los estudiantes
    const [estudiantes] = await connection.execute(
      `SELECT c.idColaborador, u.idUsuario
       FROM COLABORADOR c
       JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
       JOIN USUARIO u ON c.idColaborador = u.idColaborador
       WHERE c.estado = 1 AND tc.nombre = 'Estudiante'`
    );
    
    console.log('Estudiantes encontrados:', estudiantes.length);
    
    const evaluacionesCreadas = [];
    
    // 1. Crear autoevaluaciones para cada docente del área
    for (const docente of docentes) {
      if (docente.idUsuario) {
        const [evaluacionResult] = await connection.execute(
          `INSERT INTO EVALUACION 
           (fechaEvaluacion, horaEvaluacion, tipo, estado, idUsuario, idColaborador, comentario) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            asignacionData.fechaInicio,
            asignacionData.horaInicio || '08:00',
            'Autoevaluacion',
            'Pendiente',
            docente.idUsuario,
            docente.idColaborador,
            `Autoevaluación programada para ${docente.nombre}`
          ]
        );
        
        // Crear detalle de asignación
        await connection.execute(
          `INSERT INTO DETALLE_ASIGNACION (idEvaluacion, idAsignacion) 
           VALUES (?, ?)`,
          [evaluacionResult.insertId, asignacionId]
        );
        
        evaluacionesCreadas.push({
          id: evaluacionResult.insertId,
          tipo: 'Autoevaluacion',
          evaluador: docente.nombre,
          evaluado: docente.nombre
        });
      }
    }
    
    // 2. Crear evaluaciones evaluador-evaluado (cada docente evalúa a otros docentes del área)
    for (const evaluador of docentes) {
      if (evaluador.idUsuario) {
        for (const evaluado of docentes) {
          if (evaluador.idColaborador !== evaluado.idColaborador) {
            const [evaluacionResult] = await connection.execute(
              `INSERT INTO EVALUACION 
               (fechaEvaluacion, horaEvaluacion, tipo, estado, idUsuario, idColaborador, comentario) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                asignacionData.fechaInicio,
                asignacionData.horaInicio || '08:00',
                'Evaluador-Evaluado',
                'Pendiente',
                evaluador.idUsuario,
                evaluado.idColaborador,
                `Evaluación de ${evaluador.nombre} a ${evaluado.nombre}`
              ]
            );
            
            await connection.execute(
              `INSERT INTO DETALLE_ASIGNACION (idEvaluacion, idAsignacion) 
               VALUES (?, ?)`,
              [evaluacionResult.insertId, asignacionId]
            );
            
            evaluacionesCreadas.push({
              id: evaluacionResult.insertId,
              tipo: 'Evaluador-Evaluado',
              evaluador: evaluador.nombre,
              evaluado: evaluado.nombre
            });
          }
        }
      }
    }
    
    // 3. Crear evaluaciones estudiante-docente
    for (const estudiante of estudiantes) {
      for (const docente of docentes) {
        const [evaluacionResult] = await connection.execute(
          `INSERT INTO EVALUACION 
           (fechaEvaluacion, horaEvaluacion, tipo, estado, idUsuario, idColaborador, comentario) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            asignacionData.fechaInicio,
            asignacionData.horaInicio || '08:00',
            'Estudiante-Docente',
            'Pendiente',
            estudiante.idUsuario,
            docente.idColaborador,
            `Evaluación de estudiante a ${docente.nombre}`
          ]
        );
        
        await connection.execute(
          `INSERT INTO DETALLE_ASIGNACION (idEvaluacion, idAsignacion) 
           VALUES (?, ?)`,
          [evaluacionResult.insertId, asignacionId]
        );
        
        evaluacionesCreadas.push({
          id: evaluacionResult.insertId,
          tipo: 'Estudiante-Docente',
          evaluador: 'Estudiante',
          evaluado: docente.nombre
        });
      }
    }
    
    await connection.commit();
    
    console.log('=== ASIGNACIÓN CREADA EXITOSAMENTE ===');
    console.log(`Total evaluaciones creadas: ${evaluacionesCreadas.length}`);
    
    return {
      success: true,
      data: {
        asignacion: {
          id: asignacionId,
          evaluaciones: evaluacionesCreadas
        }
      },
      message: `Asignación creada exitosamente con ${evaluacionesCreadas.length} evaluaciones`
    };
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear asignación:', error);
    return { 
      success: false, 
      message: 'Error al crear la asignación de evaluaciones' 
    };
  } finally {
    connection.release();
  }
};

// Obtener asignaciones como historial con información detallada
const getAllAsignaciones = async () => {
  try {
    console.log('=== OBTENIENDO TODAS LAS ASIGNACIONES ===');
    
    const [rows] = await pool.execute(
      `SELECT 
        a.idAsignacion as id,
        a.periodo,
        a.fecha_inicio as fechaInicio,
        a.fecha_fin as fechaFin,
        a.estado,
        ar.nombre as areaNombre,
        ar.idArea as areaId,
        u.nombre as usuarioCreador,
        a.fecha_inicio as fechaCreacion,
        DATEDIFF(a.fecha_fin, a.fecha_inicio) as duracionDias
       FROM ASIGNACION a
       LEFT JOIN AREA ar ON a.idArea = ar.idArea
       LEFT JOIN USUARIO u ON a.idUsuario = u.idUsuario
       WHERE a.estado IN ('Abierta', 'Cerrada')
       ORDER BY a.fecha_inicio DESC, a.idAsignacion DESC`
    );
    
    console.log('=== RESULTADO CONSULTA ASIGNACIONES ===');
    console.log('Total filas encontradas:', rows.length);
    console.log('Primera fila:', rows[0]);
    
    if (rows.length === 0) {
      return {
        success: true,
        data: {
          asignaciones: []
        }
      };
    }
    
    // Para cada asignación, obtener las estadísticas de evaluaciones
    const asignacionesConEstadisticas = [];
    
    for (const row of rows) {
      // Obtener estadísticas de evaluaciones para esta asignación
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
        [row.id]
      );
      
      const stats = statsRows[0] || {};
      
      const asignacion = {
        id: row.id,
        periodo: row.periodo,
        fechaInicio: row.fechaInicio,
        fechaFin: row.fechaFin,
        fechaCreacion: row.fechaCreacion,
        areaId: row.areaId,
        areaNombre: row.areaNombre || 'Sin área',
        usuarioCreador: row.usuarioCreador || 'Sistema',
        estado: row.estado,
        duracionDias: row.duracionDias || 0,
        estadisticas: {
          totalEvaluaciones: parseInt(stats.totalEvaluaciones) || 0,
          evaluacionesCompletadas: parseInt(stats.evaluacionesCompletadas) || 0,
          evaluacionesPendientes: parseInt(stats.evaluacionesPendientes) || 0,
          autoevaluaciones: parseInt(stats.autoevaluaciones) || 0,
          evaluacionesEvaluador: parseInt(stats.evaluacionesEvaluador) || 0,
          evaluacionesEstudiante: parseInt(stats.evaluacionesEstudiante) || 0
        },
        progreso: stats.totalEvaluaciones > 0 ? 
          Math.round((stats.evaluacionesCompletadas / stats.totalEvaluaciones) * 100) : 0
      };
      
      asignacionesConEstadisticas.push(asignacion);
    }
    
    console.log('=== ASIGNACIONES PROCESADAS ===');
    console.log('Total asignaciones procesadas:', asignacionesConEstadisticas.length);
    console.log('Primera asignación procesada:', asignacionesConEstadisticas[0]);
    
    return {
      success: true,
      data: {
        asignaciones: asignacionesConEstadisticas
      }
    };
  } catch (error) {
    console.error('=== ERROR AL OBTENER ASIGNACIONES ===');
    console.error('Error:', error);
    return { 
      success: false, 
      error: 'Error al obtener el historial de asignaciones' 
    };
  }
};

// Actualizar una asignación
const updateAsignacion = async (asignacionId, asignacionData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Validar fechas
    if (new Date(asignacionData.fechaFin) < new Date(asignacionData.fechaInicio)) {
      await connection.rollback();
      return {
        success: false,
        message: 'La fecha de finalización no puede ser anterior a la fecha de inicio'
      };
    }
    
    // Validar horas en el mismo día
    if (asignacionData.fechaInicio === asignacionData.fechaFin) {
      if (asignacionData.horaFin <= asignacionData.horaInicio) {
        await connection.rollback();
        return {
          success: false,
          message: 'La hora de finalización debe ser posterior a la hora de inicio cuando es el mismo día'
        };
      }
    }
    
    // Actualizar la asignación
    await connection.execute(
      `UPDATE ASIGNACION 
       SET fecha_inicio = ?, fecha_fin = ?, idArea = ?
       WHERE idAsignacion = ?`,
      [
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        asignacionData.areaId,
        asignacionId
      ]
    );
    
    // No es necesario actualizar las evaluaciones individuales ya que se crean automáticamente
    
    await connection.commit();
    
    return {
      success: true,
      message: 'Asignación actualizada exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar asignación:', error);
    return { 
      success: false, 
      message: 'Error al actualizar la asignación' 
    };
  } finally {
    connection.release();
  }
};

// Eliminar una asignación
const deleteAsignacion = async (asignacionId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Obtener las evaluaciones relacionadas
    const [evaluaciones] = await connection.execute(
      `SELECT e.idEvaluacion 
       FROM EVALUACION e
       JOIN DETALLE_ASIGNACION da ON e.idEvaluacion = da.idEvaluacion
       WHERE da.idAsignacion = ? AND e.estado = 'Pendiente'`,
      [asignacionId]
    );
    
    // Eliminar solo si todas las evaluaciones están pendientes
    if (evaluaciones.length > 0) {
      // Eliminar detalles de asignación
      await connection.execute(
        'DELETE FROM DETALLE_ASIGNACION WHERE idAsignacion = ?',
        [asignacionId]
      );
      
      // Eliminar evaluaciones pendientes
      for (const eval of evaluaciones) {
        await connection.execute(
          'DELETE FROM EVALUACION WHERE idEvaluacion = ? AND estado = "Pendiente"',
          [eval.idEvaluacion]
        );
      }
    }
    
    // Eliminar la asignación
    await connection.execute(
      'DELETE FROM ASIGNACION WHERE idAsignacion = ?',
      [asignacionId]
    );
    
    await connection.commit();
    
    return {
      success: true,
      message: 'Asignación eliminada exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar asignación:', error);
    return { 
      success: false, 
      message: 'Error al eliminar la asignación' 
    };
  } finally {
    connection.release();
  }
};

// Cerrar una asignación (cambiar estado a 'Cerrada')
const cerrarAsignacion = async (asignacionId) => {
  try {
    const [result] = await pool.execute(
      'UPDATE ASIGNACION SET estado = ? WHERE idAsignacion = ? AND estado = ?',
      ['Cerrada', asignacionId, 'Abierta']
    );
    
    if (result.affectedRows === 0) {
      return {
        success: false,
        message: 'No se pudo cerrar la asignación. Verifique que esté en estado Abierta.'
      };
    }
    
    return {
      success: true,
      message: 'Asignación cerrada exitosamente'
    };
  } catch (error) {
    console.error('Error al cerrar asignación:', error);
    return {
      success: false,
      message: 'Error al cerrar la asignación'
    };
  }
};

// Obtener áreas disponibles para asignación
const getAreas = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idArea as id, a.nombre, a.descripcion,
       COUNT(CASE WHEN tc.nombre = 'Docente' THEN 1 END) as totalDocentes
       FROM AREA a
       LEFT JOIN USUARIO u ON a.idArea = u.idArea 
       LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       LEFT JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
       WHERE c.estado = 1 OR c.estado IS NULL
       GROUP BY a.idArea, a.nombre, a.descripcion
       ORDER BY a.nombre`
    );
    
    console.log('Áreas obtenidas:', rows);
    
    return {
      success: true,
      areas: rows
    };
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    return { 
      success: false, 
      message: 'Error al obtener las áreas' 
    };
  }
};

// Validar disponibilidad simplificada (solo verificar que el área existe)
const validarDisponibilidadHorario = async (fechaInicio, fechaFin, horaInicio, horaFin, areaId, excludeId = null) => {
  try {
    // Verificar que el área existe
    const [area] = await pool.execute(
      'SELECT idArea, nombre FROM AREA WHERE idArea = ?',
      [areaId]
    );
    
    if (area.length === 0) {
      return {
        disponible: false,
        message: 'El área seleccionada no existe'
      };
    }
    
    console.log('Validación - área válida:', area[0].nombre);
    
    return {
      disponible: true,
      message: 'Área disponible para asignación'
    };
    
  } catch (error) {
    console.error('Error al validar disponibilidad:', error);
    return {
      disponible: false,
      message: 'Error al validar la disponibilidad'
    };
  }
};

// Obtener asignaciones por evaluador
const getAsignacionesByEvaluador = async (evaluadorId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion as id, a.periodo, a.fecha_inicio as fechaInicio, 
       a.fecha_fin as fechaFin, a.estado,
       COUNT(da.idEvaluacion) as totalEvaluaciones,
       SUM(CASE WHEN e.estado = 'Completada' THEN 1 ELSE 0 END) as evaluacionesCompletadas
       FROM ASIGNACION a
       LEFT JOIN DETALLE_ASIGNACION da ON a.idAsignacion = da.idAsignacion
       LEFT JOIN EVALUACION e ON da.idEvaluacion = e.idEvaluacion
       WHERE a.idUsuario = ?
       GROUP BY a.idAsignacion
       ORDER BY a.fecha_inicio DESC`,
      [evaluadorId]
    );
    
    return {
      success: true,
      asignaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener asignaciones del evaluador:', error);
    return { 
      success: false, 
      message: 'Error al obtener las asignaciones del evaluador' 
    };
  }
};

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
