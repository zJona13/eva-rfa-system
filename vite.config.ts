import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // Permite acceso desde cualquier IP (útil para pruebas en red local)
    port: 8080,  // Cambia el puerto del frontend
    proxy: mode === 'development' ? {
      '/api': 'http://localhost:3309', // Proxy para redirigir API al backend
    } : undefined,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  build: {
    sourcemap: true,
  },
}));
