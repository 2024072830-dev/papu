ALTER TABLE bitacora
ADD COLUMN IF NOT EXISTS motivo VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_bitacora_motivo
ON bitacora (motivo);

-- Opcional: normaliza salidas históricas sin motivo para contarlas como ventas.
UPDATE bitacora
SET motivo = 'Venta'
WHERE tipo_movimiento = 'Salida (-)'
  AND (motivo IS NULL OR motivo = '');
