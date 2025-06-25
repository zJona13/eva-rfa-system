
const { pool } = require('../utils/dbConnection.cjs');
const bcrypt = require('bcryptjs');

// Obtener todos los colaboradores con información relacionada
const getAllColaboradores = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.idColaborador as id, 
      CONCAT(c.nombreColaborador, ' ', c.apePaColaborador, ' ', c.apeMaColaborador) as fullName,
      c.nombreColaborador as nombres, c.apePaColaborador as apePat, c.apeMaColaborador as apeMat, 
      c.fechaNacimiento as birthDate, 
      c.direccion as address, c.telefono as phone, c.dniColaborador as dni, 
      c.estado as active, tc.idTipoColaborador as roleId, tc.nombre as roleName,
      co.idContrato as contractId, co.fechaInicio as startDate, 
      co.fechaFin as endDate, 
      co.estado as contractActive, tco.idTipoContrato as contractTypeId,
      tco.nombre as contractType,
      c.prueba as test,
      c.idArea as areaId, a.nombre as areaName
      FROM COLABORADOR c
      JOIN TIPO_COLABORADOR tc ON c.idTipoColaborador = tc.idTipoColaborador
      JOIN CONTRATO co ON c.idContrato = co.idContrato
      JOIN TIPO_CONTRATO tco ON co.idTipoContrato = tco.idTipoContrato
      LEFT JOIN AREA a ON c.idArea = a.idArea`
    );
    
    return {
      success: true,
      colaboradores: rows.map(colaborador => ({
        ...colaborador,
        active: colaborador.active === 'Activo',
        contractActive: colaborador.contractActive === 'Activo'
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

// Crear un nuevo colaborador (incluye crear un contrato y opcionalmente un usuario)
const createColaborador = async (colaboradorData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // 1. Crear contrato
    const [contratoResult] = await connection.execute(
      'INSERT INTO CONTRATO (fechaInicio, fechaFin, estado, idTipoContrato) VALUES (?, ?, ?, ?)',
      [
        colaboradorData.startDate, 
        colaboradorData.endDate, 
        colaboradorData.contractActive ? 'Activo' : 'Inactivo',
        colaboradorData.contractTypeId
      ]
    );
    const contratoId = contratoResult.insertId;
    // 2. Crear colaborador
    const [colaboradorResult] = await connection.execute(
      'INSERT INTO COLABORADOR (nombreColaborador, apePaColaborador, apeMaColaborador, fechaNacimiento, direccion, telefono, dniColaborador, estado, idTipoColaborador, idContrato, idArea) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        colaboradorData.nombres,
        colaboradorData.apePat,
        colaboradorData.apeMat,
        colaboradorData.birthDate,
        colaboradorData.address,
        colaboradorData.phone,
        colaboradorData.dni,
        colaboradorData.active ? 'Activo' : 'Inactivo',
        colaboradorData.roleId,
        contratoId,
        colaboradorData.areaId || null
      ]
    );
    const colaboradorId = colaboradorResult.insertId;
    let usuarioId = null;
    // 3. Si vienen datos de usuario, crear usuario asociado
    if (colaboradorData.user) {
      const user = colaboradorData.user;
      // Validar que no exista el correo
      const [existing] = await connection.execute('SELECT idUsuario FROM USUARIO WHERE correo = ?', [user.email]);
      if (existing.length > 0) {
        throw new Error('El correo ya está registrado');
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      const [usuarioResult] = await connection.execute(
        'INSERT INTO USUARIO (correo, contrasena, estado, idTipoUsuario, idColaborador, idArea) VALUES (?, ?, ?, ?, ?, ?)',
        [
          user.email,
          hashedPassword,
          user.active ? 'Activo' : 'Inactivo',
          user.roleId,
          colaboradorId,
          user.areaId || null
        ]
      );
      usuarioId = usuarioResult.insertId;
    }
    await connection.commit();
    return {
      success: true,
      colaboradorId,
      contratoId,
      usuarioId,
      message: 'Colaborador y usuario creados exitosamente'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear colaborador y usuario:', error);
    return { success: false, message: error.message || 'Error al crear el colaborador y usuario' };
  } finally {
    connection.release();
  }
};

// Actualizar colaborador y usuario
const updateColaborador = async (colaboradorId, colaboradorData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Obtener contrato y usuario
    const [colaborador] = await connection.execute(
      'SELECT idContrato FROM COLABORADOR WHERE idColaborador = ?',
      [colaboradorId]
    );
    if (colaborador.length === 0) {
      throw new Error('Colaborador no encontrado');
    }
    const contratoId = colaborador[0].idContrato;
    // Actualizar contrato
    await connection.execute(
      'UPDATE CONTRATO SET fechaInicio = ?, fechaFin = ?, estado = ?, idTipoContrato = ? WHERE idContrato = ?',
      [
        colaboradorData.startDate, 
        colaboradorData.endDate, 
        colaboradorData.contractActive ? 'Activo' : 'Inactivo',
        colaboradorData.contractTypeId,
        contratoId
      ]
    );
    // Actualizar colaborador
    await connection.execute(
      'UPDATE COLABORADOR SET nombreColaborador = ?, apePaColaborador = ?, apeMaColaborador = ?, fechaNacimiento = ?, direccion = ?, telefono = ?, dniColaborador = ?, estado = ?, idTipoColaborador = ?, idArea = ? WHERE idColaborador = ?',
      [
        colaboradorData.nombres,
        colaboradorData.apePat,
        colaboradorData.apeMat,
        colaboradorData.birthDate,
        colaboradorData.address,
        colaboradorData.phone,
        colaboradorData.dni,
        colaboradorData.active ? 'Activo' : 'Inactivo',
        colaboradorData.roleId,
        colaboradorData.areaId || null,
        colaboradorId
      ]
    );
    // Si vienen datos de usuario, actualizar usuario
    if (colaboradorData.user) {
      const user = colaboradorData.user;
      // Buscar usuario por idColaborador
      const [usuarios] = await connection.execute('SELECT idUsuario FROM USUARIO WHERE idColaborador = ?', [colaboradorId]);
      if (usuarios.length > 0) {
        // Actualizar usuario existente
        let updateFields = 'correo = ?, estado = ?, idTipoUsuario = ?, idArea = ?';
        let params = [user.email, user.active ? 'Activo' : 'Inactivo', user.roleId, user.areaId || null, usuarios[0].idUsuario];
        if (user.password) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(user.password, saltRounds);
          updateFields = 'correo = ?, contrasena = ?, estado = ?, idTipoUsuario = ?, idArea = ?';
          params = [user.email, hashedPassword, user.active ? 'Activo' : 'Inactivo', user.roleId, user.areaId || null, usuarios[0].idUsuario];
        }
        await connection.execute(
          `UPDATE USUARIO SET ${updateFields} WHERE idUsuario = ?`,
          params
        );
      } else {
        // Crear usuario si no existe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        await connection.execute(
          'INSERT INTO USUARIO (correo, contrasena, estado, idTipoUsuario, idColaborador, idArea) VALUES (?, ?, ?, ?, ?, ?)',
          [user.email, hashedPassword, user.active ? 'Activo' : 'Inactivo', user.roleId, colaboradorId, user.areaId || null]
        );
      }
    }
    await connection.commit();
    return { success: true, message: 'Colaborador y usuario actualizados exitosamente' };
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar colaborador y usuario:', error);
    return { success: false, message: error.message || 'Error al actualizar el colaborador y usuario' };
  } finally {
    connection.release();
  }
};

// Eliminar colaborador y usuario
const deleteColaborador = async (colaboradorId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Buscar usuario asociado
    await connection.execute('DELETE FROM USUARIO WHERE idColaborador = ?', [colaboradorId]);
    // Obtener el ID del contrato del colaborador
    const [colaborador] = await connection.execute(
      'SELECT idContrato FROM COLABORADOR WHERE idColaborador = ?',
      [colaboradorId]
    );
    if (colaborador.length === 0) {
      throw new Error('Colaborador no encontrado');
    }
    const contratoId = colaborador[0].idContrato;
    // Eliminar colaborador
    await connection.execute('DELETE FROM COLABORADOR WHERE idColaborador = ?', [colaboradorId]);
    // Eliminar contrato
    await connection.execute('DELETE FROM CONTRATO WHERE idContrato = ?', [contratoId]);
    await connection.commit();
    return { success: true, message: 'Colaborador, usuario y contrato eliminados exitosamente' };
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar colaborador, usuario y contrato:', error);
    return { success: false, message: error.message || 'Error al eliminar colaborador, usuario y contrato' };
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
