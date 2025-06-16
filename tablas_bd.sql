-- CREAR BASE DE DATOS

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
    idUsuarioReportador INT NOT NULL,
    idUsuarioAfectado INT NOT NULL,
    FOREIGN KEY (idUsuarioReportador) REFERENCES USUARIO(idUsuario),
    FOREIGN KEY (idUsuarioAfectado) REFERENCES USUARIO(idUsuario)
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

ALTER TABLE ESTUDIANTE 
ADD COLUMN nombreEstudiante VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN apePaEstudiante VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN apeMaEstudiante VARCHAR(100) NOT NULL DEFAULT '';

-- ÍNDICES recomendados

CREATE INDEX idx_usuario_correo ON USUARIO(correo);
CREATE INDEX idx_colaborador_dni ON COLABORADOR(dniColaborador);
CREATE INDEX idx_incidencia_fecha ON INCIDENCIA(fecha);
CREATE INDEX idx_notificacion_leido_usuario ON NOTIFICACION(leido, idUsuario);

-- Datos iniciales
INSERT INTO TIPO_USUARIO (nombre) VALUES
('Administrador'), ('Evaluador'), ('Evaluado'), ('Estudiante');

INSERT INTO TIPO_COLABORADOR (nombre) VALUES
('Jefe de TI'), ('Docente'), ('Jefe'), ('Director');

INSERT INTO TIPO_CONTRATO (nombre) 
VALUES ('Tiempo Parcial'), ('Tiempo Completo'), ('Nombrado');

INSERT INTO TIPO_EVALUACION (nombre) VALUES
('Evaluación Estudiante al Docente'), ('Evaluación Evaluador al Docente'), ('Autoevaluación');

INSERT INTO AREA (nombre, descripcion) VALUES
('Administración de Empresas', 'Área encargada de la formación en administración y gestión empresarial'),
('Arquitectura de Plataformas y Servicios de Tecnologías de Información', 'Área especializada en arquitectura de sistemas y servicios tecnológicos'),
('Contabilidad', 'Área encargada de la formación en contabilidad y finanzas'),
('Electricidad Industrial', 'Área especializada en sistemas eléctricos industriales y automatización'),
('Electrónica Industrial', 'Área enfocada en electrónica aplicada a procesos industriales'),
('Enfermería Técnica', 'Área de formación en cuidados de salud y enfermería técnica'),
('Mecánica de Producción Industrial', 'Área especializada en procesos de manufactura y producción industrial');

INSERT INTO CONTRATO (fechaInicio, fechaFin, estado, idTipoContrato) VALUES
('2024-03-01', '2025-02-28', 'Activo', 2);

INSERT INTO COLABORADOR (nombreColaborador, apePaColaborador, apeMaColaborador, fechaNacimiento, direccion, telefono, dniColaborador, estado, idTipoColaborador, idContrato, idArea) 
VALUES ('Jonatan', 'Ching', 'Ayacila', '2003-05-13', 'Av. La Panamericana Norte', '912663649', '76091348', 'Activo', 1, 1, 1);

INSERT INTO USUARIO (correo, contrasena, estado, idTipoUsuario, idColaborador, idArea) 
VALUES ('jching@iesrfa.edu', '$2a$12$Iig8qm23xy.8L9E13yc8MOCG6QpOvfWfD/QxCQzVOKCyG1Ffg/zVG', 'Activo', 1, 1, 1);

INSERT INTO CRITERIO (nombre) VALUES
-- Criterios para Evaluación Estudiante al Docente
('ORGANIZACIÓN DE LA ASIGNATURA'),
('MATERIALES EDUCATIVOS'),
('DESARROLLO DE LAS CLASES Y ENSEÑANZA'),
('EVALUACIÓN Y RETROALIMENTACIÓN'),
-- Criterios adicionales para Evaluación Evaluador al Docente
('PROGRAMACIÓN'),
('DESARROLLO'),
('EVALUACIÓN'),
-- Criterios adicionales para Autoevaluación
('PLANIFICACIÓN Y PROGRAMACIÓN'),
('DESARROLLO DE LA SESIÓN Y METODOLOGÍA');

