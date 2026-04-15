import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { guardarSesion } from '../utils/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const respuesta = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        guardarSesion({ token: data.token, usuario: data.usuario });
        navigate('/dashboard');
      } else {
        setError(data.mensaje);
      }
    } catch {
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="login-shell">
      <aside className="login-side">
        <div className="login-side-content">
          <div className="status-pill mb-4">Cava operativa</div>
          <h1 className="display-5 mb-3">La Costera 28</h1>
          <p className="mb-4">
            Un panel elegante para administrar inventario, servicio y trazabilidad de cada botella.
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <div>
              <small className="d-block text-uppercase opacity-75">Enfoque</small>
              <strong>Control de inventario</strong>
            </div>
            <div>
              <small className="d-block text-uppercase opacity-75">Ambiente</small>
              <strong>Wine Bar / Restaurante</strong>
            </div>
          </div>
        </div>
      </aside>

      <section className="login-card-wrap">
        <div className="login-card">
          <div className="section-heading">
            <h3 className="mb-2">Iniciar sesion</h3>
            <p>Accede al sistema con tus credenciales para gestionar la cava.</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Correo electronico</label>
              <input
                type="email"
                className="form-control"
                placeholder="tu@lacostera.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Contrasena</label>
              <input
                type="password"
                className="form-control"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-3">
              Entrar al sistema
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/forgot-password" className="btn btn-link text-decoration-none">
              Recuperar contrasena
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
