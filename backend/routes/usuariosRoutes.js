const express = require('express');
const router = express.Router();
const { crearUsuario, obtenerUsuarios, actualizarUsuario } = require('../controllers/usuariosController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, autorizarRoles('Administrador'), crearUsuario);
router.get('/', verificarToken, autorizarRoles('Administrador'), obtenerUsuarios);
router.put('/:id', verificarToken, autorizarRoles('Administrador'), actualizarUsuario);

module.exports = router;
