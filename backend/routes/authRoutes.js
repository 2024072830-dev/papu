const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  solicitarRecuperacionPassword,
  restablecerPassword
} = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta para registro: POST http://localhost:3000/api/auth/registro
router.post('/registro', registrarUsuario);

// Ruta para login: POST http://localhost:3000/api/auth/login
router.post('/login', loginUsuario);
router.post('/forgot-password', solicitarRecuperacionPassword);
router.post('/reset-password', restablecerPassword);
router.get('/me', verificarToken, obtenerPerfil);
router.put('/me', verificarToken, actualizarPerfil);

module.exports = router;
