import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { TIPOS_FOTO, guardarFoto } from "@/lib/almacen";

const MAX_BYTES = 8 * 1024 * 1024;
const subidas = new Map<string, number[]>();

/** Primeros bytes de cada formato, para verificar que de verdad es una foto. */
function esImagen(b: Uint8Array, tipo: string) {
  if (tipo === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (tipo === "image/png") return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  if (tipo === "image/webp") return String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP";
  return false;
}

/** Fotos que sube el dueño en "Vendé tu auto" (sin cuenta). Con límites contra abusos. */
export async function POST(req: Request) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ahora = Date.now();
  const previas = (subidas.get(ip) ?? []).filter((t) => ahora - t < 60 * 60_000);
  if (previas.length >= 30) return NextResponse.json({ error: "Subiste muchas fotos seguidas. Esperá un rato o mandalas por WhatsApp." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const foto = form?.get("foto");
  if (!(foto instanceof File)) return NextResponse.json({ error: "No llegó ninguna foto." }, { status: 400 });
  if (!TIPOS_FOTO[foto.type] || foto.size > MAX_BYTES) return NextResponse.json({ error: "La foto tiene que ser JPG, PNG o WEBP de hasta 8 MB." }, { status: 400 });
  const datos = await foto.arrayBuffer();
  if (!esImagen(new Uint8Array(datos.slice(0, 12)), foto.type)) return NextResponse.json({ error: "Ese archivo no es una foto." }, { status: 400 });

  previas.push(ahora);
  subidas.set(ip, previas);
  try {
    return NextResponse.json({ url: await guardarFoto(datos, foto.type) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo guardar la foto. Probá de nuevo." }, { status: 500 });
  }
}
