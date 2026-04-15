const pool = require('../config/db');

const CONFIG_ID = 1;

const obtenerConfiguracion = async (req, res) => {
    try {
        const configuracion = await pool.query(
            `SELECT
                id,
                nombre_restaurante,
                moneda,
                stock_minimo_default,
                dias_expiracion_recuperacion,
                permitir_registro_publico,
                ultima_actualizacion
             FROM configuracion_sistema
             WHERE id = $1`,
            [CONFIG_ID]
        );

        if (configuracion.rows.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró la configuración del sistema.' });
        }

        res.json(configuracion.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener la configuración del sistema.' });
    }
};

const actualizarConfiguracion = async (req, res) => {
    const {
        nombre_restaurante,
        moneda,
        stock_minimo_default,
        dias_expiracion_recuperacion,
        permitir_registro_publico
    } = req.body;

    try {
        if (!nombre_restaurante || !moneda) {
            return res.status(400).json({ mensaje: 'Nombre del restaurante y moneda son obligatorios.' });
        }

        if (Number(stock_minimo_default) < 0 || Number(dias_expiracion_recuperacion) < 1) {
            return res.status(400).json({ mensaje: 'Los parámetros numéricos tienen valores inválidos.' });
        }

        const configuracionActualizada = await pool.query(
            `UPDATE configuracion_sistema
             SET nombre_restaurante = $1,
                 moneda = $2,
                 stock_minimo_default = $3,
                 dias_expiracion_recuperacion = $4,
                 permitir_registro_publico = $5,
                 ultima_actualizacion = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING
                id,
                nombre_restaurante,
                moneda,
                stock_minimo_default,
                dias_expiracion_recuperacion,
                permitir_registro_publico,
                ultima_actualizacion`,
            [
                nombre_restaurante.trim(),
                moneda.trim(),
                Number(stock_minimo_default),
                Number(dias_expiracion_recuperacion),
                Boolean(permitir_registro_publico),
                CONFIG_ID
            ]
        );

        res.json({
            mensaje: 'Configuración del sistema actualizada correctamente.',
            configuracion: configuracionActualizada.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar la configuración del sistema.' });
    }
};

module.exports = { obtenerConfiguracion, actualizarConfiguracion };