-- Relacionar criterios con tipos de evaluación
-- Evaluación Estudiante al Docente (idTipoEvaluacion = 1)
INSERT INTO TIPO_EVALUACION_CRITERIO (idTipoEvaluacion, idCriterio) VALUES
(1, 1), -- ORGANIZACIÓN DE LA ASIGNATURA
(1, 2), -- MATERIALES EDUCATIVOS
(1, 3), -- DESARROLLO DE LAS CLASES Y ENSEÑANZA
(1, 4); -- EVALUACIÓN Y RETROALIMENTACIÓN

-- Evaluación Evaluador al Docente (idTipoEvaluacion = 2)
INSERT INTO TIPO_EVALUACION_CRITERIO (idTipoEvaluacion, idCriterio) VALUES
(2, 5), -- PROGRAMACIÓN
(2, 2), -- MATERIALES EDUCATIVOS (reutilizado)
(2, 6), -- DESARROLLO
(2, 7); -- EVALUACIÓN

-- Autoevaluación (idTipoEvaluacion = 3)
INSERT INTO TIPO_EVALUACION_CRITERIO (idTipoEvaluacion, idCriterio) VALUES
(3, 8), -- PLANIFICACIÓN Y PROGRAMACIÓN
(3, 2), -- MATERIALES EDUCATIVOS (reutilizado)
(3, 9), -- DESARROLLO DE LA SESIÓN Y METODOLOGÍA
(3, 4); -- EVALUACIÓN Y RETROALIMENTACIÓN (reutilizado)

-- ========================================
-- INSERTAR SUBCRITERIOS
-- ========================================

-- SUBCRITERIOS PARA "ORGANIZACIÓN DE LA ASIGNATURA" (idCriterio = 1)
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('El profesor/a deja claro desde el inicio cómo se desarrollará la asignatura (sílabos, cronograma)', 1),
('Las clases siguen una estructura y planificación comprensible', 1);

-- SUBCRITERIOS PARA "MATERIALES EDUCATIVOS" (idCriterio = 2) - Versión Estudiante al Docente
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('Los materiales que usa el/la profesor/a (presentaciones, lecturas, etc.) me ayudan a entender los temas', 2),
('Los materiales son claros y están bien organizados en la plataforma del curso', 2),
('El profesor/a proporciona guías o instrucciones claras para las tareas o trabajos fuera de clase', 2);

-- SUBCRITERIOS PARA "DESARROLLO DE LAS CLASES Y ENSEÑANZA" (idCriterio = 3)
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('El/La profesor/a es puntual y aprovecha bien el tiempo de la clase', 3),
('El/La profesor/a explica los temas de forma que los entiendo', 3),
('El/La profesor/a utiliza ejemplos o actividades que facilitan mi aprendizaje', 3),
('El/La profesor/a fomenta mi participación en clase', 3),
('Se promueve el trabajo en equipo y la colaboración entre compañeros', 3),
('El/La profesor/a se expresa con claridad (voz, lenguaje)', 3),
('El/La profesor/a responde mis preguntas de manera clara y respetuosa', 3),
('El/La profesor/a muestra entusiasmo por los temas que enseña', 3),
('Siento un ambiente de respeto y confianza en sus clases', 3),
('El/La profesor/a me anima a pensar por mí mismo/a y a ser crítico/a', 3);

-- SUBCRITERIOS PARA "EVALUACIÓN Y RETROALIMENTACIÓN" (idCriterio = 4) - Versión Estudiante al Docente
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('Las evaluaciones (exámenes, trabajos) se relacionan con lo que se enseña en clase', 4),
('El/La profesor/a explica claramente cómo seremos evaluados', 4),
('Considero que la forma de evaluar del profesor/a es justa', 4),
('El/La profesor/a me da comentarios útiles (retroalimentación) sobre mis trabajos o mi desempeño', 4),
('El/La profesor/a entrega los resultados de las evaluaciones en un tiempo razonable', 4);

-- SUBCRITERIOS PARA "PROGRAMACIÓN" (idCriterio = 5)
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('El sílabo de la UD se encuentra actualizado y disponible en la plataforma virtual', 5),
('La sesión de aprendizaje desarrollada corresponde a lo programado en el sílabo y presenta su ficha', 5);

