# Voluntariao

Módulo público de voluntariado en Colombia con Next.js y TypeScript. Para ejecutarlo con Node 24, usa `npm ci` y `npm run dev`. Abre http://localhost:3000. Para verificarlo ejecuta `npm run typecheck` y `npm run build`.

Para ejecutar el entorno React/Vite y Express del monorepo, detén Next.js y usa `npm run dev:monorepo`. El frontend de Vite abre en http://localhost:5173 y Express usa el puerto 3000.

## Integración entre desarrolladores

El contrato propuesto está en `src/lib/publico.types.ts`. El explorador y el detalle usan las mismas consultas que las rutas públicas. El adaptador `src/lib/publico.ts` contiene tres iniciativas ficticias con fechas relativas. Al conectar la base de datos, sustituir esas consultas y mantener la exclusión de borradores y de datos privados en el servidor.

| Operación                             | Resultado                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| GET /api/iniciativas                  | ListaIniciativas. Admite ciudad, categoria y fecha combinables, con fecha local de Colombia.                                   |
| GET /api/iniciativas/:id              | DetalleIniciativa o 404.                                                                                                       |
| POST /api/participaciones (pendiente) | Recibe SolicitudParticipacion sin sesión y devuelve SolicitudRecibida con 201. Un recurso o jornada cerrada debe devolver 409. |

El Desarrollador 1 mantiene las pantallas y lecturas públicas. El Desarrollador 2 implementa la sesión de organizador, persistencia y gestión de iniciativas y solicitudes. La suscripción a novedades es opcional e independiente de cada participación. Antes de conectar escrituras, ambos deben revisar estados, cantidades y códigos de respuesta.
