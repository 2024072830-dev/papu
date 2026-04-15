import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Catalogo from './pages/Catalogo';
import Inventario from './pages/Inventario';
import Proveedores from './pages/Proveedores';
import Bitacora from './pages/Bitacora';
import GestionUsuarios from './pages/GestionUsuarios';
import PerfilUsuario from './pages/PerfilUsuario';
import ReporteInventarioFisico from './pages/ReporteInventarioFisico';
import ReporteVentasVinos from './pages/ReporteVentasVinos';
import ConfiguracionSistema from './pages/ConfiguracionSistema';
import BackupsDatabase from './pages/BackupsDatabase';
import { estaAutenticado, getUsuario, tieneRol } from './utils/auth';

function App() {
  const usuario = getUsuario();
  const esAdmin = tieneRol('Administrador');
  const esSupervisor = tieneRol('Administrador', 'Sommelier');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/*" element={
          estaAutenticado() ? (
            <div className="container-fluid p-0">
              <div className="row g-0">
                <div className="col-md-2 d-none d-md-block">
                  <Sidebar />
                </div>
                <div className="col-md-10 app-content" style={{ height: '100vh', overflowY: 'auto' }}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/catalogo" element={esSupervisor ? <Catalogo /> : <Navigate to="/inventario" />} />
                    <Route path="/inventario" element={<Inventario />} />
                    <Route path="/reportes/inventario-fisico" element={esSupervisor ? <ReporteInventarioFisico /> : <Navigate to="/inventario" />} />
                    <Route path="/reportes/ventas-vinos" element={esSupervisor ? <ReporteVentasVinos /> : <Navigate to="/inventario" />} />
                    <Route path="/perfil" element={<PerfilUsuario />} />
                    <Route path="/proveedores" element={esSupervisor ? <Proveedores /> : <Navigate to="/inventario" />} />
                    <Route path="/bitacora" element={esSupervisor ? <Bitacora /> : <Navigate to="/inventario" />} />
                    <Route path="/usuarios" element={esAdmin ? <GestionUsuarios /> : <Navigate to="/inventario" />} />
                    <Route path="/configuracion" element={esAdmin ? <ConfiguracionSistema /> : <Navigate to="/inventario" />} />
                    <Route path="/backups" element={esAdmin ? <BackupsDatabase /> : <Navigate to="/inventario" />} />
                    <Route path="/acerca-de" element={
                      <div className="p-5">
                        <h2 style={{ color: '#2b2d6e' }}>Sistema Web Orientado a Servicios</h2>
                        <h4 className="text-muted">Restaurante "La Costera 28"</h4>
                        <p className="text-muted">Sesión activa: {usuario?.nombre} ({usuario?.rol})</p>
                        <hr />
                        <h5>Integrantes del Equipo:</h5>
                        <ul>
                          <li>Fabián Hernández Ceja</li>
                          <li>Johanan Guerrero Alvarado</li>
                        </ul>
                      </div>
                    } />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </div>
              </div>
            </div>
          ) : (
            <Navigate to="/" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
