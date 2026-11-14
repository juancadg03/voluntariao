# 06 · React

**Categoría:** Frontend / librería de interfaces · **Se usa en Calida:** sí, toda la interfaz ([04 · §3 y §4](../docs/04-arquitectura.md), ADR-16)

> Conviene leer antes [04 · Node.js](04-nodejs.md) y [05 · Express](05-express.md): aquí el frontend le pide datos a esa API.

---

## 1. El problema que resuelve

Con JavaScript "a mano", cada cambio en la pantalla se hace tocando el DOM paso a paso:

```js
const boton = document.querySelector('#interes');
let interesados = 0;
boton.addEventListener('click', () => {
  interesados++;
  boton.textContent = `Me interesa (${interesados})`;   // hay que acordarse de actualizar cada lugar
});
```

Con una pantalla pequeña funciona. Pero con un listado, filtros, un mapa y un usuario con sesión, hay que acordarse de **actualizar a mano cada parte de la pantalla** que depende de un dato, y es fácil que alguna quede desactualizada.

## 2. ¿Qué es?

**React** es una librería de JavaScript para construir interfaces. La idea central:

> **Tú describes cómo se ve la pantalla para unos datos dados. Cuando los datos cambian, React actualiza la pantalla solo.**

Ya no se dice "cambia este texto" sino "con `interesados = 3`, el botón dice *Me interesa (3)*".

> **Analogía:** un tablero de aeropuerto. Nadie cambia las letras una por una: se actualiza la lista de vuelos y el tablero se redibuja. React es el tablero; tú solo cambias la lista.

La interfaz se arma con **componentes**: piezas como Lego (una tarjeta, un botón, un formulario) que se combinan para formar páginas.

## 3. Los conceptos clave

### 3.1 Componente y JSX

Un **componente** es una función que devuelve lo que se ve. Lo que parece HTML dentro del JavaScript se llama **JSX**:

```jsx
function Saludo() {
  return <h1>Hola, Cali</h1>;
}
```

Diferencias de JSX con HTML:
- `className` en vez de `class`.
- `{ }` mete JavaScript dentro: `<p>{2 + 2}</p>` muestra `4`.
- Un componente devuelve **un solo** elemento raíz (si necesitas varios, envuélvelos en `<>...</>`).
- Los nombres de componentes empiezan en **mayúscula**: `<Saludo />`. En minúscula, React cree que es una etiqueta HTML.

### 3.2 Props: datos que entran

Las **props** son los parámetros de un componente. Las pasa el componente "padre", y el hijo **no las cambia**:

```jsx
function TarjetaIniciativa({ titulo }) {
  return <h2>{titulo}</h2>;
}

<TarjetaIniciativa titulo="Jornada de limpieza" />
```

### 3.3 Estado: datos que cambian

El **estado** es la memoria del componente. Se crea con `useState`, que devuelve el valor actual y una función para cambiarlo. **Al llamar esa función, React vuelve a dibujar el componente.**

```jsx
import { useState } from 'react';

export function TarjetaIniciativa({ titulo }) {
  const [interesados, setInteresados] = useState(0);   // valor inicial: 0

  return (
    <article>
      <h2>{titulo}</h2>
      <button onClick={() => setInteresados(interesados + 1)}>
        Me interesa ({interesados})
      </button>
    </article>
  );
}
```

| | Props | Estado |
|---|---|---|
| ¿De dónde viene? | Del componente padre. | Del propio componente (`useState`). |
| ¿Se puede cambiar? | No, el hijo solo la lee. | Sí, con la función `set...`. |
| Ejemplo en Calida | El título de una iniciativa. | El texto escrito en el buscador, si un menú está abierto. |

**Regla de oro:** nunca cambies el estado directamente (`interesados++` no sirve). Siempre usa `setInteresados(...)`, porque es lo que le avisa a React que debe redibujar.

### 3.4 Efectos: hablar con la API

Pedir datos al servidor no es "dibujar", es un **efecto**: algo que pasa fuera de React. Para eso existe `useEffect`. Este es el punto donde **el frontend se conecta con el backend**:

