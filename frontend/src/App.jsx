/**
 * Pantalla provisional del paso 3 de la fase 3.
 *
 * Solo comprueba que el monorepo está bien conectado: importa una lista de
 * @calida/compartido, que vive en otra carpeta del repositorio.
 * En el paso 5 mostrará el estado de la API y la base de datos.
 */
import { ESTADOS_INICIATIVA_PUBLICOS } from "@calida/compartido/contratos";

export function App() {
  return (
    <main>
      <h1>Calida</h1>
      <p>Estados que aparecen en el listado: {ESTADOS_INICIATIVA_PUBLICOS.join(", ")}.</p>
    </main>
  );
}
