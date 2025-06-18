const ENV = {
  development: {
    API_URL: 'http://localhost:3309/api',
    BASE_URL: 'http://localhost:3309',
    FRONTEND_URL: 'http://localhost:8080',
  },
  production: {
    API_URL: 'http://161.132.53.137:3309/api',
    BASE_URL: 'http://161.132.53.137:3309',
    FRONTEND_URL: 'http://161.132.53.137:8080',
  }
};

const currentEnv = import.meta.env.MODE || 'development';
export const config = ENV[currentEnv as keyof typeof ENV];

// Add debug logging
console.log('🌍 Current environment:', currentEnv);
console.log('🔗 API URL:', config.API_URL);
console.log('🌐 Frontend URL:', config.FRONTEND_URL); 