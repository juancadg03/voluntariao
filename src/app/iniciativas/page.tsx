import Link from "next/link";
import Tarjetas from "@/components/Tarjetas";
import { listar } from "@/lib/publico";
import type { FiltrosIniciativas } from "@/types/contratos";

export default async function Explorar({
  searchParams,
}: {
  searchParams: Promise<FiltrosIniciativas>;
}) {
  const filtros = await searchParams;
  const { data, total } = listar(filtros);
  const todas = listar().data;
  return (
    <>
      <h1>Explorar iniciativas</h1>
      <form action="/iniciativas">
        {(["ciudad", "categoria"] as const).map((campo) => (
          <label key={campo}>
            {campo === "ciudad" ? "Ciudad" : "Categoría"}
            <select name={campo} defaultValue={filtros[campo]}>
              <option value="">Todas</option>
              {[...new Set(todas.map((i) => i[campo]))].sort().map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Fecha de la jornada
          <input type="date" name="fecha" defaultValue={filtros.fecha} />
        </label>
        <button>Filtrar</button>
        <Link href="/iniciativas">Limpiar filtros</Link>
      </form>
      <h2>{total === 1 ? "1 iniciativa" : total + " iniciativas"}</h2>
      {total ? (
        <Tarjetas items={data} />
      ) : (
        <p>Prueba con otra ciudad, categoría o fecha.</p>
      )}
    </>
  );
}
