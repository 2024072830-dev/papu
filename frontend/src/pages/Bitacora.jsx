import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

const filtrosIniciales = {
  fecha_desde: '',
  fecha_hasta: '',
  usuario: '',
  tipo_movimiento: '',
  nombre_vino: ''
};

const Bitacora = () => {
  const [logs, setLogs] = useState([]);
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [error, setError] = useState('');

  const cargarBitacora = async (filtrosActivos = filtros) => {
    setError('');

    try {
      const params = new URLSearchParams();

      Object.entries(filtrosActivos).forEach(([clave, valor]) => {
        if (valor) {
          params.append(clave, valor);
        }
      });

      const query = params.toString();
      const url = `http://localhost:3000/api/bitacora${query ? `?${query}` : ''}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || 'No fue posible cargar la bitacora.');
        return;
      }

      setLogs(data);
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  useEffect(() => {
    cargarBitacora();
  }, []);

  const aplicarFiltros = (e) => {
    e.preventDefault();
    cargarBitacora(filtros);
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
    cargarBitacora(filtrosIniciales);
  };

  const colorBadge = (tipo) => {
    if (tipo.includes('Entrada') || tipo === 'Alta') return 'bg-success';
    if (tipo.includes('Salida') || tipo === 'Baja') return 'bg-danger';
    if (tipo === 'Edicion') return 'bg-warning text-dark';
    return 'bg-secondary';
  };

  return (
    <div className="page-panel">
      <section className="module-hero">
        <span className="module-eyebrow">Trazabilidad</span>
        <div className="row align-items-end g-4">
          <div className="col-lg-7">
            <h2 className="mb-2">Auditoria de bitacora</h2>
            <p className="text-muted mb-0">
              Supervisa cada movimiento del sistema y localiza cambios por fecha, usuario o etiqueta.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="row g-3">
              <div className="col-6">
                <div className="module-stat">
                  <small>Eventos visibles</small>
                  <strong>{logs.length}</strong>
                </div>
              </div>
              <div className="col-6">
                <div className="module-stat">
                  <small>Control</small>
                  <strong>Auditoria</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={aplicarFiltros}>
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label">Desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={filtros.fecha_desde}
                  onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={filtros.fecha_hasta}
                  onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Usuario</label>
                <input
                  className="form-control"
                  placeholder="Ej. Johanan"
                  value={filtros.usuario}
                  onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Vino</label>
                <input
                  className="form-control"
                  placeholder="Buscar por nombre"
                  value={filtros.nombre_vino}
                  onChange={(e) => setFiltros({ ...filtros, nombre_vino: e.target.value })}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Tipo</label>
                <select
                  className="form-select"
                  value={filtros.tipo_movimiento}
                  onChange={(e) => setFiltros({ ...filtros, tipo_movimiento: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="Entrada (+)">Entrada</option>
                  <option value="Salida (-)">Salida</option>
                  <option value="Alta">Alta</option>
                  <option value="Edicion">Edicion</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary">Aplicar filtros</button>
              <button type="button" className="btn btn-outline-secondary" onClick={limpiarFiltros}>
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-1">Historial del sistema</h5>
              <p className="text-muted mb-0">Registro cronologico de altas, salidas, ediciones y bajas.</p>
            </div>
            <span className="chip-soft">Revision administrativa</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle soft-table">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Vino</th>
                  <th>Movimiento</th>
                  <th>Cantidad</th>
                  <th>Usuario responsable</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.fecha).toLocaleString()}</td>
                      <td className="fw-bold">{log.nombre_vino || 'Sin referencia'}</td>
                      <td>
                        <span className={`badge ${colorBadge(log.tipo_movimiento)}`}>
                          {log.tipo_movimiento}
                        </span>
                      </td>
                      <td>{log.cantidad ?? 0}</td>
                      <td>{log.usuario}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No hay registros que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bitacora;
