import Link from "next/link";
import Tarjetas from "@/components/Tarjetas";
import { listar } from "@/lib/publico";

export const dynamic = "force-dynamic";
export default function Inicio() {
  const { data } = listar();
  const proximas = data
    .filter(
      (i) =>
        ["publicada", "en_preparacion", "lista"].includes(i.estado) &&
        Date.parse(i.fecha_inicio) >= Date.now(),
    )
    .sort((a, b) => Date.parse(a.fecha_inicio) - Date.parse(b.fecha_inicio));
  const pendientes = proximas.filter((i) =>
    i.necesidades.some((n) => n.cantidad_confirmada < n.cantidad_objetivo),
  );
  const recientes = [...data].sort(
    (a, b) => Date.parse(b.publicada_en) - Date.parse(a.publicada_en),
  );
  return (
    <>
      <section className="portada">
        <small>Voluntariado en Colombia</small>
        <h1>Encuentra dónde ayudar.</h1>
        <Link className="boton" href="/iniciativas">
          Explorar iniciativas →
        </Link>
      </section>
      <h2>Aún necesitan ayuda</h2>
      <Tarjetas items={pendientes} />
      <h2>Próximas jornadas</h2>
      <Tarjetas items={proximas} />
      <h2>Recién publicadas</h2>
      <Tarjetas items={recientes} />
    </>
  );
}
