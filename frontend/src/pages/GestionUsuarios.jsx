import { useEffect, useState } from 'react';
import { getToken, getUsuario } from '../utils/auth';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Mesero'
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const usuarioActual = getUsuario();

  const cargarUsuarios = async () => {
    setError('');

    try {
      const respuesta = await fetch('http://localhost:3000/api/usuarios', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible cargar los usuarios.');
        return;
      }

      setUsuarios(data);
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const registrarUsuario = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const respuesta = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(formulario)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible registrar el usuario.');
        return;
      }

      setMensaje(data.mensaje);
      setFormulario({
        nombre: '',
        email: '',
        password: '',
        rol: 'Mesero'
      });
      setUsuarios((prevUsuarios) => [data.usuario, ...prevUsuarios]);
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  const actualizarUsuario = async (id, cambios) => {
    setMensaje('');
    setError('');

    try {
      const respuesta = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(cambios)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible actualizar el usuario.');
        return;
      }

      setMensaje(data.mensaje);
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((usuario) =>
          usuario.id === id ? data.usuario : usuario
        )
      );
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Gestión de Roles y Permisos</h2>
          <p className="text-muted mb-0">
            Asigna roles y controla qué usuarios pueden acceder al sistema.
          </p>
        </div>
        <span className="badge text-bg-dark">
          Sesión actual: {usuarioActual?.nombre} ({usuarioActual?.rol})
        </span>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-3">Registrar Nuevo Usuario</h5>
          <form onSubmit={registrarUsuario}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Nombre completo</label>
                <input
                  className="form-control"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  value={formulario.email}
                  onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                  placeholder="usuario@lacostera.com"
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={formulario.rol}
                  onChange={(e) => setFormulario({ ...formulario, rol: e.target.value })}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Sommelier">Sommelier</option>
                  <option value="Mesero">Mesero</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={formulario.password}
                  onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                  placeholder="Min. 6 caracteres"
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary">
                Registrar Usuario
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="fw-semibold">{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td style={{ width: '180px' }}>
                        <select
                          className="form-select"
                          value={usuario.rol}
                          onChange={(e) =>
                            actualizarUsuario(usuario.id, { rol: e.target.value })
                          }
                        >
                          <option value="Administrador">Administrador</option>
                          <option value="Sommelier">Sommelier</option>
                          <option value="Mesero">Mesero</option>
                        </select>
                      </td>
                      <td>
                        <span className="badge text-bg-success">Activo</span>
                      </td>
                      <td className="text-end text-muted">
                        Cambio de rol disponible
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No hay usuarios registrados para administrar.
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

export default GestionUsuarios;
