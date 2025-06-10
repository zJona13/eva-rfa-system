
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

// Obtener subcriterios agrupados por criterio
const getSubcriteriosAgrupados = async () => {
  try {
    const result = await getAllSubcriterios();
    if (!result.success) {
      return result;
    }

    const agrupados = {};
    result.subcriterios.forEach(sub => {
      if (!agrupados[sub.criterioNombre]) {
        agrupados[sub.criterioNombre] = [];
      }
      agrupados[sub.criterioNombre].push({
        id: sub.idSubCriterio.toString(),
        texto: sub.texto,
        puntaje: sub.puntaje
      });
    });

    return {
      success: true,
      criteriosAgrupados: agrupados
    };
  } catch (error) {
    console.error('Error al agrupar subcriterios:', error);
    return { success: false, message: 'Error al agrupar los subcriterios' };
  }
};

module.exports = {
  getAllCriterios,
  getSubcriteriosByCriterio,
  getAllSubcriterios,
  getSubcriteriosAgrupados
};
