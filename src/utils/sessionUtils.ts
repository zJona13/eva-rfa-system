
const API_BASE_URL = 'http://localhost:3306/api';

// Función para hacer requests autenticados con cookies de sesión
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Incluir cookies en todas las requests
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', errorData);
    throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
  }

  return response.json();
};

// Función para login con sesiones
export const loginWithSession = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      correo: email,
      contrasena: password
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }
  
  return data;
};

// Función para logout con sesiones
export const logoutWithSession = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.ok;
};

// Función para verificar sesión actual
export const checkSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false, user: null };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking session:', error);
    return { success: false, user: null };
  }
};
