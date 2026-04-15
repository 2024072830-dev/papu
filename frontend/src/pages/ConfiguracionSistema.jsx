import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

const ConfiguracionSistema = () => {
  const [formulario, setFormulario] = useState({
    nombre_restaurante: '',
    moneda: 'MXN',
    stock_minimo_default: 5,
    dias_expiracion_recuperacion: 1,
    permitir_registro_publico: false
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargarConfiguracion = async () => {
    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch('http://localhost:3000/api/configuracion', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible cargar la configuracion.');
        setCargando(false);
        return;
      }

      setFormulario({
        nombre_restaurante: data.nombre_restaurante ?? '',
        moneda: data.moneda ?? 'MXN',
        stock_minimo_default: data.stock_minimo_default ?? 5,
        dias_expiracion_recuperacion: data.dias_expiracion_recuperacion ?? 1,
        permitir_registro_publico: Boolean(data.permitir_registro_publico)
      });
      setCargando(false);
    } catch {
      setError('No se pudo conectar con el servidor.');
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const guardarConfiguracion = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const respuesta = await fetch('http://localhost:3000/api/configuracion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(formulario)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible guardar la configuracion.');
        return;
      }

      setMensaje(data.mensaje);
      setFormulario({
        nombre_restaurante: data.configuracion.nombre_restaurante,
        moneda: data.configuracion.moneda,
        stock_minimo_default: data.configuracion.stock_minimo_default,
        dias_expiracion_recuperacion: data.configuracion.dias_expiracion_recuperacion,
        permitir_registro_publico: data.configuracion.permitir_registro_publico
      });
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="mb-1">Configuracion de Parametros del Sistema</h2>
        <p className="text-muted mb-0">
          Administra los valores globales que afectan el funcionamiento general del sistema.
        </p>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {cargando ? (
            <p className="text-muted mb-0">Cargando configuracion...</p>
          ) : (
            <form onSubmit={guardarConfiguracion}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre del restaurante</label>
                  <input
                    className="form-control"
                    value={formulario.nombre_restaurante}
                    onChange={(e) => setFormulario({ ...formulario, nombre_restaurante: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Moneda</label>
                  <select
                    className="form-select"
                    value={formulario.moneda}
                    onChange={(e) => setFormulario({ ...formulario, moneda: e.target.value })}
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Stock minimo por defecto</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formulario.stock_minimo_default}
                    onChange={(e) => setFormulario({ ...formulario, stock_minimo_default: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Dias de vigencia para recuperar contraseña</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formulario.dias_expiracion_recuperacion}
                    onChange={(e) => setFormulario({ ...formulario, dias_expiracion_recuperacion: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-8 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="registroPublico"
                      checked={formulario.permitir_registro_publico}
                      onChange={(e) => setFormulario({ ...formulario, permitir_registro_publico: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="registroPublico">
                      Permitir registro publico de usuarios
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button type="submit" className="btn btn-primary">
                  Guardar configuracion
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionSistema;
