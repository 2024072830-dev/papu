import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

const Inventario = () => {
  const [vinos, setVinos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroUva, setFiltroUva] = useState('');
  const [filtroPais, setFiltroPais] = useState('');
  const [motivoSalida, setMotivoSalida] = useState('Venta');

  const cargarVinos = async () => {
    const token = getToken();
    const res = await fetch('http://localhost:3000/api/vinos', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      setVinos(data);
    }
  };

  useEffect(() => {
    cargarVinos();
  }, []);

  const vinosFiltrados = vinos.filter((vino) => {
    const coincideNombre = vino.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideUva = filtroUva === '' || vino.cepa === filtroUva;
    const coincidePais = filtroPais === '' || vino.pais === filtroPais;
    return coincideNombre && coincideUva && coincidePais;
  });

  const uvasUnicas = [...new Set(vinos.map((v) => v.cepa).filter(Boolean))];
  const paisesUnicos = [...new Set(vinos.map((v) => v.pais).filter(Boolean))];

  const manejarMovimiento = async (vino, cantidad, tipo, motivo = null) => {
    const nuevoStock = tipo === 'entrada' ? vino.stock_actual + cantidad : vino.stock_actual - cantidad;
    if (nuevoStock < 0) {
      return alert('No hay suficiente stock');
    }

    const token = getToken();

    const res = await fetch(`http://localhost:3000/api/vinos/${vino.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...vino, stock_actual: nuevoStock })
    });

    if (res.ok) {
      await fetch('http://localhost:3000/api/bitacora', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vino_id: vino.id,
          nombre_vino: vino.nombre,
          tipo_movimiento: tipo === 'entrada' ? 'Entrada (+)' : 'Salida (-)',
          cantidad,
          motivo
        })
      });

      cargarVinos();
    }
  };

  return (
    <div className="page-panel">
      <section className="module-hero">
        <span className="module-eyebrow">Operacion de sala</span>
        <div className="row align-items-end g-4">
          <div className="col-lg-7">
            <h2 className="mb-2">Inventario agil para servicio</h2>
            <p className="text-muted mb-0">
              Consulta la cava en segundos, registra salidas por venta o merma y manten la operacion al dia.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="row g-3">
              <div className="col-6">
                <div className="module-stat">
                  <small>Vinos visibles</small>
                  <strong>{vinosFiltrados.length}</strong>
                </div>
              </div>
              <div className="col-6">
                <div className="module-stat">
                  <small>Motivo activo</small>
                  <strong>{motivoSalida}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small text-muted">Buscar por nombre</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. Tinto Merlot..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Filtrar por uva</label>
              <select className="form-select" value={filtroUva} onChange={(e) => setFiltroUva(e.target.value)}>
                <option value="">Todas las uvas</option>
                {uvasUnicas.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Filtrar por pais</label>
              <select className="form-select" value={filtroPais} onChange={(e) => setFiltroPais(e.target.value)}>
                <option value="">Todos los paises</option>
                {paisesUnicos.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Motivo de salida</label>
              <select className="form-select" value={motivoSalida} onChange={(e) => setMotivoSalida(e.target.value)}>
                <option value="Venta">Venta</option>
                <option value="Merma">Merma</option>
                <option value="Degustacion">Degustacion</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-1">Disponibilidad por etiqueta</h5>
              <p className="text-muted mb-0">Visualiza stock y ejecuta movimientos rapidos sobre cada botella.</p>
            </div>
            <span className="chip-soft">Servicio en piso</span>
          </div>
          <table className="table table-hover align-middle soft-table">
            <thead className="table-light">
              <tr>
                <th>Vino / Bodega</th>
                <th>Origen / Uva</th>
                <th className="text-center">Stock</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vinosFiltrados.length > 0 ? (
                vinosFiltrados.map((vino) => (
                  <tr key={vino.id}>
                    <td>
                      <div className="fw-bold">{vino.nombre}</div>
                      <small className="text-muted">{vino.bodega}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark me-1">{vino.pais || 'Sin pais'}</span>
                      <span className="badge bg-light text-dark">{vino.cepa || 'Sin cepa'}</span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${vino.stock_actual <= 5 ? 'bg-danger' : 'bg-success'}`}>
                        {vino.stock_actual}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => manejarMovimiento(vino, 1, 'salida', motivoSalida)}
                        className="btn btn-sm btn-outline-danger me-1"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => manejarMovimiento(vino, 1, 'entrada', 'Compra')}
                        className="btn btn-sm btn-outline-primary"
                      >
                        +1
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">No se encontraron vinos con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventario;
