"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { estadoProductoAccion, stockAccion } from "@/app/admin/acciones-tienda";
import type { Producto } from "@/lib/productos-tipos";
import { formatNumero } from "@/lib/utils";
import { ProductoImagen } from "../tienda/ProductoImagen";

export function ListaProductos({ productos, vendidos }: { productos: Producto[]; vendidos: Record<string, number> }) {
  const router = useRouter();
  const [cargando, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const correr = (fn: () => Promise<{ ok: true; mensaje: string } | { ok: false; error: string }>) =>
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
      if (r.ok) router.refresh();
    });

  return (
    <>
      {msg && (
        <p role="status" className={`mt-5 rounded-lg border-2 p-4 text-lg font-semibold ${msg.ok ? "border-[#9fd3b2] bg-[#e7f4ec] text-[#17733c]" : "border-rojo bg-rojo-claro text-rojo-oscuro"}`}>
          {msg.ok ? "✓ " : ""}{msg.t}
        </p>
      )}
      <ul className="mt-5 space-y-3">
        {productos.map((p) => (
          <li key={p.id} className="tarjeta-g overflow-hidden">
            <div className="flex gap-4 p-4">
              <Link href={`/admin/productos/${p.id}`} className="w-24 shrink-0 sm:w-28">
                <ProductoImagen producto={p} sizes="112px" className="aspect-square rounded-md" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  {p.estado === "oculto" && <span className="rounded-sm bg-stone-200 px-2 py-0.5 text-base font-bold text-stone-700">Oculto</span>}
                  {p.stock === 0 && <span className="rounded-sm bg-rojo px-2 py-0.5 text-base font-bold text-white">Sin stock</span>}
                  {p.ejemplo && <span className="rounded-sm bg-[#fff8e1] px-2 py-0.5 text-base font-semibold text-[#7a5300]">Ejemplo</span>}
                </div>
                <h2 className="mt-1 text-xl font-bold leading-snug">{p.nombre}</h2>
                <p className="text-lg text-stone-600">{p.categoria}{p.variantes.length ? ` · ${p.variantes.join(", ")}` : ""}</p>
                <p className="mt-1 font-display text-2xl font-bold">$ {formatNumero(p.precio)}</p>
                {vendidos[p.id] > 0 && <p className="text-base text-stone-500">Vendidos: {vendidos[p.id]}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t-2 border-linea bg-papel px-4 py-3">
              {p.stock === null ? (
                <p className="text-lg">Stock: <b>sin control</b></p>
              ) : (
                <>
                  <span className="text-lg">Stock:</span>
                  <div className="flex h-12 items-center rounded-md border-2 border-stone-300 bg-white">
                    <button disabled={cargando || p.stock === 0} onClick={() => correr(() => stockAccion(p.id, (p.stock ?? 0) - 1))} aria-label={`Restar uno a ${p.nombre}`} className="h-full w-12 text-2xl font-bold disabled:opacity-30">−</button>
                    <span className="min-w-12 text-center text-xl font-bold">{p.stock}</span>
                    <button disabled={cargando} onClick={() => correr(() => stockAccion(p.id, (p.stock ?? 0) + 1))} aria-label={`Sumar uno a ${p.nombre}`} className="h-full w-12 text-2xl font-bold">+</button>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t-2 border-linea p-3 sm:flex">
              <Link href={`/admin/productos/${p.id}`} className="btn-g border-2 border-tinta bg-white hover:bg-papel">Editar</Link>
              {p.estado === "publicado" ? (
                <button disabled={cargando} onClick={() => correr(() => estadoProductoAccion(p.id, "oculto"))} className="btn-g border-2 border-stone-300 bg-white hover:border-tinta">Ocultar</button>
              ) : (
                <button disabled={cargando} onClick={() => correr(() => estadoProductoAccion(p.id, "publicado"))} className="btn-g bg-tinta text-white hover:bg-tinta-2">Publicar</button>
              )}
              {p.estado === "publicado" && (
                <a href={`/productos/${p.slug}`} target="_blank" className="btn-g col-span-2 border-2 border-stone-300 bg-white hover:border-tinta sm:col-span-1">Ver en la tienda</a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
