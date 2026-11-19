import { detalle } from "@/lib/publico";
import type { DetalleIniciativa } from "@/types/contratos";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const data = detalle((await params).id);
  if (!data)
    return Response.json(
      { mensaje: "Iniciativa inexistente" },
      { status: 404 },
    );
  return Response.json({ data } satisfies DetalleIniciativa);
}