```jsx
import { useEffect, useState } from 'react';
import { TarjetaIniciativa } from './TarjetaIniciativa.jsx';

export function ListaIniciativas() {
  const [iniciativas, setIniciativas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/iniciativas')                         // petición HTTP a la API Express
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();                            // el JSON se vuelve un arreglo de JS
      })
      .then((datos) => setIniciativas(datos))         // guardar → React redibuja
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);   // [] = ejecutar solo cuando el componente aparece

  if (cargando) return <p>Cargando…</p>;
  if (error) return <p>No se pudo cargar: {error}</p>;

  return (
    <ul>
      {iniciativas.map((i) => (
        <li key={i.id}>
          <TarjetaIniciativa titulo={i.titulo} />
        </li>
      ))}
    </ul>
  );
}
```

Lo que pasa, en orden:

1. El componente aparece con `cargando = true` → se ve "Cargando…".
2. `useEffect` hace el `fetch`.
3. Express responde `[{"id":1,"titulo":"Jornada de limpieza"}]`.
4. `setIniciativas(...)` y `setCargando(false)` cambian el estado → React redibuja → aparece la lista.

**Detalles a notar:**
- **Tres estados** (cargando, error, datos): toda pantalla que pide datos debe mostrar algo en cada uno. Si no, el usuario ve una pantalla vacía y no sabe si algo falló.
- `fetch` **no** lanza error con un 404 o un 500; hay que revisar `res.ok` a mano.
- **`key`** en las listas: React la usa para saber qué elemento es cuál cuando la lista cambia. Usa el `id`, no la posición.
- El `[]` del final es la **lista de dependencias**. Vacía: solo una vez. `[categoria]`: cada vez que cambie `categoria` (útil para filtros).
- En desarrollo, React ejecuta los efectos **dos veces** a propósito (modo estricto) para ayudarte a encontrar errores. Si ves dos peticiones en la pestaña Red, es normal.

### 3.5 Varias páginas: React Router

Calida es una **SPA** (*Single Page Application*): el navegador descarga una sola página, y React cambia lo que se ve según la URL, sin recargar. **React Router** decide qué componente mostrar para cada URL:

```jsx
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

function Detalle() {
  const { id } = useParams();            // en /iniciativas/42 → id = '42'
  return <p>Iniciativa {id}</p>;
}

<BrowserRouter>
  <nav><Link to="/">Inicio</Link></nav>      {/* <Link> en vez de <a>: no recarga la página */}
  <Routes>
    <Route path="/" element={<ListaIniciativas />} />
    <Route path="/iniciativas/:id" element={<Detalle />} />
  </Routes>
</BrowserRouter>
```

Fíjate en el parecido con Express: `:id` funciona igual. La diferencia es **dónde** corre: React Router elige **qué pantalla** mostrar en el navegador; Express elige **qué datos** responder en el servidor.

### 3.6 Datos para toda la app: Context

Algunos datos los necesitan muchos componentes, por ejemplo **quién inició sesión**. Pasarlos prop por prop sería tedioso. **Context** los deja disponibles en toda la aplicación. En Calida eso es `ProveedorSesion` y `useSesion()`, explicados en [03 · Sesiones](03-sesiones.md).

## 4. Vite: la herramienta que lo arma

El navegador no entiende JSX. **Vite** lo traduce a JavaScript normal, recarga la página al guardar y, al final, empaqueta todo en archivos pequeños para publicar.

```bash
npm create vite@latest mi-app -- --template react   # crea el proyecto
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # genera la carpeta dist/ para publicar
```

