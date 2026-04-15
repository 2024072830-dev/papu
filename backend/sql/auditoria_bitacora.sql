CREATE INDEX IF NOT EXISTS idx_bitacora_fecha
ON bitacora (fecha);

CREATE INDEX IF NOT EXISTS idx_bitacora_usuario
ON bitacora (usuario);

CREATE INDEX IF NOT EXISTS idx_bitacora_tipo_movimiento
ON bitacora (tipo_movimiento);
