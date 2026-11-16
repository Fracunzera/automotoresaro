import { NextResponse } from "next/server";
import { getPublicos } from "@/lib/autos";
import { codigoCorto } from "@/lib/link-corto";

/** Link corto de un auto (/a/k3f9x2) → su ficha. */
export async function GET(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const codigo = (await params).codigo.toLowerCase();
  const auto = (await getPublicos()).find((a) => codigoCorto(a.id) === codigo);
  // Temporal (302): si el auto se vende o se oculta, el link pasa a llevar al catálogo
  return NextResponse.redirect(new URL(auto ? `/autos/${auto.slug}` : "/autos", req.url), 302);
}
