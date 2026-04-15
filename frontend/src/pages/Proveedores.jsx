import { useEffect, useState } from 'react';
import { getToken, getUsuario } from '../utils/auth';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [formulario, setFormulario] = useState({
    empresa: '',
    contacto: '',
    telefono: '',
    correo: '',
    rfc: '',
    direccion: ''
  });
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const usuarioActual = getUsuario();

  const cargarProveedores = async () => {
    setError('');
    try {
      const respuesta = await fetch('http://localhost:3000/api/proveedores', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await respuesta.json();
      if (!respuesta.ok) {
        setError(data.mensaje || 'Error al cargar proveedores.');
        return;
      }
      setProveedores(data);
    } catch {
      setError('Error de conexión con el servidor.');
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const resetForm = () => {
    setFormulario({
      empresa: '',
      contacto: '',
      telefono: '',
      correo: '',
      rfc: '',
      direccion: ''
    });
    setEditandoId(null);
  };

  const guardarProveedor = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const url = editandoId 
      ? `http://localhost:3000/api/proveedores/${editandoId}`
      : 'http://localhost:3000/api/proveedores';
    
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const respuesta = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(formulario)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'Error al guardar proveedor.');
        return;
      }

      setMensaje(data.mensaje);
      resetForm();
      cargarProveedores();
    } catch {
      setError('Error de conexión con el servidor.');
    }
  };

  const cargarDatosParaEdicion = (proveedor) => {
    setFormulario({
      empresa: proveedor.empresa || '',
      contacto: proveedor.contacto || '',
      telefono: proveedor.telefono || '',
      correo: proveedor.correo || '',
      rfc: proveedor.rfc || '',
      direccion: proveedor.direccion || ''
    });
    setEditandoId(proveedor.id);
    setMensaje('');
    setError('');
  };

  const cambiarEstadoProveedor = async (id, estadoActual) => {
    setMensaje('');
    setError('');
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

    if (!window.confirm(`¿Estás seguro que deseas marcar este proveedor como ${nuevoEstado}?`)) return;

    try {
      const respuesta = await fetch(`http://localhost:3000/api/proveedores/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'Error al cambiar estado.');
        return;
      }

      setMensaje(data.mensaje);
      cargarProveedores();
    } catch {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Directorio de Proveedores</h2>
          <p className="text-muted mb-0">
            Administra la información de contacto y fiscal de los proveedores de tus vinos.
          </p>
        </div>
        <span className="badge text-bg-dark">
          Sesión actual: {usuarioActual?.nombre} ({usuarioActual?.rol})
        </span>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Formulario */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">{editandoId ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}</h5>
            {editandoId && (
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetForm}>
                Cancelar Edición
              </button>
            )}
          </div>
          
          <form onSubmit={guardarProveedor}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Empresa *</label>
                <input
                  type="text"
                  className="form-control"
                  name="empresa"
                  value={formulario.empresa}
                  onChange={handleChange}
                  placeholder="Nombre de la Bodega o Distribuidor"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Contacto *</label>
                <input
                  type="text"
                  className="form-control"
                  name="contacto"
                  value={formulario.contacto}
                  onChange={handleChange}
                  placeholder="Nombre de la persona contacto"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 555-1234"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  name="correo"
                  value={formulario.correo}
                  onChange={handleChange}
                  placeholder="ventas@bodega.com"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">RFC</label>
                <input
                  type="text"
                  className="form-control"
                  name="rfc"
                  value={formulario.rfc}
                  onChange={handleChange}
                  placeholder="Ej. BODE010101QW1"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  name="direccion"
                  value={formulario.direccion}
                  onChange={handleChange}
                  placeholder="Calle, Número, Colonia, Ciudad"
                />
              </div>
            </div>
            <div className="mt-4">
              <button type="submit" className={`btn ${editandoId ? 'btn-success' : 'btn-primary'}`}>
                {editandoId ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabla de Proveedores */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Empresa</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>RFC</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.length > 0 ? (
                  proveedores.map((prov) => (
                    <tr key={prov.id} className={prov.estado === 'Inactivo' ? 'table-light text-muted' : ''}>
                      <td className="fw-semibold">{prov.empresa}</td>
                      <td>
                        {prov.contacto} <br/>
                        <small className="text-muted">{prov.correo}</small>
                      </td>
                      <td>{prov.telefono || 'N/A'}</td>
                      <td>{prov.rfc || 'No registrado'}</td>
                      <td>
                        <span className={`badge ${prov.estado === 'Activo' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                          {prov.estado || 'Activo'}
                        </span>
                      </td>
                      <td className="text-end">
                         <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => cargarDatosParaEdicion(prov)}
                            title="Editar Datos"
                          >
                            Editar
                          </button>
                          <button 
                            className={`btn btn-sm ${prov.estado === 'Activo' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => cambiarEstadoProveedor(prov.id, prov.estado || 'Activo')}
                            title={prov.estado === 'Activo' ? "Dar de baja" : "Dar de alta"}
                          >
                            {prov.estado === 'Activo' ? 'Baja' : 'Alta'}
                          </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No hay proveedores registrados.
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

export default Proveedores;
