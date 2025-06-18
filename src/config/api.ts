import { config } from './env';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${config.API_URL}/auth/login`,
    FORGOT_PASSWORD: `${config.API_URL}/auth/forgot-password`,
    VERIFY_RESET_CODE: `${config.API_URL}/auth/verify-reset-code`,
    RESET_PASSWORD: `${config.API_URL}/auth/reset-password`,
  },
  // Users
  USERS: {
    CURRENT: `${config.API_URL}/users/current`,
    BASE: `${config.API_URL}/users`,
    AVAILABLE_COLABORADORES: `${config.API_URL}/users/available-colaboradores`,
  },
  // Roles
  ROLES: {
    BASE: `${config.API_URL}/roles`,
  },
  // Areas
  AREAS: {
    BASE: `${config.API_URL}/areas`,
  },
  // Colaboradores
  COLABORADORES: {
    BASE: `${config.API_URL}/colaboradores`,
  },
  // Estudiantes
  ESTUDIANTES: {
    BASE: `${config.API_URL}/estudiantes`,
  },
  // Tipos
  TIPOS: {
    COLABORADOR: `${config.API_URL}/tiposcolaborador`,
    CONTRATO: `${config.API_URL}/tiposcontrato`,
  },
  // Evaluaciones
  EVALUACIONES: {
    BASE: `${config.API_URL}/evaluaciones`,
    PENDIENTES: `${config.API_URL}/evaluaciones/pendientes`,
    CRITERIOS: `${config.API_URL}/evaluaciones/criterios`,
  },
  // Dashboard
  DASHBOARD: {
    STATS: `${config.API_URL}/dashboard/stats`,
    RECENT_EVALUATIONS: `${config.API_URL}/dashboard/recent-evaluations`,
  },
  // Incidencias
  INCIDENCIAS: {
    BASE: `${config.API_URL}/incidencias`,
  },
  // Notificaciones
  NOTIFICACIONES: {
    USER: `${config.API_URL}/notificaciones/user`,
    READ: `${config.API_URL}/notificaciones/read`,
  },
  // Asignaciones
  ASIGNACIONES: {
    BASE: `${config.API_URL}/asignaciones`,
  },
};

// API Helper Functions
export const api = {
  get: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  post: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  put: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  delete: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
};

// Add debug logging
console.log('🔌 API Configuration loaded:', {
  environment: import.meta.env.MODE,
  baseUrl: config.BASE_URL,
  apiUrl: config.API_URL
}); 