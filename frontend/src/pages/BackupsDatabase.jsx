import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

const formatearTamano = (bytes) => {
  const valor = Number(bytes || 0);
  if (valor < 1024) return `${valor} B`;
  if (valor < 1024 * 1024) return `${(valor / 1024).toFixed(1)} KB`;
  return `${(valor / (1024 * 1024)).toFixed(2)} MB`;
};

const BackupsDatabase = () => {
  const [backups, setBackups] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);

  const cargarBackups = async () => {
    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch('http://localhost:3000/api/backups', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.mensaje || 'No fue posible cargar los respaldos.');
        setCargando(false);
        return;
      }

      setBackups(data.backups || []);
      setCargando(false);
    } catch {
      setError('No se pudo conectar con el servidor.');
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarBackups();
  }, []);

  const generarBackup = async () => {
    setMensaje('');
    setError('');
    setGenerando(true);

    try {
      const respuesta = await fetch('http://localhost:3000/api/backups', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.detalle ? `${data.mensaje} ${data.detalle}` : (data.mensaje || 'No fue posible generar el respaldo.'));
        setGenerando(false);
        return;
      }

      setMensaje(data.mensaje);
      await cargarBackups();
      setGenerando(false);
    } catch {
      setError('No se pudo conectar con el servidor.');
      setGenerando(false);
    }
  };

  const descargarBackup = async (nombre) => {
    setMensaje('');
    setError('');

    try {
      const respuesta = await fetch(`http://localhost:3000/api/backups/${encodeURIComponent(nombre)}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!respuesta.ok) {
        const data = await respuesta.json();
        setError(data.mensaje || 'No fue posible descargar el respaldo.');
        return;
      }

      const blob = await respuesta.blob();
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo descargar el archivo.');
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Gestion de Respaldos</h2>
          <p className="text-muted mb-0">
            Genera y descarga respaldos SQL de la base de datos PostgreSQL.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={generarBackup} disabled={generando}>
          {generando ? 'Generando...' : 'Generar respaldo'}
        </button>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {cargando ? (
            <p className="text-muted mb-0">Cargando respaldos...</p>
          ) : backups.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Archivo</th>
                    <th>Tamaño</th>
                    <th>Creado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr key={backup.nombre}>
                      <td className="fw-semibold">{backup.nombre}</td>
                      <td>{formatearTamano(backup.tamano_bytes)}</td>
                      <td>{new Date(backup.fecha_creacion).toLocaleString()}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => descargarBackup(backup.nombre)}
                        >
                          Descargar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">Aun no existen respaldos generados en el sistema.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupsDatabase;
