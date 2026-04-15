const express = require('express');
const router = express.Router();
const { obtenerConfiguracion, actualizarConfiguracion } = require('../controllers/configuracionController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, autorizarRoles('Administrador'), obtenerConfiguracion);
router.put('/', verificarToken, autorizarRoles('Administrador'), actualizarConfiguracion);

module.exports = router;
