import Link from "next/link";
import type { IniciativaPublica } from "@/types/contratos";
import { fechaVisible } from "@/lib/publico";

export default function Tarjetas({ items }: { items: IniciativaPublica[] }) {
  return (
    <div className="tarjetas">
      {items.map((i) => (
        <article key={i.id}>
          <small>
            {i.categoria} · {i.ciudad}
          </small>
          <h3>
            <Link href={"/iniciativas/" + i.id}>{i.titulo}</Link>
          </h3>
          <p>{i.descripcion}</p>
          <time dateTime={i.fecha_inicio}>{fechaVisible(i.fecha_inicio)}</time>
        </article>
      ))}
    </div>
  );
}
