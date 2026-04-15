const pool = require('../config/db');

// Obtener todos los proveedores
const obtenerProveedores = async (req, res) => {
    try {
        const proveedores = await pool.query("SELECT * FROM proveedores ORDER BY id DESC");
        res.json(proveedores.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener proveedores' });
    }
};

// Registrar un nuevo proveedor
const crearProveedor = async (req, res) => {
    const { empresa, contacto, telefono, correo, rfc, direccion, estado } = req.body;
    try {
        const nuevoProveedor = await pool.query(
            `INSERT INTO proveedores (empresa, contacto, telefono, correo, rfc, direccion, estado) 
             VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'Activo')) RETURNING *`,
            [empresa, contacto, telefono, correo, rfc, direccion, estado]
        );
        res.status(201).json({ mensaje: 'Proveedor registrado exitosamente', proveedor: nuevoProveedor.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar el proveedor' });
    }
};

// Actualizar un proveedor existente
const actualizarProveedor = async (req, res) => {
    const { id } = req.params;
    const { empresa, contacto, telefono, correo, rfc, direccion } = req.body;
    
    try {
        const proveedorActualizado = await pool.query(
            `UPDATE proveedores 
             SET empresa = $1, contacto = $2, telefono = $3, correo = $4, rfc = $5, direccion = $6
             WHERE id = $7 RETURNING *`,
            [empresa, contacto, telefono, correo, rfc, direccion, id]
        );

        if (proveedorActualizado.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
        }

        res.json({ mensaje: 'Proveedor actualizado correctamente', proveedor: proveedorActualizado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el proveedor' });
    }
};

// Cambiar estado de proveedor (Dar de baja / alta lógica)
const cambiarEstadoProveedor = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const proveedorActualizado = await pool.query(
            `UPDATE proveedores SET estado = $1 WHERE id = $2 RETURNING *`,
            [estado, id]
        );

        if (proveedorActualizado.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
        }

        res.json({ mensaje: `Proveedor marcado como ${estado}`, proveedor: proveedorActualizado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cambiar estado del proveedor' });
    }
};

module.exports = { obtenerProveedores, crearProveedor, actualizarProveedor, cambiarEstadoProveedor };