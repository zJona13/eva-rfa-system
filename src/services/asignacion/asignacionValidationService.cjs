
const { pool } = require('../../utils/dbConnection.cjs');

// Validate assignment data
const validateAsignacionData = async (asignacionData, excludeId = null) => {
  // Validate date range
  if (new Date(asignacionData.fechaFin) < new Date(asignacionData.fechaInicio)) {
    return {
      isValid: false,
      message: 'La fecha de finalización no puede ser anterior a la fecha de inicio'
    };
  }
  
  // Validate area exists
  const [areaExists] = await pool.execute(
    'SELECT idArea, nombre FROM AREA WHERE idArea = ?',
    [asignacionData.areaId]
  );
  
  if (areaExists.length === 0) {
    return {
      isValid: false,
      message: 'El área seleccionada no existe'
    };
  }
  
  // Validate teachers exist in the area
  const [docentes] = await pool.execute(
    `SELECT c.idColaborador
     FROM COLABORADOR c
     JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
     JOIN USUARIO u ON c.idColaborador = u.idColaborador
     WHERE u.idArea = ? AND c.estado = 1 AND tc.nombre = 'Docente'`,
    [asignacionData.areaId]
  );
  
  if (docentes.length === 0) {
    return {
      isValid: false,
      message: 'No se puede crear la asignación. No existen profesores en el área seleccionada.'
    };
  }
  
  return {
    isValid: true,
    message: 'Datos válidos',
    area: areaExists[0],
    teachersCount: docentes.length
  };
};

// Validate time range for same day
const validateTimeRange = (asignacionData) => {
  if (asignacionData.fechaInicio === asignacionData.fechaFin) {
    if (asignacionData.horaFin <= asignacionData.horaInicio) {
      return {
        isValid: false,
        message: 'La hora de finalización debe ser posterior a la hora de inicio cuando es el mismo día'
      };
    }
  }
  
  return { isValid: true };
};

// Validate area availability (simplified - just check if area exists)
const validarDisponibilidadHorario = async (fechaInicio, fechaFin, horaInicio, horaFin, areaId, excludeId = null) => {
  try {
    // Check if area exists
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

module.exports = {
  validateAsignacionData,
  validateTimeRange,
  validarDisponibilidadHorario
};
