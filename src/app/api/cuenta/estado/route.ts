import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_SESION, tokenValido } from "@/lib/sesion";
import { getCliente } from "@/lib/clientes";
import { idClienteActual } from "@/lib/sesion-cliente";

export const dynamic = "force-dynamic";

/** Para el encabezado y los corazones: quién está conectado y qué autos guardó. */
export async function GET() {
  const id = await idClienteActual();
  const c = id ? await getCliente(id) : undefined;
  const admin = await tokenValido((await cookies()).get(COOKIE_SESION)?.value);
  return NextResponse.json(
    c ? { cliente: { nombre: c.nombre || c.email.split("@")[0] }, favoritos: c.favoritos, admin } : { cliente: null, favoritos: [], admin },
    { headers: { "Cache-Control": "no-store" } },
  );
}
