
const { pool } = require('./dbConnection.cjs');

const createPasswordResetTable = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS PASSWORD_RESET_CODES (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        reset_token VARCHAR(255) NOT NULL UNIQUE,
        expiration DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_code (code),
        INDEX idx_reset_token (reset_token),
        INDEX idx_expiration (expiration)
      )
    `);
    console.log('✅ Tabla PASSWORD_RESET_CODES verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla PASSWORD_RESET_CODES:', error);
  }
};

module.exports = { createPasswordResetTable };
