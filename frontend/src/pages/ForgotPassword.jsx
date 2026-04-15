import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [tokenRecuperacion, setTokenRecuperacion] = useState('');

  const solicitarRecuperacion = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setTokenRecuperacion('');

    try {
      const respuesta = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible procesar la solicitud.');
        return;
      }

      setMensaje(data.mensaje);
      if (data.token_recuperacion) {
        setTokenRecuperacion(data.token_recuperacion);
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4 border-0" style={{ width: '460px', borderRadius: '15px' }}>
        <h3 className="text-center mb-3" style={{ color: '#2b2d6e' }}>Recuperar Contraseña</h3>
        <p className="text-center text-muted mb-4">
          Escribe tu correo y generaremos un token temporal de recuperación.
        </p>

        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={solicitarRecuperacion}>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@lacostera.com"
              required
            />
          </div>

          <button type="submit" className="btn w-100 text-white mb-3" style={{ backgroundColor: '#2b2d6e' }}>
            Generar token de recuperación
          </button>
        </form>

        {tokenRecuperacion && (
          <div className="alert alert-warning">
            <strong>Token de prueba:</strong>
            <div className="mt-2 small" style={{ wordBreak: 'break-all' }}>{tokenRecuperacion}</div>
          </div>
        )}

        <div className="d-flex justify-content-between">
          <Link to="/" className="btn btn-link p-0">Volver al login</Link>
          <Link to="/reset-password" className="btn btn-link p-0">Ya tengo token</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
