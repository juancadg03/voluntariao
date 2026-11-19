# Prototipo de Calida (etapa 2 del diseño de pantallas)

Prototipo navegable de tres pantallas clave, con los colores, la letra y las ilustraciones reales. Sirve para **ver y probar** el diseño de [05 · Diseño de pantallas](../05-diseno-de-pantallas.md) antes de construirlo en React.

| Archivo | Pantalla | Qué probar |
|---|---|---|
| `index.html` | PT-01 · Inicio: listado y filtros | Filtrar, ver que la URL cambia, recargar y que los filtros sigan. Estados: cargando, vacío, error. |
| `detalle.html?id=1` | PT-03 · Detalle e inscripción | Como **voluntario**: "Quiero participar", subir la cantidad y confirmar (3 pasos). Como **visitante**: "Regístrate para participar". Reportar. |
| `entrar.html` | PT-04 · Iniciar sesión | Dejar campos vacíos, un correo mal escrito, una contraseña mala tres veces. Contraseña de prueba: `calida123`. |

## Cómo abrirlo

Desde esta carpeta:

```bash
cd docs/prototipo
python3 -m http.server 8000
```

Y abre `http://localhost:8000` en el navegador. Se necesita internet, porque Tailwind, la fuente y el mapa vienen de CDN.

> **¿Por qué un servidor y no doble clic en el archivo?** Al abrirlo como `file://`, algunos navegadores bloquean `localStorage`, y los mapas de OpenStreetMap pueden rechazar la petición. Con un servidor local la página se comporta como una web real.

**Barra amarilla de arriba:** no es parte del diseño. Sirve para ver la misma pantalla **como visitante, voluntario u organización**, simular respuestas de la API (cargando, error 500, 409 sin cupo) y borrar las inscripciones de prueba.

**En el celular:** abre las herramientas del navegador (F12) y activa el modo de diseño adaptable (Ctrl+Shift+M en Firefox, o el ícono de celular en Chrome) con un ancho de **360 px**.

## Cómo está hecho

Cada archivo empieza con un bloque de comentarios que explica qué vista es (o qué piezas comparte), por qué está en el prototipo, qué partes y estados tiene y con qué otros archivos se conecta. Dentro del código, cada sección tiene su propio comentario.

| Archivo | Qué tiene | En el proyecto real será… |
|---|---|---|
| `tema.js` | Los **tokens de diseño** (colores, fuente) en un bloque `@theme` de Tailwind v4. | `frontend/src/index.css` |
| `comun.js` | Datos de ejemplo, sesión simulada, íconos, encabezado, menús y avisos. | Componentes de React (`Boton`, `Chip`, `TarjetaIniciativa`…) y funciones de `frontend/src/api/` |
| `*.html` | Una pantalla cada uno, con su JavaScript al final. | Una carpeta por pantalla en `frontend/src/paginas/` |
| `recursos/` | Logo, collage (WebP de 220 KB) e ilustraciones. | `frontend/public/` |

**Atajos que solo valen para un prototipo:**
- **Tailwind desde un CDN**, que genera el CSS en el navegador. Es cómodo para probar, pero lento para producción. En la app, Vite lo compila una sola vez.
- **Datos fijos en `comun.js`.** No hay API: cada `setTimeout` simula la espera de un `fetch`.
- **HTML armado con texto** (`innerHTML`) y una función `esc()` para escapar. React escapa solo; aquí hay que hacerlo a mano para evitar XSS (ver [06 · React §5](../../aprendizajes/06-react.md)).
- **El rol se guarda en `localStorage`.** En la app real viene de la cookie de sesión y de `GET /api/cuentas/yo` (ver [03 · Sesiones](../../aprendizajes/03-sesiones.md)).

## Detalles de accesibilidad que puedes probar

- **Navegar solo con Tab**: el foco siempre se ve (anillo azul), y "Saltar al contenido" aparece con el primer Tab.
- **Esc** cierra la hoja de inscripción, y el foco vuelve al botón que la abrió. Es lo que hace la etiqueta `<dialog>` del navegador.
- Las insignias de estado tienen **ícono y texto**, no solo color.
- Las barras de progreso tienen el **número escrito** al lado ("12 de 20").
- Al filtrar, el lector de pantalla anuncia "N iniciativas" (`aria-live`).

## Qué se aprendió al construirlo

- **Leaflet mide su contenedor al crearse.** Si los estilos llegan después, el mapa queda descentrado. La solución es un `ResizeObserver` que llama a `invalidateSize()` cuando el contenedor cambia de tamaño (`detalle.html`).
- **Los estilos base de Tailwind cambian el SVG y las imágenes.** Un `img` con altura en porcentaje dentro de una cuadrícula quedó en cero. Se usó una altura fija (`h-32`).
- **Redirección abierta:** `entrar.html?siguiente=...` solo acepta páginas propias. Si no, un enlace malicioso podría llevar al usuario a otro sitio justo después de iniciar sesión (`destinoSeguro` en `entrar.html`).
