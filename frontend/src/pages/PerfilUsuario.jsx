import { useEffect, useState } from 'react';
import { getToken, getUsuario, guardarUsuario } from '../utils/auth';

const PerfilUsuario = () => {
  const [usuarioVista, setUsuarioVista] = useState(getUsuario());
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    rol: '',
    passwordActual: '',
    nuevaPassword: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const respuesta = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
          setError(data.mensaje || 'No fue posible cargar el perfil.');
          return;
        }

        setFormulario((prev) => ({
          ...prev,
          nombre: data.usuario.nombre,
          email: data.usuario.email,
          rol: data.usuario.rol
        }));
      } catch {
        setError('No se pudo conectar con el servidor.');
      }
    };

    cargarPerfil();
  }, []);

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const respuesta = await fetch('http://localhost:3000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          nombre: formulario.nombre,
          email: formulario.email,
          passwordActual: formulario.passwordActual,
          nuevaPassword: formulario.nuevaPassword
        })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible actualizar el perfil.');
        return;
      }

      guardarUsuario(data.usuario);
      setUsuarioVista(data.usuario);
      setMensaje(data.mensaje);
      setFormulario((prev) => ({
        ...prev,
        nombre: data.usuario.nombre,
        email: data.usuario.email,
        rol: data.usuario.rol,
        passwordActual: '',
        nuevaPassword: ''
      }));
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="mb-1">Mi Perfil</h2>
        <p className="text-muted mb-0">
          Actualiza tus datos de acceso y tu información personal.
        </p>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <form onSubmit={guardarPerfil}>
                <div className="mb-3">
                  <label className="form-label">Nombre completo</label>
                  <input
                    className="form-control"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formulario.email}
                    onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Rol asignado</label>
                  <input className="form-control bg-light" value={formulario.rol} disabled />
                </div>

                <hr />

                <h6 className="mb-3">Cambiar contraseña</h6>

                <div className="mb-3">
                  <label className="form-label">Contraseña actual</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formulario.passwordActual}
                    onChange={(e) => setFormulario({ ...formulario, passwordActual: e.target.value })}
                    placeholder="Solo si deseas cambiarla"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Nueva contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formulario.nuevaPassword}
                    onChange={(e) => setFormulario({ ...formulario, nuevaPassword: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Guardar cambios
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5 mt-4 mt-lg-0">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">Resumen de la sesión</h5>
              <p className="mb-2"><strong>Usuario:</strong> {usuarioVista?.nombre || formulario.nombre}</p>
              <p className="mb-2"><strong>Correo:</strong> {usuarioVista?.email || formulario.email}</p>
              <p className="mb-0"><strong>Rol:</strong> {usuarioVista?.rol || formulario.rol}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
