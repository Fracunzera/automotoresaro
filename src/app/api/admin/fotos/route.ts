import { NextResponse } from "next/server";
import { TIPOS_FOTO, guardarFoto, usaNube } from "@/lib/almacen";
import { usuarioActual } from "@/lib/usuarios";

const MAX_BYTES = 8 * 1024 * 1024;

/** Sube una foto (el navegador ya la achica antes de mandarla). */
export async function POST(req: Request) {
  if (!(await usuarioActual())) {
    return NextResponse.json({ error: "Tu sesión se cerró. Volvé a ingresar." }, { status: 401 });
  }
  if (process.env.VERCEL && !usaNube()) {
    return NextResponse.json({ error: "Falta activar el almacenamiento de fotos (Vercel Blob)." }, { status: 500 });
  }

  const form = await req.formData().catch(() => null);
  const foto = form?.get("foto");
  if (!(foto instanceof File)) return NextResponse.json({ error: "No llegó ninguna foto." }, { status: 400 });
  if (!TIPOS_FOTO[foto.type]) return NextResponse.json({ error: "Ese archivo no es una foto JPG, PNG o WEBP." }, { status: 400 });
  if (foto.size > MAX_BYTES) return NextResponse.json({ error: "La foto es demasiado pesada." }, { status: 400 });

  try {
    const url = await guardarFoto(await foto.arrayBuffer(), foto.type);
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo guardar la foto. Probá de nuevo." }, { status: 500 });
  }
}
