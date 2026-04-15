const express = require('express');
const router = express.Router();
const { obtenerBitacora, registrarLog } = require('../controllers/bitacoraController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, autorizarRoles('Administrador', 'Sommelier'), obtenerBitacora);
router.post('/', verificarToken, registrarLog);

module.exports = router;
