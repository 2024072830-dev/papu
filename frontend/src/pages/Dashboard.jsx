import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getUsuario, limpiarSesion } from '../utils/auth';

const Dashboard = () => {
  const [vinos, setVinos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const usuario = getUsuario();

  useEffect(() => {
    const cargarVinos = async () => {
      const token = getToken();

      try {
        const respuesta = await fetch('http://localhost:3000/api/vinos', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (respuesta.ok) {
          const data = await respuesta.json();
          setVinos(data);
        } else {
          setError('Error al cargar el inventario. Verifica tus permisos.');
        }
      } catch {
        setError('No se pudo conectar con el servidor.');
      }
    };

    cargarVinos();
  }, []);

  const handleCerrarSesion = () => {
    limpiarSesion();
    navigate('/');
  };

  const stockBajo = vinos.filter((v) => v.stock_actual <= 5);
  const valorInventario = vinos.reduce(
    (total, vino) => total + Number(vino.stock_actual || 0) * Number(vino.precio_venta || 0),
    0
  );

  return (
    <div className="page-panel">
      <section className="dashboard-hero">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <small className="text-uppercase">Sala de control</small>
            <h2 className="mt-2 mb-2">Panel de la cava</h2>
            <p className="mb-2">Resumen ejecutivo del inventario de vinos y operación diaria del restaurante.</p>
            <small>
              Sesion activa: {usuario?.nombre || 'Usuario'} | Rol: {usuario?.rol || 'Sin rol'}
            </small>
          </div>
          <button onClick={handleCerrarSesion} className="btn btn-outline-light">
            Cerrar sesion
          </button>
        </div>
      </section>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card metric-card h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase mb-2">Etiquetas activas</h6>
              <h2 className="mb-1">{vinos.length}</h2>
              <small className="text-success">Vinos listos para servicio</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 mt-3 mt-md-0">
          <div className="card metric-card h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase mb-2">Stock bajo</h6>
              <h2 className="mb-1 text-danger">{stockBajo.length}</h2>
              <small className="text-muted">Etiquetas que requieren reposicion</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 mt-3 mt-md-0">
          <div className="card metric-card h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase mb-2">Valor estimado</h6>
              <h2 className="mb-1">${valorInventario.toFixed(2)}</h2>
              <small className="text-muted">Valuacion comercial actual</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="mb-1">Inventario actual</h5>
              <p className="text-muted mb-0">Vista general de las botellas disponibles en la cava.</p>
            </div>
            <span className="badge text-bg-light border">Sistema online</span>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre del vino</th>
                  <th>Bodega</th>
                  <th>Cepa</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {vinos.length > 0 ? (
                  vinos.map((vino) => (
                    <tr key={vino.id}>
                      <td>#{vino.id}</td>
                      <td className="fw-bold">{vino.nombre}</td>
                      <td>{vino.bodega}</td>
                      <td>{vino.cepa}</td>
                      <td>${vino.precio_venta}</td>
                      <td>
                        <span className={`badge ${vino.stock_actual <= 5 ? 'bg-danger' : 'bg-success'}`}>
                          {vino.stock_actual} botellas
                        </span>
                      </td>
                      <td>
                        <span className="badge text-bg-light border">{vino.estado}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay vinos registrados en la base de datos.
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

export default Dashboard;
