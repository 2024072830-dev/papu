CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id INT PRIMARY KEY,
    nombre_restaurante VARCHAR(150) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'MXN',
    stock_minimo_default INT NOT NULL DEFAULT 5,
    dias_expiracion_recuperacion INT NOT NULL DEFAULT 1,
    permitir_registro_publico BOOLEAN NOT NULL DEFAULT FALSE,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO configuracion_sistema (
    id,
    nombre_restaurante,
    moneda,
    stock_minimo_default,
    dias_expiracion_recuperacion,
    permitir_registro_publico
)
VALUES (
    1,
    'La Costera 28',
    'MXN',
    5,
    1,
    FALSE
)
ON CONFLICT (id) DO NOTHING;
