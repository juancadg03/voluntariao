# 05 · Express

**Categoría:** Backend / framework · **Se usa en Calida:** sí, es la base de la API ([04 · §3](../docs/04-arquitectura.md), ADR-16)

> Lee antes [04 · Node.js](04-nodejs.md).

---

## 1. ¿Qué es?

**Express** es una librería para Node que facilita crear servidores web y APIs. Por debajo usa el módulo `http` de Node, pero resuelve lo repetitivo: dirigir cada petición a su función, leer parámetros y cuerpos JSON, y responder.

Es **minimalista**: trae lo básico y el resto se agrega con piezas pequeñas llamadas *middleware*. Es el framework de backend más usado en Node. Calida usa **Express 5**.

> **Analogía:** Node es la cocina con estufa y nevera. Express es la organización de la cocina: qué pedido va a qué cocinero y en qué orden pasa por cada estación.

## 2. Los cuatro conceptos

### 2.1 La aplicación

```js
import express from 'express';
const app = express();
app.listen(3000);                        // escucha en el puerto 3000
```

### 2.2 Rutas: método + camino + función

```js
app.get('/api/iniciativas', (req, res) => { ... });       // leer
app.post('/api/iniciativas', (req, res) => { ... });      // crear
app.patch('/api/iniciativas/:id', (req, res) => { ... }); // modificar
app.delete('/api/cuentas/sesion', (req, res) => { ... }); // borrar
```

`:id` es un **parámetro**: en `/api/iniciativas/42`, el valor llega en `req.params.id` como el texto `'42'`.

### 2.3 `req` y `res`: la petición y la respuesta

| `req` (lo que llega) | Ejemplo |
|---|---|
| `req.params` | `/api/iniciativas/42` → `{ id: '42' }` |
| `req.query` | `/api/iniciativas?categoria=3` → `{ categoria: '3' }` |
| `req.body` | El JSON enviado en un POST (requiere `express.json()`). |
| `req.cookies` | Las cookies (requiere `cookie-parser`). |

| `res` (lo que se responde) | Para qué |
|---|---|
| `res.json(objeto)` | Responder JSON (código 200 por defecto). |
| `res.status(201).json(...)` | Elegir el código HTTP. |
| `res.status(204).end()` | Responder sin cuerpo. |
| `res.cookie(...)` / `res.clearCookie(...)` | Crear o borrar cookies. |

### 2.4 Middleware: la cadena de funciones

Un **middleware** es una función que recibe `(req, res, next)` y se ejecuta **antes** de la ruta. Puede hacer tres cosas:

1. Agregar información a `req`, por ejemplo `req.usuario`.
2. **Responder y cortar la cadena**, por ejemplo con un 401 si no hay sesión.
3. Llamar a `next()` para pasar a lo siguiente.

```
Petición → express.json() → cookieParser() → cargarSesion → exigirRol('voluntario') → ruta → Respuesta
                                                                 │
                                                                 └─ si no es voluntario: 403 y se corta
```

```js
app.use(express.json());                     // para TODAS las peticiones
app.get('/api/inscripciones/mias', exigirRol('voluntario'), listarMias);   // solo para esta ruta
```

**El orden importa:** Express ejecuta los middleware en el orden en que los escribes. Si `cargarSesion` va después de las rutas, las rutas nunca ven a `req.usuario`.

## 3. Ejemplo completo

El mismo servidor de [04 · Node.js §5](04-nodejs.md), pero con Express y con más funciones:

```js
import express from 'express';

const app = express();
app.use(express.json());                       // middleware: convierte el cuerpo JSON en req.body

// Middleware propio: se ejecuta en TODAS las peticiones
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();                                       // pasa a lo siguiente
});

const iniciativas = [{ id: 1, titulo: 'Jornada de limpieza' }];

app.get('/api/iniciativas', (req, res) => {
  res.json(iniciativas);
});

app.get('/api/iniciativas/:id', (req, res) => {
  const iniciativa = iniciativas.find((i) => i.id === Number(req.params.id));
  if (!iniciativa) return res.status(404).json({ error: 'No existe' });
  res.json(iniciativa);
});

app.post('/api/iniciativas', (req, res) => {
  if (!req.body.titulo) return res.status(400).json({ error: 'Falta el título' });
  const nueva = { id: iniciativas.length + 1, titulo: req.body.titulo };
  iniciativas.push(nueva);
  res.status(201).json(nueva);
});

app.get('/api/error', async () => {
  throw new Error('Algo se rompió');            // Express 5 lo envía al manejador de errores
});

// Manejador de errores: 4 parámetros, va AL FINAL
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Error interno' });
});

app.listen(3002, () => console.log('http://localhost:3002'));
```