Para que `fetch('/api/...')` llegue a Express en desarrollo, se configura un **proxy**:

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3002' } },   // lo que empiece por /api va a Express
});
```

Así el navegador cree que front y API son el **mismo sitio**: no hace falta CORS y la cookie de sesión funciona (ver [01 · Cookies](01-cookies.md) y [04 · §11.3](../docs/04-arquitectura.md)). En Calida el puerto de la API es el 3000; aquí es el 3002 para usar el ejemplo de [05 · Express](05-express.md).

## 5. Seguridad y errores comunes

| Tema | Qué saber |
|---|---|
| **XSS** | React **escapa** todo lo que pones entre `{ }`: si un título trae `<script>`, se muestra como texto y no se ejecuta. La excepción es `dangerouslySetInnerHTML`, que Calida prohíbe ([04 · §7.4](../docs/04-arquitectura.md)). |
| **Ocultar no es proteger** | Esconder el botón "Editar" a quien no es dueño es solo comodidad. Cualquiera puede llamar la API con `curl`. **Quien decide los permisos es la API** (`exigirRol`). |
| **Secretos** | Todo el código de React llega al navegador y cualquiera lo puede leer. Nunca pongas contraseñas ni llaves en el frontend. |
| Cambiar el estado directo | `lista.push(x)` no redibuja. Usa `setLista([...lista, x])`, que crea un arreglo nuevo. |
| Olvidar `key` | React avisa en la consola, y la lista puede comportarse raro al filtrar. |
| `useEffect` sin `[]` | Se ejecuta en cada redibujo. Si dentro cambias el estado, entras en un bucle infinito de peticiones. |

## 6. En Calida

| Qué | Dónde |
|---|---|
| La interfaz es una SPA con React + Vite + React Router. | [04 · §4](../docs/04-arquitectura.md), ADR-16 |
| Carpetas: `paginas/` (una por pantalla), `componentes/` (piezas reutilizables), `sesion/` (contexto del usuario). | [04 · §5.3](../docs/04-arquitectura.md) |
| El mapa usa Leaflet con `react-leaflet`, y se carga solo en `/mapa` (`React.lazy`). | [04 · §10](../docs/04-arquitectura.md), ADR-05 |
| Estilos con Tailwind. | ADR-11 |
| El proxy de Vite manda `/api` a Express en local; en producción lo hace Vercel. | [04 · §11.3](../docs/04-arquitectura.md) |

**Regla de Calida:** React **muestra y pregunta**; la API **decide**. Validar el formulario en React es para avisar rápido al usuario. La validación que cuenta es la del servidor.

## 7. Para practicar (15 minutos)

1. Deja corriendo el servidor Express de [05 · Express §3](05-express.md) (puerto 3002).
2. En otra terminal: `npm create vite@latest practica-react -- --template react`, luego `cd practica-react` y `npm install`.
3. Agrega el `proxy` de la sección 4 a `vite.config.js`.
4. Crea `src/TarjetaIniciativa.jsx` y `src/ListaIniciativas.jsx` con el código de la sección 3, y en `src/App.jsx` devuelve `<ListaIniciativas />`.
5. `npm run dev` y abre `http://localhost:5173`. Debe aparecer "Jornada de limpieza" con su botón.
6. Crea una iniciativa con el `curl` de POST de [05 · §6](05-express.md) y recarga: aparece la nueva.
7. Apaga Express y recarga. ¿Qué muestra la página? (El proxy de Vite no encuentra la API y responde 502 *Bad Gateway*, así que verás *No se pudo cargar: HTTP 502*. Por eso importa el estado de error.)
8. Abre las herramientas del navegador (F12) → pestaña **Red**: ahí ves la petición a `/api/iniciativas` y su respuesta JSON.

## 8. Resumen

- React = describes la pantalla según los datos; cuando los datos cambian, **React redibuja solo**.
- **Componente** = función que devuelve JSX. **Props** entran desde el padre; **estado** (`useState`) es la memoria propia.
- Cambiar el estado siempre con `set...`; eso es lo que dispara el redibujo.
- `useEffect` + `fetch` = el punto donde el **frontend se conecta con el backend**. Muestra siempre cargando, error y datos.
- React Router elige la pantalla según la URL; Vite traduce JSX y hace de proxy hacia la API.
- React oculta botones, pero **la API decide los permisos**.
