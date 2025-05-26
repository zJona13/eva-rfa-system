
-- Crear tabla para tokens personalizados de usuario
CREATE TABLE IF NOT EXISTS USER_TOKENS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiration DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(idUsuario) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (idUsuario),
    INDEX idx_expiration (expiration)
);

-- Limpiar tokens expirados (opcional para ejecutar periódicamente)
-- DELETE FROM USER_TOKENS WHERE expiration < NOW();
