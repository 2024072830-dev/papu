const express = require('express');
const router = express.Router();
const { listarBackups, crearBackup, descargarBackup } = require('../controllers/backupsController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, autorizarRoles('Administrador'), listarBackups);
router.post('/', verificarToken, autorizarRoles('Administrador'), crearBackup);
router.get('/:nombre', verificarToken, autorizarRoles('Administrador'), descargarBackup);

module.exports = router;
