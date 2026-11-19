# Aprendizajes

Temas, herramientas y código que estoy aprendiendo mientras construyo Calida. Cada documento explica **qué es**, **cómo se usa**, **lo que hay que saber** y **por qué aparece (o no) en este proyecto**.

La [guía 00](../docs/00-guia-de-proyecto.md) cuenta cómo se hace el proyecto, fase por fase. Esta carpeta explica las **piezas técnicas** que aparecen en el camino.

## Índice

| # | Tema | Categoría | ¿Se usa en Calida? |
|---|---|---|---|
| 01 | [Cookies](01-cookies.md) | Web / HTTP | Sí: guardan el id de la sesión (ADR-18). |
| 02 | [JWT](02-jwt.md) | Autenticación | No: se estudió y se descartó (ADR-18, lección L-04). |
| 03 | [Sesiones en el servidor](03-sesiones.md) | Autenticación | Sí: tabla `sesiones` + cookie con id aleatorio (ADR-18). |
| 04 | [Node.js](04-nodejs.md) | Backend / entorno | Sí: la API corre en Node (ADR-16). |
| 05 | [Express](05-express.md) | Backend / framework | Sí: rutas y middleware de la API (ADR-16). |
| 06 | [React](06-react.md) | Frontend / interfaces | Sí: toda la interfaz, con Vite y React Router (ADR-16). |

## Plantilla de cada documento

1. **El problema que resuelve:** por qué existe esta herramienta.
2. **Qué es:** una definición corta y una analogía.
3. **Cómo funciona:** el mecanismo, con ejemplos.
4. **Cómo se usa:** código real (Node, Express, React o SQL).
5. **Seguridad y errores comunes.**
6. **En Calida:** dónde aparece y qué decisión (ADR) lo justifica.
7. **Para practicar:** un ejercicio pequeño.
8. **Resumen:** lo mínimo que hay que recordar.
