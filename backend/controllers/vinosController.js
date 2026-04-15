const pool = require('../config/db');

const registrarEventoBitacora = async ({
    vinoId,
    nombreVino,
    tipoMovimiento,
    cantidad = 0,
    usuario
}) => {
    await pool.query(
        `INSERT INTO bitacora (vino_id, nombre_vino, tipo_movimiento, cantidad, usuario)
         VALUES ($1, $2, $3, $4, $5)`,
        [vinoId, nombreVino, tipoMovimiento, cantidad, usuario]
    );
};

// READ: Obtener todos los vinos activos
const obtenerVinos = async (req, res) => {
    try {
        const vinos = await pool.query("SELECT * FROM vinos WHERE estado = 'Activo'");
        res.json(vinos.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los vinos' });
    }
};

// CREATE: Registrar un nuevo vino
const crearVino = async (req, res) => {
    const { nombre, bodega, pais, cepa, anada, precio_venta, stock_actual } = req.body;
    try {
        if (!nombre || !bodega || precio_venta === undefined || stock_actual === undefined) {
            return res.status(400).json({ mensaje: 'Nombre, bodega, precio de venta y stock son obligatorios.' });
        }

        const configuracion = await pool.query(
            'SELECT stock_minimo_default FROM configuracion_sistema WHERE id = 1'
        );

        const stockMinimoDefault = configuracion.rows[0]?.stock_minimo_default ?? 5;

        const nuevoVino = await pool.query(
            `INSERT INTO vinos (nombre, bodega, pais, cepa, anada, precio_venta, stock_actual, stock_minimo) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [nombre, bodega, pais, cepa, anada, precio_venta, stock_actual, stockMinimoDefault]
        );

        await registrarEventoBitacora({
            vinoId: nuevoVino.rows[0].id,
            nombreVino: nuevoVino.rows[0].nombre,
            tipoMovimiento: 'Alta',
            cantidad: Number(stock_actual) || 0,
            usuario: req.usuario?.nombre || 'Sistema'
        });

        res.status(201).json({ mensaje: 'Vino registrado', vino: nuevoVino.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar el vino' });
    }
};

// UPDATE: Editar un vino existente
const actualizarVino = async (req, res) => {
    const { id } = req.params;
    const { nombre, bodega, pais, cepa, anada, precio_venta, stock_actual } = req.body;
    try {
        if (req.usuario.rol === 'Mesero') {
            const vinoActualizado = await pool.query(
                `UPDATE vinos
                 SET stock_actual = $1
                 WHERE id = $2 AND estado = 'Activo'
                 RETURNING *`,
                [stock_actual, id]
            );

            if (vinoActualizado.rows.length === 0) {
                return res.status(404).json({ mensaje: 'Vino no encontrado' });
            }

            return res.json({ mensaje: 'Stock actualizado', vino: vinoActualizado.rows[0] });
        }

        if (!nombre || !bodega || precio_venta === undefined || stock_actual === undefined) {
            return res.status(400).json({ mensaje: 'Nombre, bodega, precio de venta y stock son obligatorios.' });
        }

        const vinoActualizado = await pool.query(
            `UPDATE vinos
             SET nombre = $1,
                 bodega = $2,
                 pais = $3,
                 cepa = $4,
                 anada = $5,
                 precio_venta = $6,
                 stock_actual = $7
             WHERE id = $8
             RETURNING *`,
            [nombre, bodega, pais, cepa, anada, precio_venta, stock_actual, id]
        );
        
        if (vinoActualizado.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Vino no encontrado' });
        }

        await registrarEventoBitacora({
            vinoId: vinoActualizado.rows[0].id,
            nombreVino: vinoActualizado.rows[0].nombre,
            tipoMovimiento: 'Edicion',
            cantidad: Number(stock_actual) || 0,
            usuario: req.usuario?.nombre || 'Sistema'
        });

        res.json({ mensaje: 'Vino actualizado', vino: vinoActualizado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el vino' });
    }
};

// DELETE: Dar de baja un vino (Borrado lógico)
const eliminarVino = async (req, res) => {
    const { id } = req.params;
    try {
        const vinoEliminado = await pool.query(
            "UPDATE vinos SET estado = 'Inactivo' WHERE id = $1 RETURNING *",
            [id]
        );

        if (vinoEliminado.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Vino no encontrado' });
        }

        await registrarEventoBitacora({
            vinoId: vinoEliminado.rows[0].id,
            nombreVino: vinoEliminado.rows[0].nombre,
            tipoMovimiento: 'Baja',
            cantidad: 0,
            usuario: req.usuario?.nombre || 'Sistema'
        });

        res.json({ mensaje: 'Vino dado de baja (archivado)' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el vino' });
    }
};

module.exports = { obtenerVinos, crearVino, actualizarVino, eliminarVino };
