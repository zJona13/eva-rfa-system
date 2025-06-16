const { pool } = require('../utils/dbConnection.cjs');
const evaluacionService = require('./evaluacionService.cjs');

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
    const docentes = usuarios.filter(u => u.idTipoUsuario === 3);
    const evaluadores = usuarios.filter(u => u.idTipoUsuario === 2);
    const estudiantes = usuarios.filter(u => u.idTipoUsuario === 4);

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
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, ar.nombre as areaNombre, u.correo as usuarioCorreo FROM ASIGNACION a
      JOIN AREA ar ON a.idArea = ar.idArea
      JOIN USUARIO u ON a.idUsuario = u.idUsuario
      ORDER BY a.fechaInicio DESC`
    );
    return { success: true, asignaciones: rows };
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return { success: false, message: 'Error al obtener las asignaciones' };
  }
};

module.exports = {
  createAsignacion,
  getAllAsignaciones
}; 