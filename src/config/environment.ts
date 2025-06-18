// Configuración de entorno para diferentes ambientes
const environment = {
  development: {
    API_URL: 'http://localhost:3309',
    BASE_URL: 'http://localhost:8080'
  },
  production: {
    API_URL: 'http://161.132.53.137:3309',
    BASE_URL: 'http://161.132.53.137:8080'
  }
};

const getEnvironment = () => {
  return import.meta.env.MODE === 'production' ? 'production' : 'development';
};

export const config = environment[getEnvironment()];
export const API_URL = config.API_URL;
export const BASE_URL = config.BASE_URL;

// Para facilidad de uso
export default config; 