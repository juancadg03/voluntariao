/**
 * Arma la aplicación de Express, sin ponerla a escuchar.
 *
 * Está separada de server.js para que las pruebas (Supertest) puedan
 * importar `app` y hacerle peticiones sin abrir un puerto de verdad.
 * Las rutas se agregan aquí: la primera será GET /api/salud (fase 3, paso 5).
 */
import express from "express";

export const app = express();

// Lee los cuerpos JSON de las peticiones y los deja en req.body.
app.use(express.json());
