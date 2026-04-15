import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

const ReporteVentasVinos = () => {
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    limite: 10
  });

  const cargarReporte = async (filtrosActivos = filtros) => {
    setError('');

    try {
      const params = new URLSearchParams();
      if (filtrosActivos.fecha_desde) params.append('fecha_desde', filtrosActivos.fecha_desde);
      if (filtrosActivos.fecha_hasta) params.append('fecha_hasta', filtrosActivos.fecha_hasta);
      if (filtrosActivos.limite) params.append('limite', filtrosActivos.limite);

      const respuesta = await fetch(`http://localhost:3000/api/reportes/ventas-vinos?${params.toString()}`, {
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

  const exportarExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      const respuesta = await fetch(`http://localhost:3000/api/reportes/ventas-vinos/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!respuesta.ok) {
        const data = await respuesta.json();
        setError(data.mensaje || 'No fue posible exportar el reporte.');
        return;
      }

      const blob = await respuesta.blob();
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = 'reporte_ventas_vinos.csv';
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo exportar el archivo.');
    }
  };

  return (
    <div className="page-panel">
      <section className="module-hero">
        <span className="module-eyebrow">Analitica comercial</span>
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div>
            <h2 className="mb-2">Reporte de vinos mas y menos vendidos</h2>
            <p className="text-muted mb-0">
              Analiza el comportamiento de venta por etiqueta y exporta el resultado para Excel.
            </p>
          </div>
          <button type="button" className="btn btn-success" onClick={exportarExcel}>
            Exportar a Excel
          </button>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Desde</label>
              <input
                type="date"
                className="form-control"
                value={filtros.fecha_desde}
                onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Hasta</label>
              <input
                type="date"
                className="form-control"
                value={filtros.fecha_hasta}
                onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Top / Bottom</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="50"
                value={filtros.limite}
                onChange={(e) => setFiltros({ ...filtros, limite: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <button type="button" className="btn btn-primary me-2" onClick={() => cargarReporte(filtros)}>
                Generar reporte
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  const reinicio = { fecha_desde: '', fecha_hasta: '', limite: 10 };
                  setFiltros(reinicio);
                  cargarReporte(reinicio);
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {reporte && (
        <>
          <div className="row mb-4 g-3">
            <div className="col-md-6">
              <div className="module-stat h-100">
                <small>Vinos con ventas</small>
                <strong>{reporte.resumen.total_vinos_con_ventas}</strong>
                <span className="text-muted d-block mt-1">Botellas vendidas: {reporte.resumen.total_botellas_vendidas}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="module-stat h-100">
                <small>Generado en</small>
                <strong>{new Date(reporte.generado_en).toLocaleDateString()}</strong>
                <span className="text-muted d-block mt-1">{new Date(reporte.generado_en).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Mas vendidos</h5>
                    <span className="chip-soft">Top etiquetas</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover soft-table">
                      <thead>
                        <tr>
                          <th>Vino</th>
                          <th>Movimientos</th>
                          <th>Botellas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporte.mas_vendidos.length > 0 ? (
                          reporte.mas_vendidos.map((item, index) => (
                            <tr key={`${item.vino_id}-${index}`}>
                              <td className="fw-semibold">{item.nombre_vino}</td>
                              <td>{item.total_movimientos}</td>
                              <td>{item.botellas_vendidas}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-4">No hay ventas registradas.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Menos vendidos</h5>
                    <span className="chip-soft">Rotacion lenta</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover soft-table">
                      <thead>
                        <tr>
                          <th>Vino</th>
                          <th>Movimientos</th>
                          <th>Botellas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporte.menos_vendidos.length > 0 ? (
                          reporte.menos_vendidos.map((item, index) => (
                            <tr key={`${item.vino_id}-menos-${index}`}>
                              <td className="fw-semibold">{item.nombre_vino}</td>
                              <td>{item.total_movimientos}</td>
                              <td>{item.botellas_vendidas}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-4">No hay ventas registradas.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteVentasVinos;
