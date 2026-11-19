import Link from "next/link";
import { notFound } from "next/navigation";
import { detalle, fechaVisible } from "@/lib/publico";

export default async function Detalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const i = detalle((await params).id);
  if (!i) notFound();
  return (
    <>
      <Link href="/iniciativas">← Volver al explorador</Link>
      <section className="portada">
        <small>
          {i.categoria} · {i.ciudad}
        </small>
        <h1>{i.titulo}</h1>
        <p>{i.descripcion}</p>
      </section>
      <h2>Información de la jornada</h2>
      <dl>
        <dt>Organiza</dt>
        <dd>{i.organizador.nombre}</dd>
        <dt>Encuentro</dt>
        <dd>
          {i.lugar} · {fechaVisible(i.fecha_inicio)} ·{" "}
          {new Date(i.fecha_inicio).toLocaleTimeString("es-CO", {
            timeZone: "America/Bogota",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </dd>
        <dt>Estado</dt>
        <dd>{i.estado.replaceAll("_", " ")}</dd>
      </dl>
      <h2>Cómo puedes ayudar</h2>
      {i.necesidades.map((n) => (
        <article key={n.id}>
          <h3>{n.nombre}</h3>
          <p>
            {n.cantidad_confirmada} de {n.cantidad_objetivo} {n.unidad}{" "}
            confirmadas
          </p>
          <progress
            aria-label={n.nombre}
            value={n.cantidad_confirmada}
            max={n.cantidad_objetivo}
          />
        </article>
      ))}
      <p>Esta jornada es de ejemplo. Las inscripciones aún están cerradas.</p>
    </>
  );
}
