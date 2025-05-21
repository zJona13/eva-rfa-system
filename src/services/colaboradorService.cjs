
const { pool } = require('../utils/dbConnection.cjs');

// Obtener todos los colaboradores con información relacionada
const getAllColaboradores = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.idColaborador as id, 
      CONCAT(c.nombres, ' ', c.apePat, ' ', c.apeMat) as fullName,
      c.nombres, c.apePat, c.apeMat, c.fechaNacimiento as birthDate, 
      c.direccion as address, c.telefono as phone, c.dni, 
      c.estado as active, tc.idTipoColab as roleId, tc.nombre as roleName,
      co.idContrato as contractId, co.fechaInicio as startDate, 
      co.fechaFin as endDate, co.modalidad as modality, 
      co.estado as contractActive, tco.idTipoContrato as contractTypeId,
      tco.nombre as contractType
      FROM COLABORADOR c
      JOIN TIPO_COLABORADOR tc ON c.idTipoColab = tc.idTipoColab
      JOIN CONTRATO co ON c.idContrato = co.idContrato
      JOIN TIPO_CONTRATO tco ON co.idTipoContrato = tco.idTipoContrato`
    );
    
    return {
      success: true,
      colaboradores: rows.map(colaborador => ({
        ...colaborador,
        active: colaborador.active === 1,
        contractActive: colaborador.contractActive === 1
      }))
    };
  } catch (error) {
    console.error('Error al obtener colaboradores:', error);
    return { success: false, message: 'Error al obtener los colaboradores' };
  }
};

// Obtener todos los tipos de contrato
const getAllTiposContrato = async () => {
  try {
    const [rows] = await pool.execute('SELECT idTipoContrato as id, nombre as name FROM TIPO_CONTRATO');
    
    return {
      success: true,
      tiposContrato: rows
    };
  } catch (error) {
    console.error('Error al obtener tipos de contrato:', error);
    return { success: false, message: 'Error al obtener los tipos de contrato' };
  }
};

// Crear un nuevo colaborador (incluye crear un contrato)
const createColaborador = async (colaboradorData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Primero creamos el contrato
    const [contratoResult] = await connection.execute(
      'INSERT INTO CONTRATO (fechaInicio, fechaFin, estado, modalidad, idTipoContrato) VALUES (?, ?, ?, ?, ?)',
      [
        colaboradorData.startDate, 
        colaboradorData.endDate, 
        colaboradorData.contractActive ? 1 : 0, 
        colaboradorData.modality, 
        colaboradorData.contractTypeId
      ]
    );
    
    const contratoId = contratoResult.insertId;
    
    // Luego creamos el colaborador
    const [colaboradorResult] = await connection.execute(
      'INSERT INTO COLABORADOR (nombres, apePat, apeMat, fechaNacimiento, direccion, telefono, dni, estado, idTipoColab, idContrato) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        colaboradorData.nombres,
        colaboradorData.apePat,
        colaboradorData.apeMat,
        colaboradorData.birthDate,
        colaboradorData.address,
        colaboradorData.phone,
        colaboradorData.dni,
        colaboradorData.active ? 1 : 0,
        colaboradorData.roleId,
        contratoId
      ]
    );
    
    await connection.commit();
    
    return {
      success: true,
      colaboradorId: colaboradorResult.insertId,
      contratoId: contratoId,
      message: 'Colaborador creado exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear colaborador:', error);
    return { success: false, message: 'Error al crear el colaborador' };
  } finally {
    connection.release();
  }
};

// Actualizar un colaborador
const updateColaborador = async (colaboradorId, colaboradorData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Obtenemos el ID del contrato del colaborador
    const [colaborador] = await connection.execute(
      'SELECT idContrato FROM COLABORADOR WHERE idColaborador = ?',
      [colaboradorId]
    );
    
    if (colaborador.length === 0) {
      return { success: false, message: 'Colaborador no encontrado' };
    }
    
    const contratoId = colaborador[0].idContrato;
    
    // Actualizamos el contrato
    await connection.execute(
      'UPDATE CONTRATO SET fechaInicio = ?, fechaFin = ?, estado = ?, modalidad = ?, idTipoContrato = ? WHERE idContrato = ?',
      [
        colaboradorData.startDate, 
        colaboradorData.endDate, 
        colaboradorData.contractActive ? 1 : 0, 
        colaboradorData.modality, 
        colaboradorData.contractTypeId,
        contratoId
      ]
    );
    
    // Actualizamos el colaborador
    await connection.execute(
      'UPDATE COLABORADOR SET nombres = ?, apePat = ?, apeMat = ?, fechaNacimiento = ?, direccion = ?, telefono = ?, dni = ?, estado = ?, idTipoColab = ? WHERE idColaborador = ?',
      [
        colaboradorData.nombres,
        colaboradorData.apePat,
        colaboradorData.apeMat,
        colaboradorData.birthDate,
        colaboradorData.address,
        colaboradorData.phone,
        colaboradorData.dni,
        colaboradorData.active ? 1 : 0,
        colaboradorData.roleId,
        colaboradorId
      ]
    );
    
    await connection.commit();
    
    return {
      success: true,
      message: 'Colaborador actualizado exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar colaborador:', error);
    return { success: false, message: 'Error al actualizar el colaborador' };
  } finally {
    connection.release();
  }
};

// Eliminar un colaborador
const deleteColaborador = async (colaboradorId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Obtenemos el ID del contrato del colaborador
    const [colaborador] = await connection.execute(
      'SELECT idContrato FROM COLABORADOR WHERE idColaborador = ?',
      [colaboradorId]
    );
    
    if (colaborador.length === 0) {
      return { success: false, message: 'Colaborador no encontrado' };
    }
    
    const contratoId = colaborador[0].idContrato;
    
    // Eliminamos el colaborador
    await connection.execute(
      'DELETE FROM COLABORADOR WHERE idColaborador = ?',
      [colaboradorId]
    );
    
    // Eliminamos el contrato
    await connection.execute(
      'DELETE FROM CONTRATO WHERE idContrato = ?',
      [contratoId]
    );
    
    await connection.commit();
    
    return {
      success: true,
      message: 'Colaborador eliminado exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar colaborador:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return { success: false, message: 'No se puede eliminar el colaborador porque está siendo utilizado en otras tablas' };
    }
    return { success: false, message: 'Error al eliminar el colaborador' };
  } finally {
    connection.release();
  }
};

// Crear un nuevo tipo de contrato
const createTipoContrato = async (nombre) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO TIPO_CONTRATO (nombre) VALUES (?)',
      [nombre]
    );
    
    return {
      success: true,
      id: result.insertId,
      message: 'Tipo de contrato creado exitosamente'
    };
  } catch (error) {
    console.error('Error al crear tipo de contrato:', error);
    return { success: false, message: 'Error al crear el tipo de contrato' };
  }
};

module.exports = {
  getAllColaboradores,
  getAllTiposContrato,
  createColaborador,
  updateColaborador,
  deleteColaborador,
  createTipoContrato
};
