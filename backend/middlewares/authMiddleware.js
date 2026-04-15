const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const verificarToken = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. No hay token de autenticación.' });
    }

    try {
        const tokenLimpio = token.replace('Bearer ', '');
        const payload = jwt.verify(tokenLimpio, process.env.JWT_SECRET);

        const usuario = await pool.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
            [payload.id]
        );

        if (usuario.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Usuario no encontrado.' });
        }

        const usuarioActual = usuario.rows[0];
        req.usuario = { ...usuarioActual, activo: true };
        next();
    } catch (error) {
        res.status(400).json({ mensaje: 'Token inválido o expirado.' });
    }
};

const autorizarRoles = (...rolesPermitidos) => (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({ mensaje: 'Usuario no autenticado.' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción.' });
    }

    next();
};

module.exports = { verificarToken, autorizarRoles };
