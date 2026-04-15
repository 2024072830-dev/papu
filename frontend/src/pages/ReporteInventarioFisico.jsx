import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(Number(valor || 0));

const ReporteInventarioFisico = () => {
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState('');
  const [soloStockBajo, setSoloStockBajo] = useState(false);

  const cargarReporte = async (filtrarStockBajo = soloStockBajo) => {
    setError('');

    try {
      const query = filtrarStockBajo ? '?stock_bajo=true' : '';
      const respuesta = await fetch(`http://localhost:3000/api/reportes/inventario-fisico${query}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible generar el reporte.');
        return;
      }

      setReporte(data);
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  return (
    <div className="page-panel">
      <section className="module-hero no-print">
        <span className="module-eyebrow">Reporte ejecutivo</span>
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div>
            <h2 className="mb-2">Inventario fisico en PDF</h2>
            <p className="text-muted mb-0">
              Vista refinada para impresion, control administrativo y resguardo documental.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-primary" onClick={() => cargarReporte(soloStockBajo)}>
              Actualizar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
              Exportar a PDF
            </button>
          </div>
        </div>
      </section>

      {error && <div className="alert alert-danger no-print">{error}</div>}

      <div className="card mb-4 no-print">
        <div className="card-body">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="stockBajo"
              checked={soloStockBajo}
              onChange={(e) => {
                setSoloStockBajo(e.target.checked);
                cargarReporte(e.target.checked);
              }}
            />
            <label className="form-check-label" htmlFor="stockBajo">
              Mostrar solo vinos con stock bajo o minimo
            </label>
          </div>
        </div>
      </div>

      <div className="card print-card">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h3 className="mb-1">La Costera 28</h3>
            <h5 className="mb-1">Reporte de Inventario Fisico</h5>
            <small className="text-muted">
              Generado el {reporte ? new Date(reporte.generado_en).toLocaleString() : '--'}
            </small>
          </div>

          {reporte && (
            <>
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="module-stat h-100">
                    <small>Total de vinos</small>
                    <strong>{reporte.resumen.total_vinos}</strong>
                  </div>
                </div>
                <div className="col-md-3 mt-3 mt-md-0">
                  <div className="module-stat h-100">
                    <small>Total de botellas</small>
                    <strong>{reporte.resumen.total_botellas}</strong>
                  </div>
                </div>
                <div className="col-md-3 mt-3 mt-md-0">
                  <div className="module-stat h-100">
                    <small>Valor estimado</small>
                    <strong>{formatoMoneda(reporte.resumen.valor_total_estimado)}</strong>
                  </div>
                </div>
                <div className="col-md-3 mt-3 mt-md-0">
                  <div className="module-stat h-100">
                    <small>Stock bajo</small>
                    <strong className="text-danger">{reporte.resumen.vinos_stock_bajo}</strong>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle soft-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Bodega</th>
                      <th>Pais</th>
                      <th>Cepa</th>
                      <th>Añada</th>
                      <th>Stock</th>
                      <th>Minimo</th>
                      <th>Precio</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.detalle.length > 0 ? (
                      reporte.detalle.map((vino) => (
                        <tr key={vino.id}>
                          <td className="fw-semibold">{vino.nombre}</td>
                          <td>{vino.bodega || '-'}</td>
                          <td>{vino.pais || '-'}</td>
                          <td>{vino.cepa || '-'}</td>
                          <td>{vino.anada || '-'}</td>
                          <td className={Number(vino.stock_actual) <= Number(vino.stock_minimo) ? 'text-danger fw-bold' : ''}>
                            {vino.stock_actual}
                          </td>
                          <td>{vino.stock_minimo}</td>
                          <td>{formatoMoneda(vino.precio_venta)}</td>
                          <td>{formatoMoneda(vino.valor_estimado)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          No hay datos para mostrar en este reporte.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporteInventarioFisico;