Probado con `curl`:

```
GET  /api/iniciativas            → [{"id":1,"titulo":"Jornada de limpieza"}]
GET  /api/iniciativas/1          → {"id":1,"titulo":"Jornada de limpieza"}
GET  /api/iniciativas/9          → {"error":"No existe"}              (404)
POST /api/iniciativas {"titulo":"Donar ropa"} → {"id":2,"titulo":"Donar ropa"}   (201)
POST /api/iniciativas {}         → {"error":"Falta el título"}        (400)
GET  /api/error                  → {"error":"Error interno"}          (500)
```

**Detalles a notar:**
- `return res.status(404)...`: el `return` evita que el código siga y responda dos veces. Responder dos veces es un error común (*"Cannot set headers after they are sent"*).
- `Number(req.params.id)`: los parámetros siempre llegan como **texto**.
- El **manejador de errores** se reconoce porque tiene **4 parámetros**. En Express 5, si una función `async` lanza un error, este llega solo al manejador. En Express 4 había que atraparlo a mano.
- El manejador responde un mensaje genérico. El detalle del error solo va al log, para no revelar información interna.

## 4. Organizar el código: `Router`

Con muchas rutas, cada módulo tiene su propio archivo con un `Router`, que funciona como una mini aplicación:

```js
// backend/src/rutas/iniciativas.js
import { Router } from 'express';
const router = Router();
router.get('/', listar);
router.get('/:id', detalle);
router.post('/', exigirRol('organizacion', 'ciudadano'), crear);
export default router;

// backend/src/app.js
import rutasIniciativas from './rutas/iniciativas.js';
app.use('/api/iniciativas', rutasIniciativas);   // todas quedan bajo /api/iniciativas
```

## 5. En Calida

| Qué | Dónde |
|---|---|
| Capas: rutas y controladores → servicios → repositorios. Express solo vive en la primera capa. | [04 · §3.1 y §5](../docs/04-arquitectura.md) |
| Lista de rutas de la API. | [04 · §5.2](../docs/04-arquitectura.md) |
| Middleware: `cargarSesion`, `exigirRol`, límite de peticiones, errores. | [04 · §5.3](../docs/04-arquitectura.md), [03 · Sesiones](03-sesiones.md) |
| `app.js` arma la aplicación y `server.js` la arranca. Así las pruebas importan `app.js` sin abrir un puerto. | [04 · §5.3](../docs/04-arquitectura.md) |
| Paquetes que se agregan: `cookie-parser`, `express-rate-limit`, `helmet`, `multer`. | [04 · §4 y §7](../docs/04-arquitectura.md) |

**Regla de Calida:** los **servicios no conocen Express**. No reciben `req` ni `res`, solo datos. Así las reglas de negocio se pueden probar sin servidor, y si algún día cambiáramos Express por otra cosa, los servicios no se tocarían.

## 6. Para practicar (10 minutos)

1. En una carpeta fuera del proyecto: `npm init -y`, `npm pkg set type=module` y `npm install express`.
2. Copia el ejemplo de la sección 3 en `index.js` y ejecútalo con `node --watch index.js`.
3. Prueba las rutas con `curl` o con el navegador (las de tipo GET):
   ```bash
   curl localhost:3002/api/iniciativas
   curl -H 'Content-Type: application/json' -d '{"titulo":"Donar ropa"}' localhost:3002/api/iniciativas
   ```
4. Mira la terminal del servidor: el middleware de log imprime cada petición.
5. Mueve el middleware de log **debajo** de las rutas y repite. ¿Qué pasa? (Para las rutas que existen ya no imprime nada: responden sin llamar a `next()`, así que la petición nunca llega al log. Solo lo verás con una ruta inexistente, como `/otra`.)

## 7. Resumen

- Express = librería sobre Node para crear APIs sin pelear con `http` a mano.
- **Ruta** = método HTTP + camino + función `(req, res)`.
- `req.params`, `req.query` y `req.body` traen los datos; `res.status().json()` responde.
- **Middleware** = función `(req, res, next)` que corre antes de la ruta. **El orden importa.**
- El manejador de errores tiene 4 parámetros y va al final.
- En Calida, Express solo vive en la capa de rutas. Los servicios no saben que existe.
