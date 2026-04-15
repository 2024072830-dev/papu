const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Nuestra conexión a la base de datos

const ROLES_VALIDOS = ['Administrador', 'Sommelier', 'Mesero'];

const construirUsuarioSeguro = (usuario) => ({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    activo: usuario.activo ?? true
});

// Función para REGISTRAR un nuevo usuario
const registrarUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        if (!nombre || !email || !password) {
            return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios.' });
        }

        const configuracion = await pool.query(
            'SELECT permitir_registro_publico FROM configuracion_sistema WHERE id = 1'
        );

        const registroPublicoPermitido = configuracion.rows[0]?.permitir_registro_publico ?? false;
        if (!registroPublicoPermitido) {
            return res.status(403).json({ mensaje: 'El registro público está deshabilitado. Contacta a un administrador.' });
        }

        // 1. Verificar si el usuario ya existe
        const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        // 2. Encriptar la contraseña (Requerimiento de la rúbrica)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Guardar el usuario en la base de datos
        const nuevoUsuario = await pool.query(
            `INSERT INTO usuarios (nombre, email, password_hash, rol)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nombre, email, rol`,
            [nombre, email.toLowerCase(), passwordHash, 'Mesero']
        );

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: construirUsuarioSeguro(nuevoUsuario.rows[0])
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Función para INICIAR SESIÓN (Login)
const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar al usuario por su email
        const usuario = await pool.query(
            'SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = $1',
            [email.toLowerCase()]
        );
        if (usuario.rows.length === 0) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        const user = usuario.rows[0];

        // 2. Comparar la contraseña ingresada con la encriptada
        const passwordValida = await bcrypt.compare(password, user.password_hash);
        if (!passwordValida) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        const rol = ROLES_VALIDOS.includes(user.rol) ? user.rol : 'Mesero';

        // 3. Generar el JWT (Json Web Token)
        const token = jwt.sign(
            { id: user.id, rol },           // Datos que guardamos en el token
            process.env.JWT_SECRET,         // Nuestra clave secreta del .env
            { expiresIn: '8h' }             // El token expira en 8 horas
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: construirUsuarioSeguro({ ...user, rol })
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

const obtenerPerfil = async (req, res) => {
    res.json({ usuario: construirUsuarioSeguro(req.usuario) });
};

const solicitarRecuperacionPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ mensaje: 'El correo es obligatorio.' });
        }

        const correoNormalizado = email.toLowerCase().trim();

        const usuario = await pool.query(
            'SELECT id, nombre, email FROM usuarios WHERE email = $1',
            [correoNormalizado]
        );

        if (usuario.rows.length === 0) {
            return res.json({
                mensaje: 'Si el correo existe, se generó un enlace de recuperación.'
            });
        }

        await pool.query(
            'DELETE FROM recuperacion_password WHERE usuario_id = $1',
            [usuario.rows[0].id]
        );

        const configuracion = await pool.query(
            'SELECT dias_expiracion_recuperacion FROM configuracion_sistema WHERE id = 1'
        );

        const diasVigencia = Number(configuracion.rows[0]?.dias_expiracion_recuperacion ?? 1);
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiraEn = new Date(Date.now() + diasVigencia * 24 * 60 * 60 * 1000);

        await pool.query(
            `INSERT INTO recuperacion_password (usuario_id, token_hash, expira_en)
             VALUES ($1, $2, $3)`,
            [usuario.rows[0].id, tokenHash, expiraEn]
        );

        console.log(`Token de recuperación para ${correoNormalizado}: ${token}`);

        res.json({
            mensaje: 'Solicitud procesada. Usa el token generado para restablecer la contraseña.',
            token_recuperacion: token,
            expira_en: expiraEn
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al solicitar la recuperación de contraseña.' });
    }
};

const restablecerPassword = async (req, res) => {
    const { token, nuevaPassword } = req.body;

    try {
        if (!token || !nuevaPassword) {
            return res.status(400).json({ mensaje: 'Token y nueva contraseña son obligatorios.' });
        }

        if (nuevaPassword.length < 6) {
            return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const recuperacion = await pool.query(
            `SELECT id, usuario_id, expira_en, usado
             FROM recuperacion_password
             WHERE token_hash = $1`,
            [tokenHash]
        );

        if (recuperacion.rows.length === 0) {
            return res.status(400).json({ mensaje: 'El token de recuperación no es válido.' });
        }

        const solicitud = recuperacion.rows[0];

        if (solicitud.usado) {
            return res.status(400).json({ mensaje: 'Este token ya fue utilizado.' });
        }

        if (new Date(solicitud.expira_en) < new Date()) {
            return res.status(400).json({ mensaje: 'El token de recuperación ya expiró.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(nuevaPassword, salt);

        await pool.query(
            'UPDATE usuarios SET password_hash = $1 WHERE id = $2',
            [passwordHash, solicitud.usuario_id]
        );

        await pool.query(
            'UPDATE recuperacion_password SET usado = TRUE WHERE id = $1',
            [solicitud.id]
        );

        res.json({ mensaje: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al restablecer la contraseña.' });
    }
};

const actualizarPerfil = async (req, res) => {
    const { nombre, email, passwordActual, nuevaPassword } = req.body;

    try {
        if (!nombre || !email) {
            return res.status(400).json({ mensaje: 'Nombre y correo son obligatorios.' });
        }

        const correoNormalizado = email.toLowerCase().trim();

        const usuarioExistente = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1 AND id <> $2',
            [correoNormalizado, req.usuario.id]
        );

        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ mensaje: 'Ese correo ya está siendo usado por otro usuario.' });
        }

        let passwordHash = null;

        if (nuevaPassword) {
            if (!passwordActual) {
                return res.status(400).json({ mensaje: 'Debes escribir tu contraseña actual para cambiarla.' });
            }

            if (nuevaPassword.length < 6) {
                return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' });
            }

            const usuarioBD = await pool.query(
                'SELECT password_hash FROM usuarios WHERE id = $1',
                [req.usuario.id]
            );

            const passwordValida = await bcrypt.compare(passwordActual, usuarioBD.rows[0].password_hash);

            if (!passwordValida) {
                return res.status(400).json({ mensaje: 'La contraseña actual no es correcta.' });
            }

            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(nuevaPassword, salt);
        }

        const valores = [nombre.trim(), correoNormalizado, req.usuario.id];
        let query = `
            UPDATE usuarios
            SET nombre = $1, email = $2
        `;

        if (passwordHash) {
            query += ', password_hash = $4';
            valores.push(passwordHash);
        }

        query += ' WHERE id = $3 RETURNING id, nombre, email, rol';

        const usuarioActualizado = await pool.query(query, valores);

        res.json({
            mensaje: passwordHash
                ? 'Perfil y contraseña actualizados correctamente.'
                : 'Perfil actualizado correctamente.',
            usuario: construirUsuarioSeguro(usuarioActualizado.rows[0])
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el perfil.' });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario,
    obtenerPerfil,
    actualizarPerfil,
    solicitarRecuperacionPassword,
    restablecerPassword
};
