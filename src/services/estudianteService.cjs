
const { pool } = require('../utils/dbConnection.cjs');

// Obtener todos los estudiantes con info de usuario y área
const getAllEstudiantes = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEstudiante as id, e.codigo, e.sexo, e.semestre, e.idArea as areaId, a.nombre as areaName, e.idUsuario as usuarioId, u.correo as usuarioCorreo
      FROM ESTUDIANTE e
      JOIN USUARIO u ON e.idUsuario = u.idUsuario
      JOIN AREA a ON e.idArea = a.idArea`
    );
    return { success: true, estudiantes: rows };
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    return { success: false, message: 'Error al obtener los estudiantes' };
  }
};

// Crear estudiante
const createEstudiante = async (data) => {
  try {
    const { codigo, sexo, semestre, areaId, usuarioId } = data;
    const [result] = await pool.execute(
      'INSERT INTO ESTUDIANTE (codigo, sexo, semestre, idArea, idUsuario) VALUES (?, ?, ?, ?, ?)',
      [codigo, sexo, semestre, areaId, usuarioId]
    );
    return { success: true, estudianteId: result.insertId };
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    return { success: false, message: 'Error al crear el estudiante' };
  }
};

// Actualizar estudiante
const updateEstudiante = async (id, data) => {
  try {
    const { codigo, sexo, semestre, areaId, usuarioId } = data;
    await pool.execute(
      'UPDATE ESTUDIANTE SET codigo = ?, sexo = ?, semestre = ?, idArea = ?, idUsuario = ? WHERE idEstudiante = ?',
      [codigo, sexo, semestre, areaId, usuarioId, id]
    );
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    return { success: false, message: 'Error al actualizar el estudiante' };
  }
};

// Eliminar estudiante
const deleteEstudiante = async (id) => {
  try {
    await pool.execute('DELETE FROM ESTUDIANTE WHERE idEstudiante = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    return { success: false, message: 'Error al eliminar el estudiante' };
  }
};

module.exports = {
  getAllEstudiantes,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante
};
