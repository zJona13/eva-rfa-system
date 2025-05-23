
CREATE DATABASE IF NOT EXISTS EvaluacionDesempeno;
USE EvaluacionDesempeno;

-- Tablas sin dependencias
CREATE TABLE TIPO_USUARIO (
    idTipoUsu INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE TIPO_COLABORADOR (
    idTipoColab INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE TIPO_CONTRATO (
    idTipoContrato INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE TIPO_REPORTE (
    idTipoReporte INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(255)
);
--analizarlo 

CREATE TABLE CRITERIOS (
    idCriterio INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150),
    descripcion VARCHAR(255),
    valor INT(10),
    vigencia TINYINT(3)
);

-- Tablas con dependencias
CREATE TABLE CONTRATO (
    idContrato INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fechaInicio DATE,
    fechaFin DATE,
    estado TINYINT(3),
    modalidad VARCHAR(150),
    idTipoContrato INT(10),
    FOREIGN KEY (idTipoContrato) REFERENCES TIPO_CONTRATO(idTipoContrato)
);

CREATE TABLE COLABORADOR (
    idColaborador INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
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

CREATE TABLE USUARIO (
    idUsuario INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(100),
    contrasena VARCHAR(100),
    vigencia TINYINT(3),
    idTipoUsu INT(10),
    idColaborador INT(10) UNIQUE, -- Relación 1 a 1 con COLABORADOR
    FOREIGN KEY (idTipoUsu) REFERENCES TIPO_USUARIO(idTipoUsu),
    FOREIGN KEY (idColaborador) REFERENCES COLABORADOR(idColaborador)
);

-- Evaluación
CREATE TABLE EVALUACION (
    idEvaluacion INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fechaEvaluacion DATE,
    horaEvaluacion TIME,
    puntaje INT(10),
    comentario VARCHAR(300),
    tipo VARCHAR(150),
    estado VARCHAR(50) DEFAULT 'pendiente' COMMENT 'Ej: pendiente, completada, requiere_validacion, validada',
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

-- Reportes
CREATE TABLE REPORTE (
    idReporte INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
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

-- Incidencias y Notificaciones
CREATE TABLE INCIDENCIA (
    idIncidencia INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fecha DATE,
    hora TIME,
    estado TINYINT(3),
    accionTomada VARCHAR(200),
    idUsuario INT(10),
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario)
);

CREATE TABLE NOTIFICACION (
    idNotificacion INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255),
    horaEnvio TIME,
    fechaEnvio DATE,
    idIncidencia INT(10),
    FOREIGN KEY (idIncidencia) REFERENCES INCIDENCIA(idIncidencia)
);

-- Datos iniciales
INSERT INTO TIPO_USUARIO (nombre) VALUES
('Administrador'), ('Docente'), ('Evaluador'), ('Estudiante');

-- Inserciones de usuarios (asegúrate de tener un colaborador creado si asignas idColaborador)
INSERT INTO USUARIO (nombre, correo, contrasena, vigencia, idTipoUsu) VALUES
('Jonatan Ching', 'jching@iesrfa.edu', 'tiadmin45', 1, 1),
('Roger Zavaleta', 'rzavaleta@iesrfa.edu', 'tiadmin45', 1, 1);

INSERT INTO TIPO_COLABORADOR (nombre) VALUES
('Jefe de TI'), ('Docente'), ('Jefe de Carrera de Mecanica de Produccion'), ('Director');

INSERT INTO COLABORADOR (
    nombres, apePat, apeMat, fechaNacimiento, direccion,
    telefono, dni, estado, idTipoColab, idContrato
)
VALUES ('Carlos', 'Ramirez', 'Lopez', '1985-07-12', 'Av. Libertad 123', '987654321', '12345678', 1, 2, 1);

INSERT INTO TIPO_CONTRATO (nombre) VALUES ('Tiempo Parcial'); 

INSERT INTO CONTRATO (fechaInicio, fechaFin, estado, modalidad, idTipoContrato) 
VALUES ('2024-03-01', '2025-02-28', 1, 'Servicios Profesionales', 1);