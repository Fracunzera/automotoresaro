import Image from "next/image";
import type { Producto } from "@/lib/productos-tipos";

/** Foto del producto, o una tarjeta con la inicial mientras no tenga fotos. */
export function ProductoImagen({
  producto, index = 0, className = "", sizes = "(max-width: 768px) 50vw, 25vw", priority = false,
}: { producto: Pick<Producto, "fotos" | "nombre" | "categoria">; index?: number; className?: string; sizes?: string; priority?: boolean }) {
  const foto = producto.fotos[index];
  if (foto) {
    return (
      <div className={`relative overflow-hidden bg-papel ${className}`}>
        <Image src={foto} alt={producto.nombre} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden bg-papel ${className}`} role="img" aria-label={`${producto.nombre} (foto en preparación)`}>
      <span className="font-display text-[56px] font-extrabold leading-none text-stone-300">{producto.nombre.charAt(0).toUpperCase()}</span>
      <span className="mt-2 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">{producto.categoria}</span>
    </div>
  );
}
