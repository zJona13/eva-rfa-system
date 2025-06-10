
const { pool } = require('../utils/dbConnection.cjs');

// Crear una nueva asignación con sus 3 evaluaciones automáticas
const createAsignacion = async (asignacionData) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Crear la asignación
    const [asignacionResult] = await conn.execute(
      'INSERT INTO ASIGNACION (idUsuario, periodo, fechaInicio, fechaFin, horaInicio, horaFin, estado, idArea) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        asignacionData.idUsuario,
        asignacionData.periodo,
        asignacionData.fechaInicio,
        asignacionData.fechaFin,
        asignacionData.horaInicio,
        asignacionData.horaFin,
        'Activo',
        asignacionData.idArea
      ]
    );

    const asignacionId = asignacionResult.insertId;

    // Obtener usuarios del área para las evaluaciones
    const [usuarios] = await conn.execute(
      `SELECT u.idUsuario, u.idColaborador, c.nombreColaborador, c.apePaColaborador, c.apeMaColaborador
       FROM USUARIO u 
       LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       WHERE u.idArea = ? AND u.estado = 'Activo'`,
      [asignacionData.idArea]
    );

    // Crear las 3 evaluaciones automáticamente para cada usuario
    const tiposEvaluacion = [1, 2, 3]; // 1=Estudiante-Docente, 2=Evaluador-Docente, 3=Autoevaluación

    for (const usuario of usuarios) {
      for (const tipoEvaluacion of tiposEvaluacion) {
        // Determinar evaluador y evaluado según el tipo
        let idEvaluador, idEvaluado;
        
        if (tipoEvaluacion === 3) { // Autoevaluación
          idEvaluador = usuario.idUsuario;
          idEvaluado = usuario.idUsuario;
        } else {
          // Para otros tipos, por ahora usar el mismo usuario (se puede ajustar según lógica específica)
          idEvaluador = usuario.idUsuario;
          idEvaluado = usuario.idUsuario;
        }

        await conn.execute(
          'INSERT INTO EVALUACION (fechaEvaluacion, horaEvaluacion, puntajeTotal, comentario, estado, idAsignacion, idEvaluador, idEvaluado, idTipoEvaluacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            new Date().toISOString().split('T')[0], // fecha actual
            new Date().toTimeString().split(' ')[0], // hora actual
            0, // puntaje inicial
            null, // sin comentario inicial
            'Pendiente', // estado inicial
            asignacionId,
            idEvaluador,
            idEvaluado,
            tipoEvaluacion
          ]
        );
      }
    }

    await conn.commit();
    return {
      success: true,
      asignacionId: asignacionId,
      message: 'Asignación creada exitosamente con evaluaciones automáticas'
    };

  } catch (error) {
    await conn.rollback();
    console.error('Error al crear asignación:', error);
    return { success: false, message: 'Error al crear la asignación' };
  } finally {
    conn.release();
  }
};

// Obtener todas las asignaciones
const getAllAsignaciones = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion, a.periodo, a.fechaInicio, a.fechaFin, 
              a.horaInicio, a.horaFin, a.estado,
              ar.nombre as areaNombre,
              u.correo as usuarioCorreo,
              CONCAT(c.nombreColaborador, ' ', c.apePaColaborador, ' ', c.apeMaColaborador) as nombreCompleto
       FROM ASIGNACION a
       JOIN AREA ar ON a.idArea = ar.idArea
       JOIN USUARIO u ON a.idUsuario = u.idUsuario
       LEFT JOIN COLABORADOR c ON u.idColaborador = c.idColaborador
       ORDER BY a.fechaInicio DESC`
    );
    
    return {
      success: true,
      asignaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return { success: false, message: 'Error al obtener las asignaciones' };
  }
};

// Obtener asignaciones activas por usuario
const getAsignacionesActivasByUsuario = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.idAsignacion, a.periodo, a.fechaInicio, a.fechaFin, 
              a.horaInicio, a.horaFin, a.estado,
              ar.nombre as areaNombre
       FROM ASIGNACION a
       JOIN AREA ar ON a.idArea = ar.idArea
       WHERE a.idUsuario = ? AND a.estado = 'Activo'
       AND CURDATE() BETWEEN a.fechaInicio AND a.fechaFin
       ORDER BY a.fechaInicio DESC`,
      [userId]
    );
    
    return {
      success: true,
      asignaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener asignaciones activas:', error);
    return { success: false, message: 'Error al obtener las asignaciones activas' };
  }
};

// Obtener evaluaciones de una asignación
const getEvaluacionesByAsignacion = async (asignacionId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.idEvaluacion, e.fechaEvaluacion, e.horaEvaluacion, 
              e.puntajeTotal, e.comentario, e.estado,
              te.nombre as tipoEvaluacion,
              CONCAT(evaluador.nombreColaborador, ' ', evaluador.apePaColaborador) as evaluadorNombre,
              CONCAT(evaluado.nombreColaborador, ' ', evaluado.apePaColaborador) as evaluadoNombre
       FROM EVALUACION e
       JOIN TIPO_EVALUACION te ON e.idTipoEvaluacion = te.idTipoEvaluacion
       LEFT JOIN USUARIO u_evaluador ON e.idEvaluador = u_evaluador.idUsuario
       LEFT JOIN COLABORADOR evaluador ON u_evaluador.idColaborador = evaluador.idColaborador
       LEFT JOIN USUARIO u_evaluado ON e.idEvaluado = u_evaluado.idUsuario
       LEFT JOIN COLABORADOR evaluado ON u_evaluado.idColaborador = evaluado.idColaborador
       WHERE e.idAsignacion = ?
       ORDER BY e.idTipoEvaluacion`,
      [asignacionId]
    );
    
    return {
      success: true,
      evaluaciones: rows
    };
  } catch (error) {
    console.error('Error al obtener evaluaciones de asignación:', error);
    return { success: false, message: 'Error al obtener las evaluaciones' };
  }
};

// Verificar si una evaluación está en período activo
const isEvaluacionEnPeriodoActivo = async (evaluacionId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.fechaInicio, a.fechaFin, a.horaInicio, a.horaFin, a.estado
       FROM EVALUACION e
       JOIN ASIGNACION a ON e.idAsignacion = a.idAsignacion
       WHERE e.idEvaluacion = ?`,
      [evaluacionId]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Evaluación no encontrada' };
    }

    const asignacion = rows[0];
    const ahora = new Date();
    const fechaActual = ahora.toISOString().split('T')[0];
    const horaActual = ahora.toTimeString().split(' ')[0];

    const enPeriodo = asignacion.estado === 'Activo' &&
                     fechaActual >= asignacion.fechaInicio &&
                     fechaActual <= asignacion.fechaFin;

    return {
      success: true,
      enPeriodo: enPeriodo,
      asignacion: asignacion
    };
  } catch (error) {
    console.error('Error al verificar período activo:', error);
    return { success: false, message: 'Error al verificar el período' };
  }
};

// Actualizar estado de asignación
const updateAsignacionEstado = async (asignacionId, nuevoEstado) => {
  try {
    await pool.execute(
      'UPDATE ASIGNACION SET estado = ? WHERE idAsignacion = ?',
      [nuevoEstado, asignacionId]
    );
    
    return {
      success: true,
      message: 'Estado de asignación actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error al actualizar estado de asignación:', error);
    return { success: false, message: 'Error al actualizar el estado' };
  }
};

module.exports = {
  createAsignacion,
  getAllAsignaciones,
  getAsignacionesActivasByUsuario,
  getEvaluacionesByAsignacion,
  isEvaluacionEnPeriodoActivo,
  updateAsignacionEstado
};
