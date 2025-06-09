
const { pool } = require('../utils/dbConnection.cjs');

// Obtener todos los criterios
const getAllCriterios = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT idCriterio, nombre, descripcion, puntaje, vigencia 
       FROM CRITERIOS 
       WHERE vigencia = 1 
       ORDER BY idCriterio`
    );
    
    return {
      success: true,
      criterios: rows
    };
  } catch (error) {
    console.error('Error al obtener criterios:', error);
    return { success: false, message: 'Error al obtener los criterios' };
  }
};

// Obtener criterios por tipo de evaluación
const getCriteriosByTipoEvaluacion = async (idTipoEvaluacion) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.idCriterio, c.nombre 
       FROM CRITERIO c
       JOIN TIPO_EVALUACION_CRITERIO tec ON c.idCriterio = tec.idCriterio
       WHERE tec.idTipoEvaluacion = ?
       ORDER BY c.idCriterio`,
      [idTipoEvaluacion]
    );
    
    return {
      success: true,
      criterios: rows
    };
  } catch (error) {
    console.error('Error al obtener criterios por tipo:', error);
    return { success: false, message: 'Error al obtener los criterios' };
  }
};

// Obtener subcriterios por criterio
const getSubcriteriosByCriterio = async (idCriterio) => {
  try {
    const [rows] = await pool.execute(
      `SELECT idSubCriterio, nombre, idCriterio 
       FROM SUB_CRITERIO 
       WHERE idCriterio = ? 
       ORDER BY idSubCriterio`,
      [idCriterio]
    );
    
    return {
      success: true,
      subcriterios: rows
    };
  } catch (error) {
    console.error('Error al obtener subcriterios:', error);
    return { success: false, message: 'Error al obtener los subcriterios' };
  }
};

// Obtener criterios con subcriterios para autoevaluación (tipo 3)
const getCriteriosParaAutoevaluacion = async () => {
  try {
    // Obtener criterios para autoevaluación (idTipoEvaluacion = 3)
    const [criterios] = await pool.execute(
      `SELECT c.idCriterio, c.nombre 
       FROM CRITERIO c
       JOIN TIPO_EVALUACION_CRITERIO tec ON c.idCriterio = tec.idCriterio
       WHERE tec.idTipoEvaluacion = 3
       ORDER BY c.idCriterio`
    );
    
    // Para cada criterio, obtener sus subcriterios
    const criteriosConSubcriterios = [];
    
    for (const criterio of criterios) {
      const [subcriterios] = await pool.execute(
        `SELECT idSubCriterio, nombre 
         FROM SUB_CRITERIO 
         WHERE idCriterio = ? 
         ORDER BY idSubCriterio`,
        [criterio.idCriterio]
      );
      
      criteriosConSubcriterios.push({
        id: criterio.idCriterio,
        nombre: criterio.nombre,
        subcriterios: subcriterios.map(sub => ({
          id: sub.idSubCriterio,
          texto: sub.nombre,
          criterioId: criterio.idCriterio
        }))
      });
    }
    
    return {
      success: true,
      criterios: criteriosConSubcriterios
    };
  } catch (error) {
    console.error('Error al obtener criterios para autoevaluación:', error);
    return { success: false, message: 'Error al obtener los criterios para autoevaluación' };
  }
};

// Obtener todos los subcriterios
const getAllSubcriterios = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.idSubCriterio, s.nombre as texto, s.idCriterio, c.nombre as criterioNombre
       FROM SUB_CRITERIO s
       JOIN CRITERIO c ON s.idCriterio = c.idCriterio
       ORDER BY s.idCriterio, s.idSubCriterio`
    );
    
    return {
      success: true,
      subcriterios: rows
    };
  } catch (error) {
    console.error('Error al obtener todos los subcriterios:', error);
    return { success: false, message: 'Error al obtener los subcriterios' };
  }
};

module.exports = {
  getAllCriterios,
  getCriteriosByTipoEvaluacion,
  getSubcriteriosByCriterio,
  getCriteriosParaAutoevaluacion,
  getAllSubcriterios
};
