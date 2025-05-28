
-- Crear tabla para códigos de recuperación de contraseña
USE EvaluacionDesempeno;

-- Eliminar tabla si existe para recrearla con la estructura correcta
DROP TABLE IF EXISTS PASSWORD_RESET_CODES;

-- Crear tabla con todas las columnas necesarias
CREATE TABLE PASSWORD_RESET_CODES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expiration DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_code (code),
    INDEX idx_token (token),
    INDEX idx_expiration (expiration)
);

-- Verificar que la tabla se creó correctamente
DESCRIBE PASSWORD_RESET_CODES;
