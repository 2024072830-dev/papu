const bcrypt = require('bcrypt');
const pool = require('../config/db');

const ROLES_VALIDOS = ['Administrador', 'Sommelier', 'Mesero'];

const validarDatosUsuario = ({ nombre, email, password, rol }) => {
    if (!nombre || !email || !password || !rol) {
        return 'Nombre, correo, contraseña y rol son obligatorios.';
    }

    if (password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!ROLES_VALIDOS.includes(rol)) {
        return 'Rol no válido. Usa Administrador, Sommelier o Mesero.';
    }

    return null;
};

const crearUsuario = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    try {
        const errorValidacion = validarDatosUsuario({ nombre, email, password, rol });
        if (errorValidacion) {
            return res.status(400).json({ mensaje: errorValidacion });
        }

        const correoNormalizado = email.toLowerCase().trim();

        const usuarioExistente = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [correoNormalizado]
        );

        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoUsuario = await pool.query(
            `INSERT INTO usuarios (nombre, email, password_hash, rol)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nombre, email, rol`,
            [nombre.trim(), correoNormalizado, passwordHash, rol]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente.',
            usuario: { ...nuevoUsuario.rows[0], activo: true }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar el usuario.' });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await pool.query(
            `SELECT id, nombre, email, rol
             FROM usuarios
             ORDER BY id DESC`
        );

        res.json(usuarios.rows.map((usuario) => ({ ...usuario, activo: true })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios.' });
    }
};

const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { rol, activo } = req.body;

    try {
        const usuarioObjetivo = await pool.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
            [id]
        );

        if (usuarioObjetivo.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        if (req.usuario.id === Number(id)) {
            if (rol && rol !== 'Administrador') {
                return res.status(400).json({ mensaje: 'No puedes cambiar tu propio rol a uno sin privilegios.' });
            }
        }

        const nuevoRol = rol ?? usuarioObjetivo.rows[0].rol;

        if (!ROLES_VALIDOS.includes(nuevoRol)) {
            return res.status(400).json({ mensaje: 'Rol no válido. Usa Administrador, Sommelier o Mesero.' });
        }

        const usuarioActualizado = await pool.query(
            `UPDATE usuarios
             SET rol = $1
             WHERE id = $2
             RETURNING id, nombre, email, rol`,
            [nuevoRol, id]
        );

        res.json({
            mensaje: 'Usuario actualizado correctamente.',
            usuario: { ...usuarioActualizado.rows[0], activo: true }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el usuario.' });
    }
};

module.exports = { crearUsuario, obtenerUsuarios, actualizarUsuario };
