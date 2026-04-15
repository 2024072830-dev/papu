import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const restablecer = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (nuevaPassword !== confirmacion) {
      setError('La confirmación de contraseña no coincide.');
      return;
    }

    try {
      const respuesta = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaPassword })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible restablecer la contraseña.');
        return;
      }

      setMensaje(data.mensaje);
      setTimeout(() => navigate('/'), 1800);
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4 border-0" style={{ width: '460px', borderRadius: '15px' }}>
        <h3 className="text-center mb-3" style={{ color: '#2b2d6e' }}>Restablecer Contraseña</h3>
        <p className="text-center text-muted mb-4">
          Ingresa el token de recuperación y tu nueva contraseña.
        </p>

        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={restablecer}>
          <div className="mb-3">
            <label className="form-label">Token de recuperación</label>
            <textarea
              className="form-control"
              rows="3"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Pega aquí el token generado"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              className="form-control"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn w-100 text-white mb-3" style={{ backgroundColor: '#2b2d6e' }}>
            Guardar nueva contraseña
          </button>
        </form>

        <div className="d-flex justify-content-between">
          <Link to="/forgot-password" className="btn btn-link p-0">Solicitar token</Link>
          <Link to="/" className="btn btn-link p-0">Volver al login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
