CREATE TABLE IF NOT EXISTS recuperacion_password (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expira_en TIMESTAMP NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recuperacion_password_usuario
ON recuperacion_password (usuario_id);

CREATE INDEX IF NOT EXISTS idx_recuperacion_password_expira
ON recuperacion_password (expira_en);
