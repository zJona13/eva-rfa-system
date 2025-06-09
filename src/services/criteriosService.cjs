
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

// Obtener subcriterios por criterio
const getSubcriteriosByCriterio = async (idCriterio) => {
  try {
    const [rows] = await pool.execute(
      `SELECT idSubCriterio, texto, vigencia, puntaje, idCriterio 
       FROM SUBCRITERIOS 
       WHERE idCriterio = ? AND vigencia = 1 
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

// Obtener todos los subcriterios con información del criterio
const getAllSubcriterios = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.idSubCriterio, s.texto, s.vigencia, s.puntaje, s.idCriterio, c.nombre as criterioNombre
       FROM SUBCRITERIOS s
       JOIN CRITERIOS c ON s.idCriterio = c.idCriterio
       WHERE s.vigencia = 1 AND c.vigencia = 1 
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

// Obtener criterios agrupados con sus subcriterios para autoevaluación
const getCriteriosConSubcriterios = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        c.idCriterio,
        c.nombre as criterioNombre,
        c.descripcion as criterioDescripcion,
        s.idSubCriterio,
        s.texto as subcriterioTexto,
        s.puntaje as subcriterio Puntaje
       FROM CRITERIOS c
       LEFT JOIN SUBCRITERIOS s ON c.idCriterio = s.idCriterio
       WHERE c.vigencia = 1 AND (s.vigencia = 1 OR s.vigencia IS NULL)
       ORDER BY c.idCriterio, s.idSubCriterio`
    );
    
    // Agrupar por criterio
    const criteriosAgrupados = {};
    
    rows.forEach(row => {
      const criterioId = row.idCriterio;
      
      if (!criteriosAgrupados[criterioId]) {
        criteriosAgrupados[criterioId] = {
          id: criterioId,
          nombre: row.criterioNombre,
          descripcion: row.criterioDescripcion,
          subcriterios: []
        };
      }
      
      if (row.idSubCriterio) {
        criteriosAgrupados[criterioId].subcriterios.push({
          id: row.idSubCriterio.toString(),
          texto: row.subcriterioTexto,
          puntaje: row.subcriterioPuntaje,
          criterioId: criterioId
        });
      }
    });
    
    return {
      success: true,
      criterios: Object.values(criteriosAgrupados)
    };
  } catch (error) {
    console.error('Error al obtener criterios con subcriterios:', error);
    return { success: false, message: 'Error al obtener los criterios y subcriterios' };
  }
};

module.exports = {
  getAllCriterios,
  getSubcriteriosByCriterio,
  getAllSubcriterios,
  getCriteriosConSubcriterios
};
