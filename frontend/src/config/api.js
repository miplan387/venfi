/**
 * Configuración dinámica de API para Venfidata
 * - En Producción (Firebase Hosting / Cloud Run): Las rutas relativas '/api/...' son redirigidas
 *   automáticamente por firebase.json hacia el microservicio en Cloud Run.
 * - En Desarrollo: Vite Proxy redirige '/api' hacia http://localhost:5000.
 * - Opcionalmente se puede configurar VITE_API_URL en .env para entornos externos (ej. Flutter Web).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiUrl = (path) => {
  if (!path) return API_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export const apiFetch = async (path, options = {}) => {
  const url = apiUrl(path);
  try {
    return await fetch(url, options);
  } catch (err) {
    // Si falla la ruta relativa y estamos en localhost, intentar fallback directo al puerto 5000
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && !url.includes(':5000')) {
      const fallbackUrl = `http://localhost:5000${path.startsWith('/') ? path : `/${path}`}`;
      return await fetch(fallbackUrl, options);
    }
    throw err;
  }
};

export default apiFetch;

