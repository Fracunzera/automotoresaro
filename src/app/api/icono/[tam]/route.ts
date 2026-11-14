import { generarIcono } from "@/lib/icono";

/** Íconos para "Agregar a pantalla de inicio" (192 y 512 píxeles). */
export async function GET(_req: Request, { params }: { params: Promise<{ tam: string }> }) {
  const tam = (await params).tam === "192" ? 192 : 512;
  return generarIcono(tam);
}
