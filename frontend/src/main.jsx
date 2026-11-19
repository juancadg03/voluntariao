/**
 * Punto de entrada de la interfaz: monta React en el <div id="raiz"> de index.html.
 *
 * Más adelante aquí van React Router (las rutas de cada pantalla) y el
 * contexto de sesión (docs/04 §5).
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";

createRoot(document.getElementById("raiz")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
