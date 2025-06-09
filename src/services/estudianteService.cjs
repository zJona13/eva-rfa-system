const { pool } = require('../utils/dbConnection.cjs');
const userService = require('./userService.cjs');

// Obtener todos los estudiantes con info de usuario y área
const getAllEstudiantes = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEstudiante as id, e.codigo, e.sexo, e.semestre, e.idArea as areaId, a.nombre as areaName, e.idUsuario as usuarioId, u.correo as usuarioCorreo, e.nombreEstudiante, e.apePaEstudiante, e.apeMaEstudiante
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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let usuarioId = data.usuarioId;
    // Si viene el objeto user, creamos el usuario primero
    if (data.user) {
      const userResult = await userService.createUser({
        email: data.user.email,
        password: data.user.password,
        active: true,
        roleId: 4, // 4 = Estudiante
        colaboradorId: null,
        areaId: data.areaId
      });
      if (!userResult.success) {
        await connection.rollback();
        return { success: false, message: userResult.message || 'Error al crear el usuario' };
      }
      usuarioId = userResult.userId;
    }
    const { codigo, sexo, semestre, areaId, nombreEstudiante, apePaEstudiante, apeMaEstudiante } = data;
    const [result] = await connection.execute(
      'INSERT INTO ESTUDIANTE (codigo, sexo, semestre, idArea, idUsuario, nombreEstudiante, apePaEstudiante, apeMaEstudiante) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [codigo, sexo, semestre, areaId, usuarioId, nombreEstudiante, apePaEstudiante, apeMaEstudiante]
    );
    await connection.commit();
    return { success: true, estudianteId: result.insertId };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al crear estudiante:', error);
    return { success: false, message: 'Error al crear el estudiante' };
  } finally {
    if (connection) connection.release();
  }
};

// Actualizar estudiante
const updateEstudiante = async (id, data) => {
  try {
    const { codigo, sexo, semestre, areaId, usuarioId, nombreEstudiante, apePaEstudiante, apeMaEstudiante } = data;
    await pool.execute(
      'UPDATE ESTUDIANTE SET codigo = ?, sexo = ?, semestre = ?, idArea = ?, idUsuario = ?, nombreEstudiante = ?, apePaEstudiante = ?, apeMaEstudiante = ? WHERE idEstudiante = ?',
      [codigo, sexo, semestre, areaId, usuarioId, nombreEstudiante, apePaEstudiante, apeMaEstudiante, id]
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
