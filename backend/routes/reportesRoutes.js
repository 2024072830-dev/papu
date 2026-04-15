const express = require('express');
const router = express.Router();
const {
  obtenerReporteInventarioFisico,
  obtenerReporteVentas,
  exportarReporteVentasCsv
} = require('../controllers/reportesController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

router.get('/inventario-fisico', verificarToken, autorizarRoles('Administrador', 'Sommelier'), obtenerReporteInventarioFisico);
router.get('/ventas-vinos', verificarToken, autorizarRoles('Administrador', 'Sommelier'), obtenerReporteVentas);
router.get('/ventas-vinos/export', verificarToken, autorizarRoles('Administrador', 'Sommelier'), exportarReporteVentasCsv);

module.exports = router;
