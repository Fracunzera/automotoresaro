"use client";

import { useMemo, useState } from "react";
import { hayStock, type Producto } from "@/lib/productos-tipos";
import { Icon } from "../Icon";
import { ProductoCard } from "./ProductoCard";

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nuevos";
const ORDENES: Record<Orden, string> = {
  relevancia: "Más relevantes",
  "precio-asc": "Menor precio",
  "precio-desc": "Mayor precio",
  nuevos: "Más nuevos",
};

export function CatalogoProductos({ productos, inicial }: { productos: Producto[]; inicial: { q?: string; categoria?: string } }) {
  const [q, setQ] = useState(inicial.q ?? "");
  const [categoria, setCategoria] = useState(inicial.categoria ?? "");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [orden, setOrden] = useState<Orden>("relevancia");

  const categorias = useMemo(() => Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es")), [productos]);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = productos.filter(
      (p) =>
        (!t || `${p.nombre} ${p.categoria} ${p.descripcion}`.toLowerCase().includes(t)) &&
        (!categoria || p.categoria === categoria) &&
        (!soloOfertas || p.precioAnterior > p.precio),
    );
    const orden_: Record<Orden, (a: Producto, b: Producto) => number> = {
      relevancia: (a, b) => Number(hayStock(b)) - Number(hayStock(a)) || Number(b.destacado) - Number(a.destacado),
      "precio-asc": (a, b) => a.precio - b.precio,
      "precio-desc": (a, b) => b.precio - a.precio,
      nuevos: (a, b) => +new Date(b.creado) - +new Date(a.creado),
    };
    return r.sort(orden_[orden]);
  }, [productos, q, categoria, soloOfertas, orden]);

  const chip = (activo: boolean) =>
    `h-9 shrink-0 rounded-md border px-3 text-sm font-medium transition-colors ${activo ? "border-tinta bg-tinta text-white" : "border-stone-300 bg-white text-stone-700 hover:border-tinta"}`;

  return (
    <>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="¿Qué estás buscando?" aria-label="Buscar productos" className="campo h-12! pl-12! text-base!" />
      </div>
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button onClick={() => setCategoria("")} aria-pressed={!categoria} className={chip(!categoria)}>Todo</button>
        {categorias.map((c) => (
          <button key={c} onClick={() => setCategoria(categoria === c ? "" : c)} aria-pressed={categoria === c} className={chip(categoria === c)}>{c}</button>
        ))}
        <button onClick={() => setSoloOfertas((v) => !v)} aria-pressed={soloOfertas} className={chip(soloOfertas)}>Ofertas</button>
      </div>
      <div className="mt-6 mb-4 flex items-center justify-between gap-3">
        <p className="text-[15px] text-stone-600"><span className="font-semibold text-tinta">{lista.length}</span> {lista.length === 1 ? "producto" : "productos"}</p>
        <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className="campo h-10! w-auto!" aria-label="Ordenar por">
          {Object.entries(ORDENES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {lista.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((p) => <ProductoCard key={p.id} p={p} />)}
        </div>
      ) : (
        <div className="rounded-lg bg-papel px-6 py-12 text-center">
          <p className="titulo text-2xl">No encontramos productos</p>
          <p className="mt-2 text-stone-600">Probá con otra búsqueda o escribinos y te ayudamos.</p>
          <button onClick={() => { setQ(""); setCategoria(""); setSoloOfertas(false); }} className="btn-borde mt-5">Ver todo</button>
        </div>
      )}
    </>
  );
}
