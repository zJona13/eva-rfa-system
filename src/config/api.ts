// API Configuration
const isDevelopment = import.meta.env.DEV;

export const API_URL = isDevelopment 
  ? 'http://localhost:3309/api'
  : 'http://161.132.53.137:3309/api';

export const BASE_URL = isDevelopment
  ? 'http://localhost:8080'
  : 'http://161.132.53.137:8080';

// Log configuration for debugging
console.log('Environment:', isDevelopment ? 'Development' : 'Production');
console.log('API URL:', API_URL);
console.log('Base URL:', BASE_URL); 