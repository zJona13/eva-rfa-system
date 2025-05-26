
const API_BASE_URL = 'http://localhost:3306/api';

// Función para obtener el token OAuth
export const getOAuthToken = () => {
  return localStorage.getItem('oauth_access_token');
};

// Función para verificar si el token ha expirado
export const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('oauth_expires_at');
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt);
};

// Función para refrescar el token
export const refreshToken = async () => {
  const refresh_token = localStorage.getItem('oauth_refresh_token');
  if (!refresh_token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      localStorage.setItem('oauth_access_token', data.access_token);
      localStorage.setItem('oauth_refresh_token', data.refresh_token);
      localStorage.setItem('oauth_expires_at', (Date.now() + (data.expires_in * 1000)).toString());
      return true;
    } else {
      console.error('Error refreshing token:', data);
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Función para hacer requests autenticados
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  let token = getOAuthToken();
  
  if (!token) {
    throw new Error('No OAuth token available');
  }

  if (isTokenExpired()) {
    console.log('Token expired, attempting to refresh...');
    const refreshed = await refreshToken();
    if (!refreshed) {
      throw new Error('OAuth token expired and refresh failed');
    }
    token = getOAuthToken();
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error:', errorData);
    throw new Error(`Error ${response.status}: ${errorData.error_description || response.statusText}`);
  }

  return response.json();
};
