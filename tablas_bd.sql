CREATE DATABASE IF NOT EXISTS EvaluacionDesempeno;
USE EvaluacionDesempeno;

-- Tablas sin dependencias
CREATE TABLE TIPO_USUARIO (
    idTipoUsu INT(10) PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE TIPO_COLABORADOR (
    idTipoColab INT(10) PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE TIPO_CONTRATO (
    idTipoContrato INT(10) PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE TIPO_REPORTE (
    idTipoReporte INT(10) PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(255)
);

CREATE TABLE CRITERIOS (
    idCriterio INT(10) PRIMARY KEY,
    nombre VARCHAR(150),
    descripcion VARCHAR(255),
    valor INT(10),
    vigencia TINYINT(3)
);

-- Tablas con dependencias a las anteriores
CREATE TABLE USUARIO (
    idUsuario INT(10) PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(100),
    contrasena VARCHAR(100),
    vigencia TINYINT(3),
    idTipoUsu INT(10),
    FOREIGN KEY (idTipoUsu) REFERENCES TIPO_USUARIO(idTipoUsu)
);

CREATE TABLE CONTRATO (
    idContrato INT(10) PRIMARY KEY,
    fechaInicio DATE,
    fechaFin DATE,
    estado TINYINT(3),
    modalidad VARCHAR(150),
    idTipoContrato INT(10),
    FOREIGN KEY (idTipoContrato) REFERENCES TIPO_CONTRATO(idTipoContrato)
);

CREATE TABLE COLABORADOR (
    idColaborador INT(10) PRIMARY KEY,
    nombres VARCHAR(100),
    apePat VARCHAR(100),
    apeMat VARCHAR(100),
    fechaNacimiento DATE,
    direccion VARCHAR(255),
    telefono CHAR(9),
    dni CHAR(8),
    estado TINYINT(3),
    idTipoColab INT(10),
    idContrato INT(10),
    FOREIGN KEY (idTipoColab) REFERENCES TIPO_COLABORADOR(idTipoColab),
    FOREIGN KEY (idContrato) REFERENCES CONTRATO(idContrato)
);

-- Tablas con dependencias a USUARIO y COLABORADOR
CREATE TABLE EVALUACION (
    idEvaluacion INT(10) PRIMARY KEY,
    fechaEvaluacion DATE,
    horaEvaluacion TIME,
    puntaje INT(10),
    comentario VARCHAR(300),
    tipo VARCHAR(150),
    idUsuario INT(10),
    idColaborador INT(10),
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario),
    FOREIGN KEY (idColaborador) REFERENCES COLABORADOR(idColaborador)
);

CREATE TABLE EVALUACION_CRITERIO (
    idEvaluacion INT(10),
    idCriterio INT(10),
    descripcion VARCHAR(255),
    puntaje INT(10),
    PRIMARY KEY (idEvaluacion, idCriterio),
    FOREIGN KEY (idEvaluacion) REFERENCES EVALUACION(idEvaluacion),
    FOREIGN KEY (idCriterio) REFERENCES CRITERIOS(idCriterio)
);

-- Tablas con dependencia de EVALUACION, USUARIO, TIPO_REPORTE
CREATE TABLE REPORTE (
    idReporte INT(10) PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(255),
    fecha DATE,
    formato VARCHAR(100),
    periodo VARCHAR(100),
    idTipoReporte INT(10),
    idEvaluacion INT(10),
    idUsuario INT(10),
    FOREIGN KEY (idTipoReporte) REFERENCES TIPO_REPORTE(idTipoReporte),
    FOREIGN KEY (idEvaluacion) REFERENCES EVALUACION(idEvaluacion),
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario)
);

-- Tablas con dependencia de USUARIO
CREATE TABLE INCIDENCIA (
    idIncidencia INT(10) PRIMARY KEY,
    fecha DATE,
    hora TIME,
    estado TINYINT(3),
    accionTomada VARCHAR(200),
    idUsuario INT(10),
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario)
);

-- Tablas con dependencia de INCIDENCIA
CREATE TABLE NOTIFICACION (
    idNotificacion INT(10) PRIMARY KEY,
    descripcion VARCHAR(255),
    horaEnvio TIME,
    fechaEnvio DATE,
    idIncidencia INT(10),
    FOREIGN KEY (idIncidencia) REFERENCES INCIDENCIA(idIncidencia)
);

ALTER TABLE TIPO_USUARIO MODIFY idTipoUsu INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE USUARIO MODIFY idUsuario INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE CRITERIOS MODIFY idCriterio INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE EVALUACION MODIFY idEvaluacion INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE TIPO_COLABORADOR MODIFY idTipoColab INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE TIPO_CONTRATO MODIFY idTipoContrato INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE CONTRATO MODIFY idContrato INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE COLABORADOR MODIFY idColaborador INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE TIPO_REPORTE MODIFY idTipoReporte INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE REPORTE MODIFY idReporte INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE INCIDENCIA MODIFY idIncidencia INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE NOTIFICACION MODIFY idNotificacion INT(10) NOT NULL AUTO_INCREMENT;
ALTER TABLE EVALUACION ADD COLUMN estado VARCHAR(50) DEFAULT 'pendiente' COMMENT 'Ej: pendiente, completada, requiere_validacion, validada';

INSERT INTO TIPO_USUARIO (nombre) VALUES
('Administrador'),
('Docente'),
('Evaluador'),
('Estudiante'),
('Developer');

INSERT INTO USUARIO (nombre, correo, contrasena, vigencia, idTipoUsu) VALUES
('Jonatan Ching', 'jching@iesrfa.edu', 'tiadmin45', 1, 5);
('Roger Zavaleta', 'rzavaleta@iesrfa.edu', 'tiadmin45', 1, 5);