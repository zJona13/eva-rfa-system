CREATE DATABASE IF NOT EXISTS EvaluacionDesempeno;
USE EvaluacionDesempeno;

-- TABLAS DE TIPO

CREATE TABLE TIPO_USUARIO (
    idTipoUsuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE TIPO_COLABORADOR (
    idTipoColaborador INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE TIPO_CONTRATO (
    idTipoContrato INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE TIPO_REPORTE (
    idTipoReporte INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE TIPO_EVALUACION (
    idTipoEvaluacion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL
);

CREATE TABLE CRITERIO (
    idCriterio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE TIPO_EVALUACION_CRITERIO (
    idTipoEvaluacionCriterio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idTipoEvaluacion INT NOT NULL,
    idCriterio INT NOT NULL,
    FOREIGN KEY (idTipoEvaluacion) REFERENCES TIPO_EVALUACION(idTipoEvaluacion),
    FOREIGN KEY (idCriterio) REFERENCES CRITERIO(idCriterio)
);

-- TABLAS PRINCIPALES

CREATE TABLE AREA (
    idArea INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE CONTRATO (
    idContrato INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fechaInicio DATE,
    fechaFin DATE,
    estado ENUM('Activo','Inactivo'),
    idTipoContrato INT NOT NULL,
    FOREIGN KEY (idTipoContrato) REFERENCES TIPO_CONTRATO(idTipoContrato)
);

CREATE TABLE COLABORADOR (
    idColaborador INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombreColaborador VARCHAR(100) NOT NULL,
    apePaColaborador VARCHAR(100) NOT NULL,
    apeMaColaborador VARCHAR(100) NOT NULL,
    fechaNacimiento DATE,
    direccion VARCHAR(255),
    telefono CHAR(9),
    dniColaborador CHAR(8) UNIQUE,
    estado ENUM('Activo','Inactivo'),
    idTipoColaborador INT NOT NULL,
    idContrato INT NOT NULL,
    idArea INT NOT NULL,
    FOREIGN KEY (idTipoColaborador) REFERENCES TIPO_COLABORADOR(idTipoColaborador),
    FOREIGN KEY (idContrato) REFERENCES CONTRATO(idContrato),
    FOREIGN KEY (idArea) REFERENCES AREA(idArea)
);

CREATE TABLE USUARIO (
    idUsuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(100) NOT NULL,
    estado ENUM('Activo','Inactivo'),
    idTipoUsuario INT NOT NULL,
    idColaborador INT,
    idArea INT NOT NULL,
    FOREIGN KEY (idTipoUsuario) REFERENCES TIPO_USUARIO(idTipoUsuario),
    FOREIGN KEY (idColaborador) REFERENCES COLABORADOR(idColaborador),
    FOREIGN KEY (idArea) REFERENCES AREA(idArea)
);

CREATE TABLE ASIGNACION (
    idAsignacion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    periodo INT NOT NULL,
    fechaInicio DATE NOT NULL,
    fechaFin DATE NOT NULL,
    horaInicio TIME NOT NULL,
    horaFin TIME NOT NULL,
    estado ENUM('Activo','Inactivo','Pendiente'),
    idArea INT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario),
    FOREIGN KEY (idArea) REFERENCES AREA(idArea)
);

CREATE TABLE EVALUACION (
    idEvaluacion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fechaEvaluacion DATE,
    horaEvaluacion TIME,
    puntajeTotal DECIMAL(5,2),
    comentario VARCHAR(500),
    estado ENUM('Activo','Inactivo','Pendiente', 'Cancelada'),
    idAsignacion INT NOT NULL,
    idEvaluador INT NOT NULL,
    idEvaluado INT NOT NULL,
    idTipoEvaluacion INT NOT NULL,
    FOREIGN KEY (idAsignacion) REFERENCES ASIGNACION(idAsignacion),
    FOREIGN KEY (idEvaluador) REFERENCES USUARIO(idUsuario),
    FOREIGN KEY (idEvaluado) REFERENCES USUARIO(idUsuario),
    FOREIGN KEY (idTipoEvaluacion) REFERENCES TIPO_EVALUACION(idTipoEvaluacion)
);

CREATE TABLE SUB_CRITERIO (
    idSubCriterio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    idCriterio INT NOT NULL,
    FOREIGN KEY (idCriterio) REFERENCES CRITERIO(idCriterio)
);

CREATE TABLE DETALLE_EVALUACION (
    idDetalleEvaluacion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    puntaje DECIMAL(5,2),
    idEvaluacion INT NOT NULL,
    idSubCriterio INT NOT NULL,
    FOREIGN KEY (idEvaluacion) REFERENCES EVALUACION(idEvaluacion),
    FOREIGN KEY (idSubCriterio) REFERENCES SUB_CRITERIO(idSubCriterio)
);

CREATE TABLE REPORTE (
    idReporte INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE,
    formato VARCHAR(100),
    periodo VARCHAR(100),
    idTipoReporte INT NOT NULL,
    idEvaluacion INT NOT NULL,
    idUsuario INT NOT NULL,
    FOREIGN KEY (idTipoReporte) REFERENCES TIPO_REPORTE(idTipoReporte),
    FOREIGN KEY (idEvaluacion) REFERENCES EVALUACION(idEvaluacion),
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario)
);

CREATE TABLE INCIDENCIA (
    idIncidencia INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado ENUM('Activo','Inactivo','Pendiente'),
    accionTomada VARCHAR(500),
    idUsuario INT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario)
);

CREATE TABLE NOTIFICACION (
    idNotificacion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    fechaEnvio DATE NOT NULL,
    horaEnvio TIME NOT NULL,
    leido ENUM('Activo','Inactivo') DEFAULT 'Activo',
    idUsuario INT NOT NULL,
    idIncidencia INT,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario),
    FOREIGN KEY (idIncidencia) REFERENCES INCIDENCIA(idIncidencia) ON DELETE SET NULL
);

CREATE TABLE ESTUDIANTE (
    idEstudiante INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    codigo VARCHAR(150) NOT NULL UNIQUE,
    sexo CHAR(1),
    semestre VARCHAR(100),
    idArea INT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario),
    FOREIGN KEY (idArea) REFERENCES AREA(idArea)
);

-- ÍNDICES recomendados

CREATE INDEX idx_usuario_correo ON USUARIO(correo);
CREATE INDEX idx_colaborador_dni ON COLABORADOR(dniColaborador);
CREATE INDEX idx_incidencia_fecha ON INCIDENCIA(fecha);
CREATE INDEX idx_notificacion_leido_usuario ON NOTIFICACION(leido, idUsuario);

-- Datos iniciales
INSERT INTO TIPO_USUARIO (nombre) VALUES
('Administrador'), ('Evaluador'), ('Evaluado'), ('Estudiante');

INSERT INTO TIPO_COLABORADOR (nombre) VALUES
('Jefe de TI'), ('Docente'), ('Jefe de Carrera de Mecanica de Produccion'), ('Director');

INSERT INTO TIPO_CONTRATO (nombre) 
VALUES ('Tiempo Parcial'), ('Tiempo Completo'), ('Nombrado');

INSERT INTO TIPO_EVALUACION (nombre) VALUES
('Evaluación Estudiante al Docente'), ('Evaluación Evaluador al Docente'), ('Autoevaluación');