import { listar } from "@/lib/publico";
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return Response.json(
    listar({
      ciudad: params.get("ciudad") ?? undefined,
      categoria: params.get("categoria") ?? undefined,
      fecha: params.get("fecha") ?? undefined,
    }),
  );
}
