
CREATE DATABASE IF NOT EXISTS EvaluacionDesempeno;
USE EvaluacionDesempeno;

-- Tablas Base
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

CREATE TABLE AREA (
    idArea INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE CONTRATO (
    idContrato INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fechaInicio DATE,
    fechaFin DATE,
    estado TINYINT(3),
    idTipoContrato INT(10) NOT NULL,
    FOREIGN KEY (idTipoContrato) REFERENCES TIPO_CONTRATO(idTipoContrato) ON DELETE CASCADE
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
    FOREIGN KEY (idTipoColab) REFERENCES TIPO_COLABORADOR(idTipoColab) ON DELETE CASCADE,
    FOREIGN KEY (idContrato) REFERENCES CONTRATO(idContrato) ON DELETE CASCADE
);

CREATE TABLE USUARIO (
    idUsuario INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(100),
    contrasena VARCHAR(100),
    vigencia TINYINT(3),
    idTipoUsu INT(10),
    idColaborador INT(10) UNIQUE,
    idArea INT(10),
    FOREIGN KEY (idArea) REFERENCES AREA(idArea) ON DELETE CASCADE,
    FOREIGN KEY (idTipoUsu) REFERENCES TIPO_USUARIO(idTipoUsu) ON DELETE CASCADE,
    FOREIGN KEY (idColaborador) REFERENCES COLABORADOR(idColaborador) ON DELETE CASCADE
);

-- Nueva tabla ASIGNACION según el diagrama
CREATE TABLE ASIGNACION (
    idAsignacion INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT(10) NOT NULL,
    periodo INT(10) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'Activa',
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE
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
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE,
    FOREIGN KEY (idColaborador) REFERENCES COLABORADOR(idColaborador) ON DELETE CASCADE
);

-- Nueva tabla DETALLE_ASIGNACION según el diagrama
CREATE TABLE DETALLE_ASIGNACION (
    idEvaluacion INT(10) NOT NULL,
    idAsignacion INT(10) NOT NULL,
    PRIMARY KEY (idEvaluacion, idAsignacion),
    FOREIGN KEY (idEvaluacion) REFERENCES EVALUACION(idEvaluacion) ON DELETE CASCADE,
    FOREIGN KEY (idAsignacion) REFERENCES ASIGNACION(idAsignacion) ON DELETE CASCADE
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
    FOREIGN KEY (idTipoReporte) REFERENCES TIPO_REPORTE(idTipoReporte) ON DELETE CASCADE,
    FOREIGN KEY (idEvaluacion) REFERENCES EVALUACION(idEvaluacion) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE
);

CREATE TABLE INCIDENCIA (
    idIncidencia INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fechaIncidencia DATE NOT NULL,
    horaIncidencia TIME NOT NULL,
    descripcion TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(50),
    accionTomada TEXT,
    idUsuarioReportador INT(10) NOT NULL,
    idUsuarioAfectado INT(10) NOT NULL,
    FOREIGN KEY (idUsuarioReportador) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE,
    FOREIGN KEY (idUsuarioAfectado) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE
);

CREATE TABLE NOTIFICACION (
    idNotificacion INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    mensaje TEXT NOT NULL,
    fechaNotificacion DATE NOT NULL,
    horaNotificacion TIME NOT NULL,
    leido TINYINT(1) DEFAULT 0,
    idUsuario INT(10) NOT NULL,
    idIncidencia INT(10),
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE,
    FOREIGN KEY (idIncidencia) REFERENCES INCIDENCIA(idIncidencia) ON DELETE SET NULL
);

-- Datos iniciales
INSERT INTO TIPO_USUARIO (nombre) VALUES
('Administrador'), ('Evaluador'), ('Evaluado'), ('Estudiante');

INSERT INTO USUARIO (nombre, correo, contrasena, vigencia, idTipoUsu) VALUES
('Jonatan Ching', 'jching@iesrfa.edu', '$2a$12$3A43qP2ATfM0EyRL86FQfejJkqfW7WTpv9Xj9z0vM4mYKvMgDspuK', 1, 1),
('Roger Zavaleta', 'rzavaleta@iesrfa.edu', '$2a$12$3A43qP2ATfM0EyRL86FQfejJkqfW7WTpv9Xj9z0vM4mYKvMgDspuK', 1, 1);

INSERT INTO TIPO_COLABORADOR (nombre) VALUES
('Jefe de TI'), ('Docente'), ('Jefe de Carrera de Mecanica de Produccion'), ('Director');

INSERT INTO TIPO_CONTRATO (nombre) 
VALUES ('Tiempo Parcial'), ('Tiempo Completo'), ('Nombrado');

INSERT INTO NOTIFICACION (mensaje, fechaNotificacion, horaNotificacion, leido, idUsuario) VALUES
('Bienvenido al sistema de evaluación', CURDATE(), CURTIME(), 0, 1),
('Nueva evaluación asignada', CURDATE(), CURTIME(), 0, 2);
