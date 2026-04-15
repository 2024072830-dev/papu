const express = require('express');
const router = express.Router();
const { obtenerProveedores, crearProveedor, actualizarProveedor, cambiarEstadoProveedor } = require('../controllers/proveedoresController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, autorizarRoles('Administrador', 'Sommelier'), obtenerProveedores);
router.post('/', verificarToken, autorizarRoles('Administrador', 'Sommelier'), crearProveedor);
router.put('/:id', verificarToken, autorizarRoles('Administrador', 'Sommelier'), actualizarProveedor);
router.patch('/:id/estado', verificarToken, autorizarRoles('Administrador', 'Sommelier'), cambiarEstadoProveedor);

module.exports = router;
