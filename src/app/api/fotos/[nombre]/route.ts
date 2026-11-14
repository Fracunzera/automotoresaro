import { leerFotoLocal } from "@/lib/almacen";

/** Sirve las fotos guardadas en la carpeta local (cuando no se usa Vercel Blob). */
export async function GET(_req: Request, { params }: { params: Promise<{ nombre: string }> }) {
  const foto = await leerFotoLocal((await params).nombre);
  if (!foto) return new Response("No encontrada", { status: 404 });
  return new Response(new Uint8Array(foto.datos), {
    headers: { "Content-Type": foto.tipo, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
