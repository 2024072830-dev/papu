const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');

const execFileAsync = promisify(execFile);

const BACKUPS_DIR = path.join(__dirname, '..', 'backups');

const rutasWindowsPgDump = [
    process.env.PG_DUMP_PATH,
    'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\13\\bin\\pg_dump.exe',
    'pg_dump'
].filter(Boolean);

const asegurarCarpetaBackups = () => {
    if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
};

const resolverPgDump = () => {
    for (const ruta of rutasWindowsPgDump) {
        if (ruta === 'pg_dump' || fs.existsSync(ruta)) {
            return ruta;
        }
    }

    return null;
};

const construirNombreArchivo = () => {
    const fecha = new Date();
    const stamp = [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, '0'),
        String(fecha.getDate()).padStart(2, '0')
    ].join('-');
    const hora = [
        String(fecha.getHours()).padStart(2, '0'),
        String(fecha.getMinutes()).padStart(2, '0'),
        String(fecha.getSeconds()).padStart(2, '0')
    ].join('-');

    return `lacostera28_backup_${stamp}_${hora}.sql`;
};

const listarBackups = async (req, res) => {
    try {
        asegurarCarpetaBackups();

        const archivos = fs.readdirSync(BACKUPS_DIR)
            .filter((archivo) => archivo.endsWith('.sql'))
            .map((archivo) => {
                const rutaCompleta = path.join(BACKUPS_DIR, archivo);
                const stats = fs.statSync(rutaCompleta);

                return {
                    nombre: archivo,
                    tamano_bytes: stats.size,
                    fecha_creacion: stats.birthtime,
                    fecha_modificacion: stats.mtime
                };
            })
            .sort((a, b) => new Date(b.fecha_modificacion) - new Date(a.fecha_modificacion));

        res.json({
            carpeta: BACKUPS_DIR,
            total: archivos.length,
            backups: archivos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al listar los respaldos.' });
    }
};

const crearBackup = async (req, res) => {
    try {
        asegurarCarpetaBackups();

        const pgDump = resolverPgDump();
        if (!pgDump) {
            return res.status(500).json({
                mensaje: 'No se encontró pg_dump. Configura PG_DUMP_PATH o instala PostgreSQL con pg_dump disponible.'
            });
        }

        const nombreArchivo = construirNombreArchivo();
        const rutaArchivo = path.join(BACKUPS_DIR, nombreArchivo);

        const args = [
            '-h', process.env.DB_HOST,
            '-p', String(process.env.DB_PORT),
            '-U', process.env.DB_USER,
            '-d', process.env.DB_NAME,
            '-F', 'p',
            '-f', rutaArchivo
        ];

        await execFileAsync(pgDump, args, {
            env: {
                ...process.env,
                PGPASSWORD: process.env.DB_PASSWORD
            },
            windowsHide: true,
            maxBuffer: 1024 * 1024 * 10
        });

        const stats = fs.statSync(rutaArchivo);

        res.status(201).json({
            mensaje: 'Respaldo generado correctamente.',
            backup: {
                nombre: nombreArchivo,
                ruta: rutaArchivo,
                tamano_bytes: stats.size,
                fecha_creacion: stats.birthtime
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al generar el respaldo de la base de datos.',
            detalle: error.stderr || error.message
        });
    }
};

const descargarBackup = async (req, res) => {
    try {
        asegurarCarpetaBackups();

        const nombreArchivo = path.basename(req.params.nombre);
        const rutaArchivo = path.resolve(BACKUPS_DIR, nombreArchivo);

        if (!rutaArchivo.startsWith(path.resolve(BACKUPS_DIR))) {
            return res.status(400).json({ mensaje: 'Archivo de respaldo inválido.' });
        }

        if (!fs.existsSync(rutaArchivo)) {
            return res.status(404).json({ mensaje: 'El respaldo solicitado no existe.' });
        }

        res.download(rutaArchivo, nombreArchivo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al descargar el respaldo.' });
    }
};

module.exports = { listarBackups, crearBackup, descargarBackup };
