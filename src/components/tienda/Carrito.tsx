"use client";

import Link from "next/link";
import { hayStock, type ConfigTienda, type Producto } from "@/lib/productos-tipos";
import { formatNumero } from "@/lib/utils";
import { useCarrito } from "./CarritoContext";
import { ProductoImagen } from "./ProductoImagen";

const pesos = (n: number) => `$ ${formatNumero(n)}`;

/** Une lo que hay en el carrito con los datos actuales de cada producto (precio y stock reales). */
export function useLineas(productos: Producto[]) {
  const { items } = useCarrito();
  return items
    .map((it) => {
      const p = productos.find((x) => x.id === it.productoId);
      return p ? { it, p, subtotal: p.precio * it.cantidad, problema: !hayStock(p, it.cantidad) ? (p.stock === 0 ? "Sin stock" : `Quedan ${p.stock}`) : "" } : null;
    })
    .filter((x) => x !== null);
}

export function Carrito({ productos, config }: { productos: Producto[]; config: ConfigTienda }) {
  const { items, cambiar, quitar } = useCarrito();
  const lineas = useLineas(productos);
  const subtotal = lineas.reduce((s, l) => s + l.subtotal, 0);
  const desaparecidos = items.length - lineas.length;
  const hayProblemas = lineas.some((l) => l.problema);
  const faltaMinimo = config.compraMinima > 0 && subtotal < config.compraMinima;

  if (lineas.length === 0) {
    return (
      <div className="mt-6 rounded-lg bg-papel px-6 py-12 text-center">
        <p className="titulo text-2xl">Tu carrito está vacío</p>
        {desaparecidos > 0 && <p className="mt-2 text-stone-600">Algún producto que tenías ya no está disponible.</p>}
        <Link href="/productos" className="btn-rojo mt-5">Ver productos</Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-linea border-y border-linea">
        {lineas.map(({ it, p, subtotal: st, problema }) => (
          <li key={`${it.productoId}-${it.variante}`} className="flex gap-4 py-4">
            <Link href={`/productos/${p.slug}`} className="w-24 shrink-0">
              <ProductoImagen producto={p} sizes="96px" className="aspect-square rounded-md" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/productos/${p.slug}`} className="font-semibold leading-snug hover:underline">{p.nombre}</Link>
              {it.variante && <p className="text-sm text-stone-500">{p.nombreVariante || "Opción"}: {it.variante}</p>}
              <p className="text-sm text-stone-500">{pesos(p.precio)} c/u</p>
              {problema && <p className="text-sm font-semibold text-rojo-oscuro">{problema}</p>}
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex h-10 items-center rounded-md border border-stone-300">
                  <button onClick={() => cambiar(it.productoId, it.variante, it.cantidad - 1)} aria-label="Menos" className="h-full w-10 text-lg font-semibold">−</button>
                  <span className="w-8 text-center font-semibold">{it.cantidad}</span>
                  <button onClick={() => cambiar(it.productoId, it.variante, it.cantidad + 1)} aria-label="Más" className="h-full w-10 text-lg font-semibold">+</button>
                </div>
                <span className="font-display text-xl font-bold">{pesos(st)}</span>
              </div>
              <button onClick={() => quitar(it.productoId, it.variante)} className="mt-1 text-sm font-semibold text-stone-500 hover:text-rojo-oscuro">Quitar</button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-lg bg-papel p-5 lg:sticky lg:top-[120px]">
        <div className="flex justify-between text-lg"><span>Subtotal</span><b>{pesos(subtotal)}</b></div>
        {config.domicilio.activo && (
          <p className="mt-2 text-sm text-stone-600">
            {config.domicilio.gratisDesde > 0 && subtotal >= config.domicilio.gratisDesde
              ? "¡Tenés envío gratis!"
              : config.domicilio.gratisDesde > 0
                ? `Te faltan ${pesos(config.domicilio.gratisDesde - subtotal)} para el envío gratis.`
                : config.domicilio.costo > 0
                  ? `Envío a domicilio: ${pesos(config.domicilio.costo)}. O retirás gratis.`
                  : "Envío gratis."}
          </p>
        )}
        {faltaMinimo && <p className="mt-2 text-sm font-semibold text-rojo-oscuro">La compra mínima es de {pesos(config.compraMinima)}.</p>}
        {hayProblemas && <p className="mt-2 text-sm font-semibold text-rojo-oscuro">Ajustá las cantidades marcadas para seguir.</p>}
        {hayProblemas || faltaMinimo ? (
          <span className="btn-rojo mt-4 w-full cursor-not-allowed opacity-50">Finalizar compra</span>
        ) : (
          <Link href="/finalizar" className="btn-rojo mt-4 w-full">Finalizar compra</Link>
        )}
        <Link href="/productos" className="mt-3 block text-center text-sm font-semibold text-stone-600 hover:text-tinta">Seguir comprando</Link>
      </aside>
    </div>
  );
}
