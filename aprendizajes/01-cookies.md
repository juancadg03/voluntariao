# 01 · Cookies

**Categoría:** Web / HTTP · **Se usa en Calida:** sí, para la sesión ([04 · §7.1](../docs/04-arquitectura.md), ADR-18)

---

## 1. El problema: HTTP no tiene memoria

HTTP es el protocolo con el que el navegador y el servidor se hablan. Es **sin estado** (*stateless*): cada petición llega sola, y el servidor no recuerda nada de las anteriores.

```
Petición 1:  POST /api/cuentas/sesion   {correo, contraseña}   → "Bienvenido, Ana"
Petición 2:  GET  /api/inscripciones/mias                       → "¿Y tú quién eres?"
```

Para que la petición 2 funcione, el navegador tiene que **demostrar en cada petición** que es la misma persona que inició sesión. La cookie es la forma estándar de llevar esa prueba.

## 2. ¿Qué es una cookie?

Es un dato pequeño (nombre y valor) que **el servidor le pide al navegador que guarde**. Desde ese momento, el navegador **lo envía solo** en cada petición a ese sitio.

> **Analogía:** la manilla de un evento. En la entrada te la ponen una vez (login) y después solo la muestras en cada puerta. No vuelves a dar tu cédula.

Lo importante:
- **La crea el servidor**, con la cabecera `Set-Cookie`.
- **La guarda el navegador**, separada por sitio.
- **El navegador la devuelve automáticamente**, con la cabecera `Cookie`. Tu código de React no tiene que hacer nada.

## 3. Cómo funciona por dentro

Así se ven las cabeceras HTTP reales:

```http
# 1) Login: el navegador envía las credenciales
POST /api/cuentas/sesion HTTP/1.1
Content-Type: application/json

{"correo":"ana@ejemplo.com","contrasena":"********"}

# 2) El servidor responde y pide guardar una cookie
HTTP/1.1 200 OK
Set-Cookie: sesion=9f2c4a...e1; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800

# 3) En cada petición siguiente, el navegador la devuelve sola
GET /api/inscripciones/mias HTTP/1.1
Cookie: sesion=9f2c4a...e1
```

El servidor lee `sesion=9f2c4a...e1`, busca ese id en su base de datos y sabe que es Ana.

## 4. Atributos de una cookie

Además del nombre y el valor, `Set-Cookie` lleva **atributos** que controlan cómo se comporta la cookie. Son la parte más importante de entender.

| Atributo | Qué hace | Valor en Calida |
|---|---|---|
| `Max-Age` / `Expires` | Cuánto dura. `Max-Age` va en segundos. Sin ninguno de los dos, la cookie se borra al cerrar el navegador (*cookie de sesión del navegador*). | `604800` (7 días) |
| `Path` | En qué rutas del sitio se envía. `/` = en todas. | `/` |
| `Domain` | A qué dominio y subdominios se envía. Si no se pone, solo al dominio exacto que la creó (lo más seguro). | Sin poner |
| `HttpOnly` | **JavaScript no puede leerla** (`document.cookie` no la ve). Solo viaja en las peticiones HTTP. | Sí |
| `Secure` | Solo se envía por HTTPS, nunca por HTTP sin cifrar. | Sí en producción; no en `localhost` |
| `SameSite` | Si se envía cuando **otro sitio** provoca la petición. Ver la tabla siguiente. | `Lax` |

### `SameSite` en detalle

| Valor | ¿Se envía si la petición la provoca otro sitio? | Uso típico |
|---|---|---|
| `Strict` | Nunca. Ni siquiera al llegar desde un enlace de otro sitio. | Bancos. Puede ser incómodo: llegas desde Google y apareces sin sesión. |
| `Lax` | Solo al **navegar** con un enlace normal (`GET`). No en formularios `POST`, `fetch` ni imágenes de otro sitio. | **La opción equilibrada.** Es el valor por defecto en Chrome si no pones nada. |
| `None` | Siempre. **Obliga a poner `Secure`.** | Cuando el frontend y la API están en dominios distintos, o en widgets que van incrustados en otras páginas. |

## 5. Cómo se usa en Express

Express **escribe** cookies sin ayuda. Para **leerlas** se usa el paquete `cookie-parser`.

```bash
npm install cookie-parser
```

