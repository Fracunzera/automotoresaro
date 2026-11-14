"use client";

import { useMemo, useState } from "react";
import type { Auto } from "@/data/autos";
import { formatPrecio } from "@/lib/utils";
import { CarCard } from "./CarCard";
import { Icon } from "./Icon";

export type FiltrosIniciales = {
  q?: string;
  marca?: string;
  carroceria?: string;
  precioMax?: string;
};

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "anio-desc" | "km-asc";

const unicos = (arr: string[]) => Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, "es"));

export function Catalogo({ autos, iniciales }: { autos: Auto[]; iniciales: FiltrosIniciales }) {
  const marcas = useMemo(() => unicos(autos.map((a) => a.marca)), [autos]);
  const carrocerias = useMemo(() => unicos(autos.map((a) => a.carroceria)), [autos]);
  const combustibles = useMemo(() => unicos(autos.map((a) => a.combustible)), [autos]);
  const anios = useMemo(() => Array.from(new Set(autos.map((a) => a.anio))).sort((a, b) => b - a), [autos]);

  const [q, setQ] = useState(iniciales.q ?? "");
  const [marca, setMarca] = useState(iniciales.marca ?? "");
  const [carroceria, setCarroceria] = useState(iniciales.carroceria ?? "");
  const [combustible, setCombustible] = useState("");
  const [transmision, setTransmision] = useState("");
  const [anioMin, setAnioMin] = useState("");
  const [precioMax, setPrecioMax] = useState(iniciales.precioMax ?? "");
  const [kmMax, setKmMax] = useState("");
  const [orden, setOrden] = useState<Orden>("relevancia");
  const [verFiltros, setVerFiltros] = useState(false);

  const resultado = useMemo(() => {
    const texto = q.trim().toLowerCase();
    const lista = autos.filter((a) => {
      if (texto && !`${a.marca} ${a.modelo} ${a.version}`.toLowerCase().includes(texto)) return false;
      if (marca && a.marca !== marca) return false;
      if (carroceria && a.carroceria !== carroceria) return false;
      if (combustible && a.combustible !== combustible) return false;
      if (transmision && a.transmision !== transmision) return false;
      if (anioMin && a.anio < Number(anioMin)) return false;
      if (precioMax && a.precio > Number(precioMax)) return false;
      if (kmMax && a.km > Number(kmMax)) return false;
      return true;
    });
    const ordenadores: Record<Orden, (a: Auto, b: Auto) => number> = {
      relevancia: (a, b) => Number(!!a.reservado) - Number(!!b.reservado) || Number(!!b.destacado) - Number(!!a.destacado),
      "precio-asc": (a, b) => a.precio - b.precio,
      "precio-desc": (a, b) => b.precio - a.precio,
      "anio-desc": (a, b) => b.anio - a.anio,
      "km-asc": (a, b) => a.km - b.km,
    };
    return lista.sort(ordenadores[orden]);
  }, [autos, q, marca, carroceria, combustible, transmision, anioMin, precioMax, kmMax, orden]);

  const limpiar = () => {
    setQ(""); setMarca(""); setCarroceria(""); setCombustible("");
    setTransmision(""); setAnioMin(""); setPrecioMax(""); setKmMax("");
  };

  const filtrosActivos = [q, marca, carroceria, combustible, transmision, anioMin, precioMax, kmMax].filter(Boolean).length;

  const select = (id: string, label: string, value: string, set: (v: string) => void, opciones: { v: string; l: string }[]) => (
    <div>
      <label className="etiqueta" htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => set(e.target.value)} className="campo">
        <option value="">Todos</option>
        {opciones.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </div>
  );

  const opts = (arr: (string | number)[]) => arr.map((x) => ({ v: String(x), l: String(x) }));

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className={`${verFiltros ? "block" : "hidden"} space-y-4 lg:block`}>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Filtros</h2>
            {filtrosActivos > 0 && (
              <button onClick={limpiar} className="text-sm font-medium text-marca-600 hover:underline">Limpiar</button>
            )}
          </div>
          {select("marca", "Marca", marca, setMarca, opts(marcas))}
          {select("carroceria", "Tipo", carroceria, setCarroceria, opts(carrocerias))}
          {select("precio", "Precio hasta", precioMax, setPrecioMax,
            [15000000, 20000000, 25000000, 30000000, 40000000].map((n) => ({ v: String(n), l: formatPrecio(n) })))}
          {select("anio", "Año desde", anioMin, setAnioMin, opts(anios))}
          {select("km", "Kilometraje hasta", kmMax, setKmMax,
            [30000, 50000, 80000, 100000, 150000].map((n) => ({ v: String(n), l: `${n.toLocaleString("es-AR")} km` })))}
          {select("transmision", "Transmisión", transmision, setTransmision, opts(["Manual", "Automática"]))}
          {select("combustible", "Combustible", combustible, setCombustible, opts(combustibles))}
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscá por marca o modelo"
              className="campo pl-10"
              aria-label="Buscar"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setVerFiltros((v) => !v)} className="btn-secundario flex-1 py-2.5! lg:hidden">
              Filtros{filtrosActivos > 0 ? ` (${filtrosActivos})` : ""}
            </button>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              className="campo w-auto! flex-1"
              aria-label="Ordenar"
            >
              <option value="relevancia">Más relevantes</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
              <option value="anio-desc">Más nuevos</option>
              <option value="km-asc">Menos kilómetros</option>
            </select>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-500">
          {resultado.length} {resultado.length === 1 ? "auto encontrado" : "autos encontrados"}
        </p>

        {resultado.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {resultado.map((a) => (
              <CarCard key={a.slug} auto={a} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-semibold text-slate-900">No encontramos autos con esos filtros</p>
            <p className="mt-1 text-sm text-slate-500">Probá ampliar la búsqueda o avisanos qué estás buscando y te lo conseguimos.</p>
            <button onClick={limpiar} className="btn-secundario mt-4">Ver todos los autos</button>
          </div>
        )}
      </div>
    </div>
  );
}
