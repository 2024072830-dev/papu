const pool = require('../config/db');

const construirClausulasFiltro = (query) => {
    const condiciones = [];
    const valores = [];

    if (query.fecha_desde) {
        valores.push(query.fecha_desde);
        condiciones.push(`fecha >= $${valores.length}`);
    }

    if (query.fecha_hasta) {
        valores.push(query.fecha_hasta);
        condiciones.push(`fecha < ($${valores.length}::date + INTERVAL '1 day')`);
    }

    if (query.usuario) {
        valores.push(`%${query.usuario.trim()}%`);
        condiciones.push(`usuario ILIKE $${valores.length}`);
    }

    if (query.tipo_movimiento) {
        valores.push(query.tipo_movimiento.trim());
        condiciones.push(`tipo_movimiento = $${valores.length}`);
    }

    if (query.motivo) {
        valores.push(query.motivo.trim());
        condiciones.push(`COALESCE(motivo, '') = $${valores.length}`);
    }

    if (query.nombre_vino) {
        valores.push(`%${query.nombre_vino.trim()}%`);
        condiciones.push(`nombre_vino ILIKE $${valores.length}`);
    }

    return { condiciones, valores };
};

// Obtener todo el historial
const obtenerBitacora = async (req, res) => {
    try {
        const { condiciones, valores } = construirClausulasFiltro(req.query);
        const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

        const logs = await pool.query(
            `SELECT *
             FROM bitacora
             ${whereClause}
             ORDER BY fecha DESC, id DESC`,
            valores
        );

        res.json(logs.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener la bitácora' });
    }
};

// Registrar un nuevo movimiento
const registrarLog = async (req, res) => {
    const { vino_id, nombre_vino, tipo_movimiento, cantidad, motivo } = req.body;
    try {
        const usuarioResponsable = req.usuario?.nombre || req.body.usuario || 'Sistema';

        await pool.query(
            `INSERT INTO bitacora (vino_id, nombre_vino, tipo_movimiento, cantidad, usuario, motivo)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [vino_id, nombre_vino, tipo_movimiento, cantidad, usuarioResponsable, motivo || null]
        );
        res.status(201).json({ mensaje: 'Movimiento registrado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar en bitácora' });
    }
};

module.exports = { obtenerBitacora, registrarLog };
