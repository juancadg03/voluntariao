/**
 * Configuración de Vite, el servidor de desarrollo y empaquetador de la interfaz.
 *
 * El proxy hace que, en desarrollo, una petición a /api/... desde el navegador
 * (puerto 5173) llegue a la API (puerto 3000). Así el navegador cree que todo
 * viene del mismo sitio: no hace falta CORS y la cookie de sesión funciona
 * igual que en producción, donde vercel.json hace lo mismo (docs/04 §8).
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
