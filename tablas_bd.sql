
CREATE DATABASE IF NOT EXISTS EvaluacionDesempeno;
USE EvaluacionDesempeno;

CREATE TABLE TIPO_USUARIO (
    idTipoUsu INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE TIPO_COLABORADOR (
    idTipoColab INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE TIPO_CONTRATO (
    idTipoContrato INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE TIPO_REPORTE (
    idTipoReporte INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE CRITERIOS (
    idCriterio INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    puntaje DECIMAL(5,2),
    vigencia TINYINT(3)
);

CREATE TABLE SUBCRITERIOS (
    idSubCriterio INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    texto TEXT NOT NULL,
    vigencia TINYINT(3),
    puntaje DECIMAL(5,2),
    idCriterio INT(10) NOT NULL,
    FOREIGN KEY (idCriterio) REFERENCES CRITERIOS(idCriterio)
);

CREATE TABLE CONTRATO (
    idContrato INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fechaInicio DATE,
    fechaFin DATE,
    estado TINYINT(3),
    idTipoContrato INT(10) NOT NULL,
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
    idColaborador INT(10) UNIQUE,
    FOREIGN KEY (idTipoUsu) REFERENCES TIPO_USUARIO(idTipoUsu),
    FOREIGN KEY (idColaborador) REFERENCES COLABORADOR(idColaborador)
);

CREATE TABLE EVALUACION (
    idEvaluacion INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fechaEvaluacion DATE,
    horaEvaluacion TIME,
    puntaje DECIMAL(5,2),
    comentario TEXT,
    tipo VARCHAR(150),
    estado VARCHAR(50) DEFAULT 'Pendiente',
    idUsuario INT(10) NOT NULL,
    idColaborador INT(10) NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario),
    FOREIGN KEY (idColaborador) REFERENCES COLABORADOR(idColaborador)
);

CREATE TABLE EVALUACION_CRITERIO (
    idEvaCriterio INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idEvaluacion INT(10) NOT NULL,
    idCriterio INT(10) NOT NULL,
    descripcion TEXT,
    puntaje DECIMAL(5,2),
    FOREIGN KEY (idEvaluacion) REFERENCES EVALUACION(idEvaluacion),
    FOREIGN KEY (idCriterio) REFERENCES CRITERIOS(idCriterio),
    UNIQUE KEY UQ_Evaluacion_Criterio (idEvaluacion, idCriterio)
);

CREATE TABLE EVALUACION_SUBCRITERIOS (
    idEvaSubCriterio INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idEvaluacion INT(10) NOT NULL,
    idSubCriterio INT(10) NOT NULL,
    puntajeObtenido DECIMAL(5, 2) NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (idEvaluacion) REFERENCES EVALUACION(idEvaluacion),
    FOREIGN KEY (idSubCriterio) REFERENCES SUBCRITERIOS(idSubCriterio),
    UNIQUE KEY UQ_Evaluacion_SubCriterio (idEvaluacion, idSubCriterio)
);

CREATE TABLE REPORTE (
    idReporte INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE,
    formato VARCHAR(100),
    periodo VARCHAR(100),
    idTipoReporte INT(10) NOT NULL,
    idEvaluacion INT(10) NOT NULL,
    idUsuario INT(10) NOT NULL,
    FOREIGN KEY (idTipoReporte) REFERENCES TIPO_REPORTE(idTipoReporte),
    FOREIGN KEY (idEvaluacion) REFERENCES EVALUACION(idEvaluacion),
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario)
);

CREATE TABLE INCIDENCIA (
    idIncidencia INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fecha DATE,
    hora TIME,
    estado VARCHAR(50),
    accionTomada TEXT,
    idUsuario INT(10) NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario)
);

CREATE TABLE NOTIFICACION (
    idNotificacion INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    horaEnvio TIME,
    fechaEnvio DATE,
    idIncidencia INT(10) NOT NULL,
    FOREIGN KEY (idIncidencia) REFERENCES INCIDENCIA(idIncidencia)
);

-- Datos iniciales
INSERT INTO TIPO_USUARIO (nombre) VALUES
('Administrador'), ('Docente'), ('Evaluador'), ('Estudiante');

-- Inserciones de usuarios (asegúrate de tener un colaborador creado si asignas idColaborador)
INSERT INTO USUARIO (nombre, correo, contrasena, vigencia, idTipoUsu) VALUES
('Jonatan Ching', 'jching@iesrfa.edu', '123456', 1, 1),
('Roger Zavaleta', 'rzavaleta@iesrfa.edu', '123456', 1, 1);

INSERT INTO TIPO_COLABORADOR (nombre) VALUES
('Jefe de TI'), ('Docente'), ('Jefe de Carrera de Mecanica de Produccion'), ('Director');

INSERT INTO COLABORADOR (
    nombres, apePat, apeMat, fechaNacimiento, direccion,
    telefono, dni, estado, idTipoColab, idContrato
)
VALUES ('Carlos', 'Ramirez', 'Lopez', '1985-07-12', 'Av. Libertad 123', '987654321', '12345678', 1, 2, 1);

INSERT INTO TIPO_CONTRATO (nombre) VALUES ('Tiempo Parcial'); 

INSERT INTO CONTRATO (fechaInicio, fechaFin, estado, idTipoContrato) 
VALUES ('2024-03-01', '2025-02-28', 1, 1);