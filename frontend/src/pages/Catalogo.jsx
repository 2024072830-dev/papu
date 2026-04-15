import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

const formularioInicial = {
  nombre: '',
  bodega: '',
  pais: '',
  cepa: '',
  anada: '',
  precio_venta: '',
  stock_actual: ''
};

const Catalogo = () => {
  const [vinos, setVinos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [vinoEnEdicion, setVinoEnEdicion] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarVinos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/vinos', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || 'No fue posible cargar el catalogo.');
        return;
      }

      setVinos(data);
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  useEffect(() => {
    cargarVinos();
  }, []);

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setVinoEnEdicion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const esEdicion = Boolean(vinoEnEdicion);
    const endpoint = esEdicion
      ? `http://localhost:3000/api/vinos/${vinoEnEdicion.id}`
      : 'http://localhost:3000/api/vinos';

    try {
      const res = await fetch(endpoint, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(formulario)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || 'No fue posible guardar el vino.');
        return;
      }

      setMensaje(esEdicion ? 'Etiqueta actualizada con exito.' : 'Etiqueta registrada con exito.');
      limpiarFormulario();
      cargarVinos();
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  const handleEditar = (vino) => {
    setMensaje('');
    setError('');
    setVinoEnEdicion(vino);
    setFormulario({
      nombre: vino.nombre ?? '',
      bodega: vino.bodega ?? '',
      pais: vino.pais ?? '',
      cepa: vino.cepa ?? '',
      anada: vino.anada ?? '',
      precio_venta: vino.precio_venta ?? '',
      stock_actual: vino.stock_actual ?? ''
    });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('Estas seguro de dar de baja este vino?')) {
      return;
    }

    setMensaje('');
    setError('');

    try {
      const res = await fetch(`http://localhost:3000/api/vinos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || 'No fue posible dar de baja el vino.');
        return;
      }

      if (vinoEnEdicion?.id === id) {
        limpiarFormulario();
      }

      setMensaje('Vino dado de baja correctamente.');
      cargarVinos();
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="page-panel">
      <section className="module-hero">
        <span className="module-eyebrow">Curaduria de cava</span>
        <div className="row align-items-end g-4">
          <div className="col-lg-7">
            <h2 className="mb-2">Catalogo de vinos</h2>
            <p className="text-muted mb-0">
              Administra la carta de etiquetas, ajusta su informacion comercial y manten actualizada la cava.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="row g-3">
              <div className="col-6">
                <div className="module-stat">
                  <small>Etiquetas activas</small>
                  <strong>{vinos.length}</strong>
                </div>
              </div>
              <div className="col-6">
                <div className="module-stat">
                  <small>Modo actual</small>
                  <strong>{vinoEnEdicion ? 'Edicion' : 'Alta'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="mb-1">{vinoEnEdicion ? 'Editar etiqueta' : 'Nueva etiqueta'}</h5>
                  <p className="text-muted mb-0">
                    {vinoEnEdicion ? 'Actualiza la ficha del vino seleccionado.' : 'Captura una nueva botella para la carta.'}
                  </p>
                </div>
                {vinoEnEdicion && (
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={limpiarFormulario}>
                    Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label">Nombre del vino</label>
                  <input
                    className="form-control"
                    required
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Bodega</label>
                  <input
                    className="form-control"
                    required
                    value={formulario.bodega}
                    onChange={(e) => setFormulario({ ...formulario, bodega: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Pais</label>
                  <input
                    className="form-control"
                    value={formulario.pais}
                    onChange={(e) => setFormulario({ ...formulario, pais: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Cepa / Uva</label>
                  <input
                    className="form-control"
                    value={formulario.cepa}
                    onChange={(e) => setFormulario({ ...formulario, cepa: e.target.value })}
                  />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Anada</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formulario.anada}
                      onChange={(e) => setFormulario({ ...formulario, anada: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={formulario.stock_actual}
                      onChange={(e) => setFormulario({ ...formulario, stock_actual: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-2 mb-3">
                  <label className="form-label">Precio de venta</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    required
                    value={formulario.precio_venta}
                    onChange={(e) => setFormulario({ ...formulario, precio_venta: e.target.value })}
                  />
                </div>

                <button type="submit" className={`btn w-100 ${vinoEnEdicion ? 'btn-warning' : 'btn-primary'}`}>
                  {vinoEnEdicion ? 'Guardar cambios' : 'Registrar vino'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="mb-1">Etiquetas activas</h5>
                  <p className="text-muted mb-0">Consulta y edita rapidamente la carta actual.</p>
                </div>
                <span className="chip-soft">Gestion comercial</span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle soft-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Bodega</th>
                      <th>Origen</th>
                      <th>Cepa</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vinos.length > 0 ? (
                      vinos.map((vino) => (
                        <tr key={vino.id}>
                          <td className="fw-semibold">{vino.nombre}</td>
                          <td>{vino.bodega}</td>
                          <td>{vino.pais || '-'}</td>
                          <td>{vino.cepa || '-'}</td>
                          <td>${vino.precio_venta}</td>
                          <td>
                            <span className={`badge ${Number(vino.stock_actual) <= 5 ? 'bg-danger' : 'bg-success'}`}>
                              {vino.stock_actual}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button type="button" onClick={() => handleEditar(vino)} className="btn btn-sm btn-outline-primary">
                                Editar
                              </button>
                              <button type="button" onClick={() => handleEliminar(vino.id)} className="btn btn-sm btn-danger">
                                Dar de baja
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          No hay vinos registrados en el catalogo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalogo;
