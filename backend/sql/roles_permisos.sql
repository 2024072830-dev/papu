-- Compatible con tu tabla actual de usuarios en PostgreSQL / pgAdmin4
-- Roles válidos existentes: Administrador, Sommelier, Mesero

-- 1. Verifica o corrige roles fuera del catálogo permitido
UPDATE usuarios
SET rol = 'Mesero'
WHERE rol IS NULL
   OR rol NOT IN ('Administrador', 'Sommelier', 'Mesero');

-- 2. Si aún no tienes la restricción CHECK correcta, puedes recrearla manualmente:
-- ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
-- ALTER TABLE usuarios
-- ADD CONSTRAINT usuarios_rol_check
-- CHECK (rol IN ('Administrador', 'Sommelier', 'Mesero'));

-- 3. Índice opcional para acelerar filtros por rol
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios (rol);

-- 4. Si quieres agregar activación/desactivación de usuarios más adelante:
-- ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

-- 5. Ejemplos de actualización de rol
-- UPDATE usuarios SET rol = 'Administrador' WHERE email = 'johanan@lacostera.com';
-- UPDATE usuarios SET rol = 'Sommelier' WHERE email = 'sommelier@lacostera.com';
-- UPDATE usuarios SET rol = 'Mesero' WHERE email = 'mesero@lacostera.com';
