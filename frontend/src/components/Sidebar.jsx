// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { getUsuario, limpiarSesion, tieneRol } from '../utils/auth';

const Sidebar = () => {
  const location = useLocation();
  const usuario = getUsuario();
  const esAdmin = tieneRol('Administrador');
  const esSupervisor = tieneRol('Administrador', 'Sommelier');

  const cerrarSesion = () => {
    limpiarSesion();
    window.location.href = '/';
  };

  return (
    <div className="sidebar-custom p-3">
      <div className="sidebar-brand">
        <h3>La Costera 28</h3>
        <p>Cava, servicio y control de inventario</p>
      </div>
      <div className="sidebar-user">
        <small className="text-white-50 d-block">{usuario?.nombre || 'Usuario'}</small>
        <span className="badge text-bg-light">{usuario?.rol || 'Sin rol'}</span>
      </div>
      <nav>
        <Link 
          to="/dashboard" 
          className={`nav-link-custom ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          Panel de Control
        </Link>
        
        {esSupervisor && <Link to="/catalogo" className="nav-link-custom">Catalogo de Vinos</Link>}
        <Link to="/inventario" className="nav-link-custom">Inventario</Link>
        {esSupervisor && <Link to="/proveedores" className="nav-link-custom">Proveedores</Link>}
        {esSupervisor && <Link to="/bitacora" className="nav-link-custom">Bitacora</Link>}
        {esSupervisor && <Link to="/reportes/inventario-fisico" className="nav-link-custom">Reporte Inventario PDF</Link>}
        {esSupervisor && <Link to="/reportes/ventas-vinos" className="nav-link-custom">Reporte Ventas Excel</Link>}
        {esAdmin && <Link to="/usuarios" className="nav-link-custom">Usuarios y Roles</Link>}
        {esAdmin && <Link to="/configuracion" className="nav-link-custom">Configuracion Sistema</Link>}
        {esAdmin && <Link to="/backups" className="nav-link-custom">Respaldos BD</Link>}
        <Link to="/perfil" className="nav-link-custom">Mi Perfil</Link>
        <hr className="text-white opacity-50" />
        <Link to="/acerca-de" className="nav-link-custom">Acerca de</Link>
        <button type="button" className="btn btn-outline-light btn-sm mt-3 w-100" onClick={cerrarSesion}>
          Cerrar sesion
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
