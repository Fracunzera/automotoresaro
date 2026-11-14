import { generarIcono } from "@/lib/icono";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default function Icon() {
  return generarIcono(512);
}
