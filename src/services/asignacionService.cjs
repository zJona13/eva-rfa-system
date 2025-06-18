const { pool } = require('../utils/dbConnection.cjs');
const evaluacionService = require('./evaluacionService.cjs');
const incidenciaService = require('./incidenciaService.cjs');

// Crear una nueva asignación y evaluaciones automáticas
const createAsignacion = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Verificar si ya existe una asignación igual
    const [exist] = await conn.execute(
      'SELECT idAsignacion FROM ASIGNACION WHERE idArea = ? AND periodo = ? AND fechaInicio = ? AND fechaFin = ? AND horaInicio = ? AND horaFin = ?',
      [data.idArea, data.periodo, data.fechaInicio, data.fechaFin, data.horaInicio, data.horaFin]
    );
    if (exist.length > 0) {
      await conn.rollback();
      return { success: false, message: 'Ya existe una asignación para ese periodo y área.' };
    }
    // Crear la asignación
    const [result] = await conn.execute(
      'INSERT INTO ASIGNACION (idUsuario, periodo, fechaInicio, fechaFin, horaInicio, horaFin, estado, idArea) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.idUsuario, data.periodo, data.fechaInicio, data.fechaFin, data.horaInicio, data.horaFin, data.estado || 'Activo', data.idArea]
    );
    const idAsignacion = result.insertId;

    // Obtener usuarios del área
    const [usuarios] = await conn.execute(
      'SELECT idUsuario, idTipoUsuario FROM USUARIO WHERE idArea = ? AND estado = "Activo"',
      [data.idArea]
    );
    // Separar por rol
    const docentes = Array.isArray(usuarios) ? usuarios.filter(u => u.idTipoUsuario === 3) : [];
    const evaluadores = Array.isArray(usuarios) ? usuarios.filter(u => u.idTipoUsuario === 2) : [];
    const estudiantes = Array.isArray(usuarios) ? usuarios.filter(u => u.idTipoUsuario === 4) : [];

    // Crear evaluaciones automáticas
    // 1. Autoevaluación (tipo 3)
    for (const docente of docentes) {
      await conn.execute(
        'INSERT INTO EVALUACION (fechaEvaluacion, horaEvaluacion, puntajeTotal, comentario, estado, idAsignacion, idEvaluador, idEvaluado, idTipoEvaluacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.fechaInicio, data.horaInicio, null, null, 'Pendiente', idAsignacion, docente.idUsuario, docente.idUsuario, 3]
      );
    }
    // 2. Evaluación Evaluador al Docente (tipo 2)
    for (const docente of docentes) {
      for (const evaluador of evaluadores) {
        await conn.execute(
          'INSERT INTO EVALUACION (fechaEvaluacion, horaEvaluacion, puntajeTotal, comentario, estado, idAsignacion, idEvaluador, idEvaluado, idTipoEvaluacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [data.fechaInicio, data.horaInicio, null, null, 'Pendiente', idAsignacion, evaluador.idUsuario, docente.idUsuario, 2]
        );
      }
    }
    // 3. Evaluación Estudiante al Docente (tipo 1)
    for (const docente of docentes) {
      for (const estudiante of estudiantes) {
        await conn.execute(
          'INSERT INTO EVALUACION (fechaEvaluacion, horaEvaluacion, puntajeTotal, comentario, estado, idAsignacion, idEvaluador, idEvaluado, idTipoEvaluacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [data.fechaInicio, data.horaInicio, null, null, 'Pendiente', idAsignacion, estudiante.idUsuario, docente.idUsuario, 1]
        );
      }
    }
    await conn.commit();
    return { success: true, idAsignacion };
  } catch (error) {
    await conn.rollback();
    console.error('Error al crear asignación y evaluaciones:', error);
    return { success: false, message: 'Error al crear la asignación y evaluaciones' };
  } finally {
    conn.release();
  }
};

// Listar asignaciones
const getAllAsignaciones = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    // Buscar asignaciones vencidas y activas
    const [vencidas] = await conn.execute(
      `SELECT * FROM ASIGNACION WHERE estado = 'Activo' AND CONCAT(fechaFin, 'T', horaFin) < ?`,
      [new Date().toISOString().slice(0, 16)]
    );
    // Actualizar asignaciones vencidas a 'Inactivo'
    if (vencidas.length > 0) {
      await conn.execute(
        `UPDATE ASIGNACION SET estado = 'Inactivo' 
         WHERE estado = 'Activo' 
         AND CONCAT(fechaFin, 'T', horaFin) < ?`,
        [new Date().toISOString().slice(0, 16)]
      );
      // Crear incidencia para cada asignación vencida
      for (const asignacion of vencidas) {
        // Buscar el usuario responsable (idUsuario)
        const idUsuario = asignacion.idUsuario;
        // Crear incidencia
        const now = new Date();
        const fecha = now.toISOString().slice(0, 10);
        const hora = now.toTimeString().slice(0, 8);
        await incidenciaService.createIncidencia({
          fecha,
          hora,
          descripcion: `La asignación ${asignacion.idAsignacion} fue cancelada automáticamente por superar la fecha y hora límite.`,
          tipo: 'Cancelación automática',
          reportadorId: idUsuario,
          afectadoId: idUsuario
        });
      }
    }
    const [rows] = await conn.execute(
      `SELECT a.*, ar.nombre as areaNombre, u.correo as usuarioCorreo FROM ASIGNACION a
      JOIN AREA ar ON a.idArea = ar.idArea
      JOIN USUARIO u ON a.idUsuario = u.idUsuario
      ORDER BY a.fechaInicio DESC`
    );
    return { success: true, asignaciones: rows };
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return { success: false, message: 'Error al obtener las asignaciones' };
  } finally {
    if (conn) conn.release();
  }
};

// Actualizar una asignación existente
const updateAsignacion = async (id, data) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Actualizar la asignación
    const [result] = await conn.execute(
      'UPDATE ASIGNACION SET idArea = ?, periodo = ?, fechaInicio = ?, fechaFin = ?, horaInicio = ?, horaFin = ?, estado = ? WHERE idAsignacion = ?',
      [data.idArea, data.periodo, data.fechaInicio, data.fechaFin, data.horaInicio, data.horaFin, data.estado || 'Activo', id]
    );
    await conn.commit();
    return { success: true };
  } catch (error) {
    await conn.rollback();
    console.error('Error al actualizar asignación:', error);
    return { success: false, message: 'Error al actualizar la asignación' };
  } finally {
    conn.release();
  }
};

module.exports = {
  createAsignacion,
  getAllAsignaciones,
  updateAsignacion
}; 