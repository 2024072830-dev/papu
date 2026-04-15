export const getToken = () => localStorage.getItem('token');

export const getUsuario = () => {
  const usuarioGuardado = localStorage.getItem('usuario');

  if (!usuarioGuardado) {
    return null;
  }

  try {
    return JSON.parse(usuarioGuardado);
  } catch {
    return null;
  }
};

export const guardarSesion = ({ token, usuario }) => {
  if (token) {
    localStorage.setItem('token', token);
  }

  if (usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
};

export const guardarUsuario = (usuario) => {
  if (usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
};

export const limpiarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

export const estaAutenticado = () => getToken() !== null;

export const tieneRol = (...roles) => {
  const usuario = getUsuario();
  return Boolean(usuario && roles.includes(usuario.rol));
};
