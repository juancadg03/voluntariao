# 04 · Node.js

**Categoría:** Backend / entorno de ejecución · **Se usa en Calida:** sí, la API corre en Node ([04 · §4](../docs/04-arquitectura.md), ADR-16)

---

## 1. ¿Qué es?

JavaScript nació para correr **dentro del navegador**. **Node.js** es un programa que permite ejecutar JavaScript **fuera del navegador**: en tu computador o en un servidor.

> **Analogía:** JavaScript es el idioma; el navegador y Node son dos "países" donde se habla. El idioma es el mismo, pero cada país tiene objetos distintos a la mano.

Node usa **V8**, el mismo motor de JavaScript de Chrome, y le agrega herramientas para hacer cosas que el navegador no permite: leer archivos, abrir puertos de red y conectarse a bases de datos.

Con Node se puede escribir el **backend en el mismo lenguaje que el frontend**. Por eso Calida usa JavaScript en las dos partes (ADR-04).

## 2. Navegador vs Node

| | Navegador | Node.js |
|---|---|---|
| Para qué | Mostrar páginas y responder al usuario. | Servidores, scripts, herramientas. |
| Tiene | `window`, `document` (el DOM), `localStorage`. | `process`, `fs` (archivos), `http`, `crypto`. |
| No tiene | Acceso a archivos del disco ni puertos. | `window`, `document`: no hay página. |
| Se ejecuta | Al abrir una página. | En la terminal: `node archivo.js`. |

```js
// prueba.js → node prueba.js
console.log('Hola desde Node', process.version);   // process existe en Node, no en el navegador
```

## 3. npm y `package.json`

Node trae **npm** (*Node Package Manager*), que instala librerías hechas por otros, llamadas **paquetes**.

```bash
npm init -y               # crea package.json
npm install express       # descarga express en node_modules/ y lo anota en package.json
npm run dev               # ejecuta el script "dev" definido en package.json
```

```json
{
  "name": "calida-api",
  "type": "module",
  "scripts": { "dev": "node --watch server.js" },
  "dependencies": { "express": "^5.3.0" }
}
```

- **`package.json`**: la ficha del proyecto. Guarda su nombre, sus scripts y las librerías que usa.
- **`node_modules/`**: donde quedan las librerías descargadas. **Nunca se sube a Git**, porque se recrea con `npm install`.
- **`package-lock.json`**: guarda las versiones exactas instaladas. **Sí se sube a Git**, para que todos tengan las mismas versiones.
- **`"type": "module"`**: permite usar `import`/`export` (la sintaxis moderna). Sin esa línea, Node usa `require()` (la sintaxis antigua, *CommonJS*).
- **`node --watch`**: reinicia el servidor solo cada vez que guardas un archivo.

## 4. La idea clave: no bloquear (asincronía)

Node ejecuta tu código en **un solo hilo**. Si se quedara esperando cada vez que consulta la base de datos, nadie más podría ser atendido mientras tanto. Por eso las operaciones lentas (red, disco, base de datos) son **asíncronas**: Node las inicia, **sigue con otra cosa**, y retoma tu código cuando llega el resultado. El mecanismo que organiza esto se llama ***event loop*** (bucle de eventos).

> **Analogía:** un mesero solo en un restaurante. Toma el pedido de la mesa 1, lo deja en la cocina y, **mientras se cocina**, atiende la mesa 2. No se queda parado frente a la cocina.

```js
console.log('1. Pido datos a la base');
setTimeout(() => console.log('3. Llegaron los datos'), 1000);   // simula una espera
console.log('2. Mientras tanto, atiendo a otro');
// Imprime: 1, 2, 3
```

En el código real se usa `async` y `await`, que hacen que el código asíncrono se lea en orden, de arriba abajo:

```js
async function misInscripciones(usuarioId) {
  const { rows } = await db.query('select * from inscripciones where voluntario_id = $1', [usuarioId]);
  return rows;   // mientras la base respondía, Node atendió otras peticiones
}
```

**Regla práctica:** si una función devuelve una *Promise* (consultas, `fetch`, `bcrypt.compare`), ponle `await`. Si lo olvidas, obtienes una `Promise { <pending> }` en vez del dato.

## 5. Un servidor con Node puro

Node trae el módulo `http` para crear servidores sin instalar nada:

```js
import http from 'node:http';

const iniciativas = [{ id: 1, titulo: 'Jornada de limpieza' }];

const servidor = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/iniciativas') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(iniciativas));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No existe' }));
  }
});

servidor.listen(3001, () => console.log('http://localhost:3001'));
```

Funciona, pero imagina 40 rutas con `if`, leer parámetros como `/api/iniciativas/:id` a mano, convertir cuerpos JSON a mano… Para eso existe **Express** (ver [05 · Express](05-express.md)).

## 6. Versiones: LTS

Node saca versiones nuevas seguido. Las **LTS** (*Long Term Support*) son las estables, con soporte por varios años, y son las que se usan en proyectos. Calida fija la versión en dos lugares, para que tu computador, GitHub Actions y Render usen la misma:

- `.nvmrc`: lo lee **nvm**, una herramienta para tener varias versiones de Node instaladas (`nvm use`).
- `"engines"` en `package.json`: le dice a los servicios qué versión usar.

## 7. En Calida

| Qué | Dónde |
|---|---|
| La API (Express) corre sobre Node. | [04 · §3](../docs/04-arquitectura.md) |
| Scripts propios: migraciones (`backend/scripts/migrar.js`). | [04 · §5.3](../docs/04-arquitectura.md) |
| `node:crypto` genera los ids de sesión. | [03 · Sesiones](03-sesiones.md) |
| npm workspaces une `frontend/`, `backend/` y `compartido/`. | ADR-27 |
| Vite, la herramienta que arma el frontend, también corre sobre Node, aunque el resultado final se ejecuta en el navegador. | ADR-16 |

## 8. Para practicar (5 minutos)

1. Ejecuta `node -v` para ver tu versión.
2. Guarda el servidor de la sección 5 como `servidor.js`, agrega `"type": "module"` a un `package.json` y ejecútalo con `node servidor.js`.
3. Abre `http://localhost:3001/api/iniciativas` en el navegador, y también `http://localhost:3001/otra`.
4. Ejecuta el ejemplo de la sección 4 y comprueba el orden 1, 2, 3.

## 9. Resumen

- Node = JavaScript **fuera del navegador**, con acceso a archivos, red y bases de datos.
- npm instala librerías; `package.json` las anota; `node_modules/` no se sube a Git.
- Node usa **un solo hilo que no se bloquea**: las esperas son asíncronas, y se escriben con `async`/`await`.
- Se puede hacer un servidor solo con `node:http`, pero Express lo hace mucho más cómodo.
- Se usan versiones **LTS**, fijadas en `.nvmrc`.