```js
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());          // llena req.cookies en cada petición

const esProduccion = process.env.NODE_ENV === 'production';
const OPCIONES_COOKIE = {
  httpOnly: true,
  secure: esProduccion,           // en localhost no hay HTTPS
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // ¡ojo! en Express va en MILISEGUNDOS
};

// Crear la cookie (login)
app.post('/api/cuentas/sesion', async (req, res) => {
  // ... validar correo y contraseña, crear la fila en la tabla sesiones ...
  res.cookie('sesion', idSesion, OPCIONES_COOKIE);
  res.json({ nombre: perfil.nombre, rol: perfil.rol });
});

// Leer la cookie (cualquier petición)
app.get('/api/cuentas/yo', async (req, res) => {
  const idSesion = req.cookies.sesion;   // undefined si no hay cookie
  if (!idSesion) return res.status(401).json({ error: 'Sin sesión' });
  // ... buscar la sesión en la base ...
});

// Borrar la cookie (logout)
app.delete('/api/cuentas/sesion', async (req, res) => {
  // ... borrar la fila de sesiones ...
  res.clearCookie('sesion', { path: '/' });  // mismas opciones de path/domain con las que se creó
  res.status(204).end();
});
```

**Detalle importante:** para borrar una cookie, el servidor envía otra con el mismo nombre, `path` y `domain`, pero ya vencida. Si el `path` no coincide, el navegador la trata como una cookie distinta y la original sigue ahí.

## 6. Y en React, ¿qué hay que hacer?

Casi nada, y esa es la ventaja.

```js
// frontend/src/api/inscripciones.js
export async function misInscripciones() {
  const respuesta = await fetch('/api/inscripciones/mias');   // la cookie viaja sola
  if (respuesta.status === 401) throw new Error('Inicia sesión');
  return respuesta.json();
}
```

- `fetch` envía las cookies automáticamente cuando la petición va al **mismo origen** (mismo protocolo, dominio y puerto). Ese es su comportamiento por defecto (`credentials: 'same-origin'`).
- En Calida, la interfaz y la API **parecen** el mismo sitio gracias al proxy de Vite en local y a la reescritura de Vercel en producción ([04 · §11.3](../docs/04-arquitectura.md)). Por eso funciona sin configurar nada más.
- Si la API estuviera en otro dominio, habría que usar `fetch(url, { credentials: 'include' })`, configurar CORS en el servidor y poner `SameSite=None; Secure` en la cookie. El proxy nos ahorra todo eso.

**Por qué React no puede saber si hay sesión leyendo la cookie:** con `HttpOnly`, JavaScript no la ve. Por eso la interfaz pregunta `GET /api/cuentas/yo` al cargar la aplicación: si responde 200, hay sesión; si responde 401, no la hay.

## 7. Seguridad

| Amenaza | Qué es | Cómo la frena la cookie |
|---|---|---|
| **XSS** (*Cross-Site Scripting*) | Alguien logra ejecutar JavaScript en tu página, por ejemplo escondido en la descripción de una iniciativa. | `HttpOnly`: el script no puede leer la cookie para robarla. (React además escapa el texto por defecto.) |
| **CSRF** (*Cross-Site Request Forgery*) | Una página maliciosa hace que tu navegador envíe una petición a Calida, y el navegador adjunta tu cookie. | `SameSite=Lax`: el navegador no envía la cookie en `POST` o `fetch` que vienen de otro sitio. |
| **Espiar la red** | Alguien en el mismo wifi lee el tráfico. | `Secure`: la cookie solo viaja por HTTPS, que va cifrado. |
| **Adivinar la sesión** | Probar ids hasta acertar uno. | El valor es aleatorio y largo (32 bytes = 64 caracteres hex). Es imposible de adivinar en la práctica. |

**Reglas de oro:**
- **Nunca guardes datos sensibles en el valor** de una cookie (contraseñas, rol, correo). Guarda solo un identificador que apunte a algo del servidor.
- **Nunca confíes en el valor que llega.** El usuario puede editar sus cookies desde las herramientas del navegador. Si la cookie dijera `rol=admin`, cualquiera se haría administrador.
- Una cookie pesa **como máximo unos 4 KB**, y viaja en **todas** las peticiones. Debe ser pequeña.

## 8. Cookie, `localStorage` y `sessionStorage`

Las tres guardan datos en el navegador, pero no sirven para lo mismo:

