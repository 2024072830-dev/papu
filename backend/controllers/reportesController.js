const pool = require('../config/db');

const obtenerReporteInventarioFisico = async (req, res) => {
    const { stock_bajo } = req.query;

    try {
        const condiciones = [`estado = 'Activo'`];
        const valores = [];

        if (stock_bajo === 'true') {
            condiciones.push('stock_actual <= stock_minimo');
        }

        const vinos = await pool.query(
            `SELECT
                id,
                nombre,
                bodega,
                pais,
                cepa,
                anada,
                precio_venta,
                stock_actual,
                stock_minimo,
                (stock_actual * COALESCE(precio_venta, 0)) AS valor_estimado
             FROM vinos
             WHERE ${condiciones.join(' AND ')}
             ORDER BY nombre ASC`,
            valores
        );

        const resumen = await pool.query(
            `SELECT
                COUNT(*) AS total_vinos,
                COALESCE(SUM(stock_actual), 0) AS total_botellas,
                COALESCE(SUM(stock_actual * COALESCE(precio_venta, 0)), 0) AS valor_total_estimado,
                COUNT(*) FILTER (WHERE stock_actual <= stock_minimo) AS vinos_stock_bajo
             FROM vinos
             WHERE estado = 'Activo'`
        );

        res.json({
            generado_en: new Date().toISOString(),
            filtros: {
                stock_bajo: stock_bajo === 'true'
            },
            resumen: resumen.rows[0],
            detalle: vinos.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al generar el reporte de inventario físico.' });
    }
};

const construirFiltrosVentas = (query) => {
    const condiciones = [`tipo_movimiento = 'Salida (-)'`, `COALESCE(motivo, 'Venta') = 'Venta'`];
    const valores = [];

    if (query.fecha_desde) {
        valores.push(query.fecha_desde);
        condiciones.push(`fecha >= $${valores.length}`);
    }

    if (query.fecha_hasta) {
        valores.push(query.fecha_hasta);
        condiciones.push(`fecha < ($${valores.length}::date + INTERVAL '1 day')`);
    }

    return { condiciones, valores };
};

const obtenerReporteVentas = async (req, res) => {
    try {
        const { condiciones, valores } = construirFiltrosVentas(req.query);
        const limite = Number(req.query.limite) > 0 ? Number(req.query.limite) : 10;

        const ventas = await pool.query(
            `SELECT
                vino_id,
                nombre_vino,
                COUNT(*) AS total_movimientos,
                COALESCE(SUM(cantidad), 0) AS botellas_vendidas
             FROM bitacora
             WHERE ${condiciones.join(' AND ')}
             GROUP BY vino_id, nombre_vino
             ORDER BY botellas_vendidas DESC, nombre_vino ASC`,
            valores
        );

        const detalle = ventas.rows;
        const masVendidos = detalle.slice(0, limite);
        const menosVendidos = [...detalle]
            .sort((a, b) => Number(a.botellas_vendidas) - Number(b.botellas_vendidas) || a.nombre_vino.localeCompare(b.nombre_vino))
            .slice(0, limite);

        const resumen = detalle.reduce((acc, item) => {
            acc.total_vinos_con_ventas += 1;
            acc.total_botellas_vendidas += Number(item.botellas_vendidas);
            return acc;
        }, { total_vinos_con_ventas: 0, total_botellas_vendidas: 0 });

        res.json({
            generado_en: new Date().toISOString(),
            filtros: {
                fecha_desde: req.query.fecha_desde || null,
                fecha_hasta: req.query.fecha_hasta || null,
                limite
            },
            resumen,
            mas_vendidos: masVendidos,
            menos_vendidos: menosVendidos,
            detalle
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al generar el reporte de ventas.' });
    }
};

const exportarReporteVentasCsv = async (req, res) => {
    try {
        const { condiciones, valores } = construirFiltrosVentas(req.query);

        const ventas = await pool.query(
            `SELECT
                nombre_vino,
                COUNT(*) AS total_movimientos,
                COALESCE(SUM(cantidad), 0) AS botellas_vendidas
             FROM bitacora
             WHERE ${condiciones.join(' AND ')}
             GROUP BY nombre_vino
             ORDER BY botellas_vendidas DESC, nombre_vino ASC`,
            valores
        );

        const encabezados = ['Nombre del vino', 'Total movimientos', 'Botellas vendidas'];
        const filas = ventas.rows.map((item) => [
            item.nombre_vino,
            item.total_movimientos,
            item.botellas_vendidas
        ]);

        const csv = [encabezados, ...filas]
            .map((fila) => fila.map((valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const fechaArchivo = new Date().toISOString().slice(0, 10);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_ventas_vinos_${fechaArchivo}.csv"`);
        res.send(`\uFEFF${csv}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al exportar el reporte de ventas.' });
    }
};

module.exports = {
    obtenerReporteInventarioFisico,
    obtenerReporteVentas,
    exportarReporteVentasCsv
};