-- SUBCRITERIOS PARA "DESARROLLO" (idCriterio = 6) - Evaluación Evaluador al Docente
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('Inicia la sesión de aprendizaje con puntualidad y saluda a los alumnos', 6),
('Registra la asistencia de los estudiantes (según modalidad) en la plataforma o medio establecido', 6),
('Establece/recuerda orientaciones (netiquetas, normas de convivencia) para la participación', 6),
('Realiza una actividad de motivación eficaz para generar la atención de los estudiantes', 6),
('Declara el tema a desarrollar y el logro de aprendizaje esperado para la sesión', 6),
('Desarrolla el contenido utilizando metodologías activas y participativas', 6),
('Prioriza el trabajo colaborativo durante la sesión', 6),
('Emplea una voz clara, modulada y un lenguaje técnico apropiado', 6),
('Responde a las preguntas e inquietudes de los estudiantes de manera efectiva', 6),
('Fomenta el desarrollo de valores, actitudes positivas y la construcción de aprendizajes propios', 6);

-- SUBCRITERIOS PARA "EVALUACIÓN" (idCriterio = 7) - Evaluación Evaluador al Docente
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('La evaluación aplicada responde a los indicadores de logro de la sesión', 7),
('Utiliza instrumentos de evaluación variados y adecuados al objeto de evaluación', 7),
('Los criterios de evaluación son claros y comunicados previamente a los estudiantes', 7),
('Realiza la retroalimentación del proceso de aprendizaje de forma individual y/o grupal', 7),
('Comunica los resultados de la evaluación de manera oportuna y comprensible', 7);

-- SUBCRITERIOS PARA "PLANIFICACIÓN Y PROGRAMACIÓN" (idCriterio = 8)
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('Mantengo el sílabo actualizado y fácilmente accesible para los estudiantes', 8),
('Mis sesiones de aprendizaje se desarrollan conforme a lo planificado en el sílabo y cuento con la ficha de sesión', 8);

-- SUBCRITERIOS PARA "DESARROLLO DE LA SESIÓN Y METODOLOGÍA" (idCriterio = 9)
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('Inicio mis clases puntualmente y establezco un ambiente cordial', 9),
('Verifico la asistencia y las condiciones para la participación (normas, netiquetas)', 9),
('Capto el interés de los estudiantes mediante estrategias de motivación efectivas', 9),
('Comunico con claridad el tema y los objetivos de aprendizaje de la sesión', 9),
('Aplico metodologías activas que involucran al estudiante en su proceso de aprendizaje', 9),
('Promuevo el trabajo colaborativo y la interacción entre estudiantes', 9),
('Mi expresión oral es clara, con volumen y modulación adecuados, utilizando un lenguaje preciso', 9),
('Atiendo y resuelvo las dudas de los estudiantes de forma paciente y clara', 9),
('Fomento la reflexión, el pensamiento crítico y la construcción autónoma del conocimiento', 9),
('Integro el desarrollo de valores y actitudes positivas en mis sesiones', 9);

-- SUBCRITERIOS ADICIONALES PARA "MATERIALES EDUCATIVOS" - Versión Evaluador al Docente
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('Los materiales educativos son pertinentes a la sesión de aprendizaje (antes, durante y después)', 2),
('Los materiales educativos son visibles, claros y están organizados en la plataforma', 2),
('Los materiales para actividades posteriores (guías, instrucciones) son adecuados y promueven el aprendizaje', 2);

-- SUBCRITERIOS ADICIONALES PARA "MATERIALES EDUCATIVOS" - Versión Autoevaluación
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('Selecciono y diseño materiales educativos pertinentes para los diferentes momentos de la sesión', 2),
('Aseguro que los materiales sean claros, visualmente adecuados y estén bien organizados en la plataforma', 2),
('Los materiales para actividades asincróticas (guías, rúbricas) están bien estructurados y fomentan la autonomía', 2);

-- SUBCRITERIOS ADICIONALES PARA "EVALUACIÓN Y RETROALIMENTACIÓN" - Versión Autoevaluación
INSERT INTO SUB_CRITERIO (nombre, idCriterio) VALUES
('Diseño evaluaciones coherentes con los indicadores de logro propuestos', 4),
('Utilizo diversidad de instrumentos y técnicas de evaluación apropiados', 4),
('Doy a conocer los criterios de evaluación de forma anticipada y clara', 4),
('Ofrezco retroalimentación continua, específica y constructiva a los estudiantes', 4),
('Comunico los resultados de las evaluaciones en los plazos establecidos y de forma que faciliten la comprensión', 4);