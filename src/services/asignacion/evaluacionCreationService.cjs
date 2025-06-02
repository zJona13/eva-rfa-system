
const { pool } = require('../../utils/dbConnection.cjs');

// Create evaluations for an assignment
const createEvaluationsForAsignacion = async (connection, asignacionId, asignacionData) => {
  console.log('=== CREANDO EVALUACIONES PARA ASIGNACIÓN ===');
  
  // Get all teachers from the area
  const [docentes] = await connection.execute(
    `SELECT c.idColaborador, CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as nombre,
     u.idUsuario
     FROM COLABORADOR c
     JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
     JOIN USUARIO u ON c.idColaborador = u.idColaborador
     WHERE u.idArea = ? AND c.estado = 1 AND tc.nombre = 'Docente'`,
    [asignacionData.areaId]
  );
  
  console.log('Docentes encontrados en el área:', docentes.length);
  
  if (docentes.length === 0) {
    throw new Error('No existen profesores en el área seleccionada');
  }
  
  // Get all students
  const [estudiantes] = await connection.execute(
    `SELECT c.idColaborador, u.idUsuario, CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as nombre
     FROM COLABORADOR c
     JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
     JOIN USUARIO u ON c.idColaborador = u.idColaborador
     WHERE c.estado = 1 AND tc.nombre = 'Estudiante'`
  );
  
  console.log('Estudiantes encontrados:', estudiantes.length);
  
  const evaluacionesCreadas = [];
  
  // 1. Create self-evaluations for each teacher
  for (const docente of docentes) {
    if (docente.idUsuario) {
      const evaluacionId = await createEvaluacion(connection, {
        fechaEvaluacion: asignacionData.fechaInicio,
        horaEvaluacion: asignacionData.horaInicio || '08:00',
        tipo: 'Autoevaluacion',
        estado: 'Pendiente',
        idUsuario: docente.idUsuario,
        idColaborador: docente.idColaborador,
        comentario: `Autoevaluación programada para ${docente.nombre}`
      });
      
      await createDetalleAsignacion(connection, evaluacionId, asignacionId);
      
      evaluacionesCreadas.push({
        id: evaluacionId,
        tipo: 'Autoevaluacion',
        evaluador: docente.nombre,
        evaluado: docente.nombre
      });
    }
  }
  
  // 2. Create teacher-to-teacher evaluations
  for (const evaluador of docentes) {
    if (evaluador.idUsuario) {
      for (const evaluado of docentes) {
        if (evaluador.idColaborador !== evaluado.idColaborador) {
          const evaluacionId = await createEvaluacion(connection, {
            fechaEvaluacion: asignacionData.fechaInicio,
            horaEvaluacion: asignacionData.horaInicio || '08:00',
            tipo: 'Evaluador-Evaluado',
            estado: 'Pendiente',
            idUsuario: evaluador.idUsuario,
            idColaborador: evaluado.idColaborador,
            comentario: `Evaluación de ${evaluador.nombre} a ${evaluado.nombre}`
          });
          
          await createDetalleAsignacion(connection, evaluacionId, asignacionId);
          
          evaluacionesCreadas.push({
            id: evaluacionId,
            tipo: 'Evaluador-Evaluado',
            evaluador: evaluador.nombre,
            evaluado: evaluado.nombre
          });
        }
      }
    }
  }
  
  // 3. Create student-to-teacher evaluations
  for (const estudiante of estudiantes) {
    for (const docente of docentes) {
      const evaluacionId = await createEvaluacion(connection, {
        fechaEvaluacion: asignacionData.fechaInicio,
        horaEvaluacion: asignacionData.horaInicio || '08:00',
        tipo: 'Estudiante-Docente',
        estado: 'Pendiente',
        idUsuario: estudiante.idUsuario,
        idColaborador: docente.idColaborador,
        comentario: `Evaluación de estudiante ${estudiante.nombre} a ${docente.nombre}`
      });
      
      await createDetalleAsignacion(connection, evaluacionId, asignacionId);
      
      evaluacionesCreadas.push({
        id: evaluacionId,
        tipo: 'Estudiante-Docente',
        evaluador: estudiante.nombre,
        evaluado: docente.nombre
      });
    }
  }
  
  console.log('=== EVALUACIONES CREADAS EXITOSAMENTE ===');
  console.log(`Total evaluaciones creadas: ${evaluacionesCreadas.length}`);
  console.log('Tipos de evaluaciones:', {
    autoevaluaciones: evaluacionesCreadas.filter(e => e.tipo === 'Autoevaluacion').length,
    evaluadorEvaluado: evaluacionesCreadas.filter(e => e.tipo === 'Evaluador-Evaluado').length,
    estudianteDocente: evaluacionesCreadas.filter(e => e.tipo === 'Estudiante-Docente').length
  });
  
  return evaluacionesCreadas;
};

// Helper function to create a single evaluation
const createEvaluacion = async (connection, evaluacionData) => {
  const [result] = await connection.execute(
    `INSERT INTO EVALUACION 
     (fechaEvaluacion, horaEvaluacion, tipo, estado, idUsuario, idColaborador, comentario) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      evaluacionData.fechaEvaluacion,
      evaluacionData.horaEvaluacion,
      evaluacionData.tipo,
      evaluacionData.estado,
      evaluacionData.idUsuario,
      evaluacionData.idColaborador,
      evaluacionData.comentario
    ]
  );
  
  return result.insertId;
};

// Helper function to create assignment detail
const createDetalleAsignacion = async (connection, evaluacionId, asignacionId) => {
  await connection.execute(
    `INSERT INTO DETALLE_ASIGNACION (idEvaluacion, idAsignacion) 
     VALUES (?, ?)`,
    [evaluacionId, asignacionId]
  );
};

module.exports = {
  createEvaluationsForAsignacion
};
