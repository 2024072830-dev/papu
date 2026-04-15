const express = require('express');
const router = express.Router();
const { obtenerVinos, crearVino, actualizarVino, eliminarVino } = require('../controllers/vinosController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

// Todas estas rutas requerirán que el usuario haya iniciado sesión
router.get('/', verificarToken, obtenerVinos);
router.post('/', verificarToken, autorizarRoles('Administrador', 'Sommelier'), crearVino);
router.put('/:id', verificarToken, actualizarVino);
router.delete('/:id', verificarToken, autorizarRoles('Administrador', 'Sommelier'), eliminarVino);

module.exports = router;
