import { NextResponse } from "next/server";
import { getPublicos } from "@/lib/autos";
import { getProductosPublicos } from "@/lib/productos";
import { esTienda } from "@/lib/rubro";
import { alternarFavorito } from "@/lib/clientes";
import { idClienteActual } from "@/lib/sesion-cliente";

/** Guarda o quita un auto de los favoritos del cliente conectado. */
export async function POST(req: Request) {
  const id = await idClienteActual();
  if (!id) return NextResponse.json({ error: "Ingresá para guardar autos." }, { status: 401 });
  const { autoId } = (await req.json().catch(() => ({}))) as { autoId?: unknown };
  if (typeof autoId !== "string") return NextResponse.json({ error: "Falta el auto." }, { status: 400 });
  const favoritos = await alternarFavorito(id, autoId);
  if (!favoritos) return NextResponse.json({ error: "Ingresá de nuevo." }, { status: 401 });
  // Si el auto ya no existe, igual se puede quitar; para agregar tiene que estar publicado.
  const existe = esTienda ? (await getProductosPublicos()).some((p) => p.id === autoId) : (await getPublicos()).some((a) => a.id === autoId);
  if (favoritos.includes(autoId) && !existe) {
    return NextResponse.json({ favoritos: await alternarFavorito(id, autoId) });
  }
  return NextResponse.json({ favoritos });
}