| | Cookie | `localStorage` | `sessionStorage` |
|---|---|---|---|
| ¿Quién la crea? | Normalmente el servidor | JavaScript | JavaScript |
| ¿Viaja sola al servidor? | **Sí, en cada petición** | No | No |
| ¿JavaScript puede leerla? | No, si es `HttpOnly` | Sí | Sí |
| ¿Cuánto dura? | Lo que diga `Max-Age` | Hasta que se borre | Hasta cerrar la pestaña |
| Tamaño | ~4 KB | ~5 MB | ~5 MB |
| Buena para | **Sesiones** | Preferencias (tema oscuro, último filtro) | Borradores temporales de un formulario |

Por eso la sesión va en una cookie `HttpOnly` y no en `localStorage`: en `localStorage`, cualquier script (incluido uno inyectado con XSS) podría leerla.

## 9. Otros usos de las cookies (fuera de Calida)

- **Cookies de terceros:** las crea un dominio distinto al que visitas, como un anuncio o un botón de "me gusta". Sirven para seguir a la persona entre sitios, y los navegadores las están bloqueando cada vez más.
- **Banners de "aceptar cookies":** las leyes de protección de datos obligan a pedir permiso para cookies de seguimiento o publicidad. Las cookies **estrictamente necesarias**, como la de sesión, no necesitan ese permiso. Calida solo usa la de sesión.

## 10. En Calida

| Qué | Dónde |
|---|---|
| Una sola cookie, `sesion`, con un id aleatorio. | [04 · §7.1](../docs/04-arquitectura.md) |
| El id apunta a una fila de la tabla `sesiones`. | [04 · §6.2](../docs/04-arquitectura.md) |
| Atributos `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`. | [04 · §7.1](../docs/04-arquitectura.md) |
| La interfaz y la API comparten origen (proxy), así que no hace falta CORS. | [04 · §11.3](../docs/04-arquitectura.md), ADR-25 |
| Por qué cookie con id y no JWT ni `localStorage`. | ADR-18, lección L-04 de la [guía 00](../docs/00-guia-de-proyecto.md), y [02 · JWT](02-jwt.md) |

## 11. Para practicar (15 minutos)

1. Crea una carpeta fuera del proyecto, ejecuta `npm init -y` y luego `npm install express cookie-parser`.
2. Crea `index.js` con este servidor:
   ```js
   import express from 'express';
   import cookieParser from 'cookie-parser';
   const app = express();
   app.use(cookieParser());

   app.get('/entrar', (req, res) => {
     res.cookie('visita', 'hola', { httpOnly: true, maxAge: 60_000 });
     res.send('Cookie creada. Ve a /quien-soy');
   });
   app.get('/quien-soy', (req, res) => res.send(`Tu cookie dice: ${req.cookies.visita ?? '(nada)'}`));
   app.get('/salir', (req, res) => { res.clearCookie('visita'); res.send('Cookie borrada'); });

   app.listen(3000, () => console.log('http://localhost:3000'));
   ```
   Agrega `"type": "module"` al `package.json` y ejecuta `node index.js`.
3. Abre `http://localhost:3000/entrar` y luego `/quien-soy`.
4. Abre las herramientas del navegador (F12) → **Application** (en Firefox, **Almacenamiento**) → **Cookies**. Mira la columna `HttpOnly`.
5. En la consola escribe `document.cookie`. No aparece `visita`: eso es `HttpOnly` funcionando.
6. Espera un minuto y recarga `/quien-soy`: la cookie venció (`maxAge: 60_000` son 60 segundos).
7. **Extra con la terminal:**
   ```bash
   curl -i -c galletas.txt http://localhost:3000/entrar    # -i muestra cabeceras; -c guarda cookies
   curl -b galletas.txt http://localhost:3000/quien-soy    # -b las envía
   ```

## 12. Resumen

- HTTP no recuerda nada. Por eso cada petición debe llevar una prueba de quién eres.
- La cookie la **crea el servidor** (`Set-Cookie`), la **guarda el navegador** y el navegador la **devuelve solo** (`Cookie`).
- Siempre `HttpOnly`, `Secure` y `SameSite=Lax` para sesiones.
- El valor debe ser un **id aleatorio sin datos**. El servidor nunca confía en lo que trae.
- En Express: `cookie-parser`, `res.cookie()`, `req.cookies` y `res.clearCookie()`. `maxAge` va en milisegundos.
- En React no hay que hacer nada si la API está en el mismo origen.
