"use client";

import Link from "next/link";
import { hayStock, type Producto } from "@/lib/productos-tipos";
import { formatNumero } from "@/lib/utils";
import { BotonFavorito } from "../cuenta/ClienteContext";
import { ProductoImagen } from "./ProductoImagen";

export const Pesos = ({ valor, className = "" }: { valor: number; className?: string }) => (
  <span className={`font-display font-bold tracking-tight ${className}`}>
    <span className="mr-0.5 align-[0.35em] text-[0.55em]">$</span>
    {formatNumero(valor)}
  </span>
);

export function ProductoCard({ p }: { p: Producto }) {
  const descuento = p.precioAnterior > p.precio ? Math.round((1 - p.precio / p.precioAnterior) * 100) : 0;
  const agotado = !hayStock(p);
  return (
    <Link href={`/productos/${p.slug}`} className="group flex flex-col overflow-hidden rounded-lg border border-linea bg-white transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)]">
      <div className="relative">
        <ProductoImagen producto={p} className={`aspect-square ${agotado ? "opacity-60" : ""}`} />
        <BotonFavorito autoId={p.id} className="absolute right-2.5 top-2.5 grid size-10 place-items-center rounded-full bg-white/90 text-tinta shadow-sm transition-transform hover:scale-110" />
        {agotado ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-sm bg-tinta px-2 py-1 text-xs font-semibold text-white">Sin stock</span>
        ) : descuento > 0 ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-sm bg-rojo px-2 py-1 text-xs font-bold text-white">{descuento}% OFF</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[13px] text-stone-500">{p.categoria}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-snug">{p.nombre}</h3>
        <div className="mt-auto pt-2">
          {descuento > 0 && <p className="text-[13px] text-stone-400 line-through">$ {formatNumero(p.precioAnterior)}</p>}
          <Pesos valor={p.precio} className="text-[24px] leading-tight" />
        </div>
      </div>
    </Link>
  );
}
