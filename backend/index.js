const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const vinosRoutes = require('./routes/vinosRoutes');
const proveedoresRoutes = require('./routes/proveedoresRoutes');
const bitacoraRoutes = require('./routes/bitacoraRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');
const backupsRoutes = require('./routes/backupsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/vinos', vinosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/backups', backupsRoutes);

app.get('/', (req, res) => {
    res.send('API del Restaurante La Costera 28 funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
