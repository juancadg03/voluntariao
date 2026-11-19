/**
 * Punto de entrada de la API: toma la app de src/app.js y la pone a escuchar.
 *
 * `npm run dev` lo corre con `node --watch`, que reinicia el servidor
 * cada vez que se guarda un archivo.
 */
import { app } from "./src/app.js";

const puerto = Number(process.env.PORT) || 3000;

app.listen(puerto, () => {
  console.log(`API escuchando en http://localhost:${puerto}`);
});
