import { NextResponse } from "next/server";
import { getPublicos } from "@/lib/autos";
import { leerNegocio } from "@/lib/negocio";
import { horariosLibres, leerTurnos } from "@/lib/turnos";

export const dynamic = "force-dynamic";

/** Horarios libres para visitar un auto: /api/turnos?auto=ID */
export async function GET(req: Request) {
  const autoId = new URL(req.url).searchParams.get("auto") ?? "";
  const [{ ajustes }, autos, turnos] = await Promise.all([leerNegocio(), getPublicos(), leerTurnos()]);
  const auto = autos.find((a) => a.id === autoId && a.estado === "publicado");
  if (!ajustes.agenda.activa || !auto) return NextResponse.json({ dias: [] }, { headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(
    { dias: horariosLibres(ajustes.agenda, turnos, autoId), duracion: ajustes.agenda.duracion },
    { headers: { "Cache-Control": "no-store" } },
  );
}
