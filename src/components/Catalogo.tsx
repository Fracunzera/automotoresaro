"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Auto } from "@/lib/tipos";
import type { Financiacion } from "@/lib/negocio-tipos";
import { formatNumero } from "@/lib/utils";
import { CarCard } from "./CarCard";
import { Icon } from "./Icon";

export type FiltrosIniciales = {
  q?: string;
  marca?: string;
  carroceria?: string;
  transmision?: string;
  precioMax?: string;
};

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "anio-desc" | "km-asc";

const ordenes: Record<Orden, { label: string; fn: (a: Auto, b: Auto) => number }> = {
  relevancia: {
    label: "Más relevantes",
    fn: (a, b) => Number(a.estado === "reservado") - Number(b.estado === "reservado") || Number(!!b.destacado) - Number(!!a.destacado),
  },
  "precio-asc": { label: "Menor precio", fn: (a, b) => a.precio - b.precio },
  "precio-desc": { label: "Mayor precio", fn: (a, b) => b.precio - a.precio },
  "anio-desc": { label: "Más nuevos", fn: (a, b) => b.anio - a.anio },
  "km-asc": { label: "Menos kilómetros", fn: (a, b) => a.km - b.km },
};

const contar = <K extends string>(autos: Auto[], f: (a: Auto) => K) => {
  const m = new Map<K, number>();
  autos.forEach((a) => m.set(f(a), (m.get(f(a)) ?? 0) + 1));
  return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], "es"));
};

const toggle = (lista: string[], v: string) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

function Seccion({ titulo, children, abierta = true }: { titulo: string; children: ReactNode; abierta?: boolean }) {
  return (
    <details open={abierta} className="group border-b border-linea">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[15px] font-semibold text-tinta">
        {titulo}
        <Icon name="chevron" className="size-4 text-stone-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

function Check({ label, n, checked, onChange }: { label: string; n: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[15px] text-stone-700 hover:text-tinta">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-rojo" />
      <span className="flex-1">{label}</span>
      <span className="text-[13px] text-stone-400">{n}</span>
    </label>
  );
}

export function Catalogo({ autos, iniciales, fin }: { autos: Auto[]; iniciales: FiltrosIniciales; fin: Financiacion }) {
  const [q, setQ] = useState(iniciales.q ?? "");
  const [marcas, setMarcas] = useState<string[]>(iniciales.marca ? [iniciales.marca] : []);
  const [tipos, setTipos] = useState<string[]>(iniciales.carroceria ? [iniciales.carroceria] : []);
  const [combustibles, setCombustibles] = useState<string[]>([]);
  const [transmision, setTransmision] = useState(iniciales.transmision ?? "");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState(iniciales.precioMax ?? "");
  const [anioDesde, setAnioDesde] = useState("");
  const [kmMax, setKmMax] = useState("");
  const [orden, setOrden] = useState<Orden>("relevancia");
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    document.body.style.overflow = panel ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [panel]);

  const conteo = useMemo(
    () => ({
      marcas: contar(autos, (a) => a.marca),
      tipos: contar(autos, (a) => a.carroceria),
      combustibles: contar(autos, (a) => a.combustible),
      anios: Array.from(new Set(autos.map((a) => a.anio))).sort((a, b) => b - a),
    }),
    [autos],
  );

  const resultado = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return autos
      .filter((a) => {
        if (texto && !`${a.marca} ${a.modelo} ${a.version}`.toLowerCase().includes(texto)) return false;
        if (marcas.length && !marcas.includes(a.marca)) return false;
        if (tipos.length && !tipos.includes(a.carroceria)) return false;
        if (combustibles.length && !combustibles.includes(a.combustible)) return false;
        if (transmision && a.transmision !== transmision) return false;
        if (precioMin && a.precio < Number(precioMin)) return false;
        if (precioMax && a.precio > Number(precioMax)) return false;
        if (anioDesde && a.anio < Number(anioDesde)) return false;
        if (kmMax && a.km > Number(kmMax)) return false;
        return true;
      })
      .sort(ordenes[orden].fn);
  }, [autos, q, marcas, tipos, combustibles, transmision, precioMin, precioMax, anioDesde, kmMax, orden]);

  const limpiar = () => {
    setQ(""); setMarcas([]); setTipos([]); setCombustibles([]); setTransmision("");
    setPrecioMin(""); setPrecioMax(""); setAnioDesde(""); setKmMax("");
  };
  const activos =
    marcas.length + tipos.length + combustibles.length +
    [q, transmision, precioMin, precioMax, anioDesde, kmMax].filter(Boolean).length;

  // Filtros rápidos (chips), como en los portales grandes
  const chips: { label: string; activo: boolean; fn: () => void }[] = [
    { label: "Automático", activo: transmision === "Automática", fn: () => setTransmision(transmision === "Automática" ? "" : "Automática") },
    { label: "Manual", activo: transmision === "Manual", fn: () => setTransmision(transmision === "Manual" ? "" : "Manual") },
    { label: "SUV", activo: tipos.includes("SUV"), fn: () => setTipos(toggle(tipos, "SUV")) },
    { label: "Pick-up", activo: tipos.includes("Pick-up"), fn: () => setTipos(toggle(tipos, "Pick-up")) },
    { label: "Hasta $20 millones", activo: precioMax === "20000000", fn: () => setPrecioMax(precioMax === "20000000" ? "" : "20000000") },
    { label: "Menos de 50.000 km", activo: kmMax === "50000", fn: () => setKmMax(kmMax === "50000" ? "" : "50000") },
    { label: "Diésel", activo: combustibles.includes("Diésel"), fn: () => setCombustibles(toggle(combustibles, "Diésel")) },
  ];

  const filtros = (
    <>
      <Seccion titulo="Precio">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" inputMode="numeric" placeholder="Mínimo" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} className="campo" aria-label="Precio mínimo" />
          <input type="number" inputMode="numeric" placeholder="Máximo" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} className="campo" aria-label="Precio máximo" />
        </div>
      </Seccion>
      <Seccion titulo="Marca">
        {conteo.marcas.map(([m, n]) => (
          <Check key={m} label={m} n={n} checked={marcas.includes(m)} onChange={() => setMarcas(toggle(marcas, m))} />
        ))}
      </Seccion>
      <Seccion titulo="Tipo de auto">
        {conteo.tipos.map(([t, n]) => (
          <Check key={t} label={t} n={n} checked={tipos.includes(t)} onChange={() => setTipos(toggle(tipos, t))} />
        ))}
      </Seccion>
      <Seccion titulo="Año y kilometraje">
        <div className="grid grid-cols-2 gap-2">
          <select value={anioDesde} onChange={(e) => setAnioDesde(e.target.value)} className="campo" aria-label="Año desde">
            <option value="">Año desde</option>
            {conteo.anios.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={kmMax} onChange={(e) => setKmMax(e.target.value)} className="campo" aria-label="Kilómetros hasta">
            <option value="">Km hasta</option>
            {[30000, 50000, 80000, 100000, 150000].map((k) => <option key={k} value={k}>{formatNumero(k)}</option>)}
          </select>
        </div>
      </Seccion>
      <Seccion titulo="Transmisión">
        <div className="grid grid-cols-2 gap-2">
          {["Manual", "Automática"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTransmision(transmision === t ? "" : t)}
              className={`h-10 rounded-md border text-sm font-semibold ${transmision === t ? "border-tinta bg-tinta text-white" : "border-stone-300 text-stone-700 hover:border-tinta"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </Seccion>
      <Seccion titulo="Combustible">
        {conteo.combustibles.map(([c, n]) => (
          <Check key={c} label={c} n={n} checked={combustibles.includes(c)} onChange={() => setCombustibles(toggle(combustibles, c))} />
        ))}
      </Seccion>
    </>
  );

  return (
    <>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscá por marca o modelo"
          className="campo h-12! pl-12! text-base!"
          aria-label="Buscar por marca o modelo"
        />
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={c.fn}
            aria-pressed={c.activo}
            className={`h-9 shrink-0 rounded-md border px-3 text-sm font-medium transition-colors ${
              c.activo ? "border-tinta bg-tinta text-white" : "border-stone-300 bg-white text-stone-700 hover:border-tinta"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[272px_1fr]">
        <aside className="hidden lg:block">
          <div className="flex items-center justify-between border-b border-linea pb-3">
            <h2 className="titulo text-xl uppercase">Filtros</h2>
            {activos > 0 && <button onClick={limpiar} className="text-sm font-semibold text-rojo hover:underline">Limpiar ({activos})</button>}
          </div>
          {filtros}
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-[15px] text-stone-600">
              <span className="font-semibold text-tinta">{resultado.length}</span> {resultado.length === 1 ? "resultado" : "resultados"}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPanel(true)} className="btn-borde h-10! px-4! lg:hidden">
                <Icon name="gear" className="size-4" /> Filtros{activos > 0 ? ` (${activos})` : ""}
              </button>
              <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className="campo h-10! w-auto!" aria-label="Ordenar por">
                {Object.entries(ordenes).map(([k, o]) => <option key={k} value={k}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {resultado.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {resultado.map((a, i) => (
                <FragmentoConPromo key={a.slug} mostrarPromo={i === 2}>
                  <CarCard auto={a} fin={fin} />
                </FragmentoConPromo>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-linea bg-papel px-6 py-12 text-center">
              <p className="titulo text-2xl">No hay autos con esos filtros</p>
              <p className="mx-auto mt-2 max-w-md text-stone-600">
                El stock cambia todas las semanas. Contanos qué buscás y te avisamos cuando entre.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button onClick={limpiar} className="btn-borde">Ver todos los autos</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel de filtros en celular */}
      {panel && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="flex h-14 items-center justify-between border-b border-linea px-4">
            <button onClick={limpiar} className="text-sm font-semibold text-rojo">Limpiar</button>
            <h2 className="titulo text-xl uppercase">Filtros</h2>
            <button onClick={() => setPanel(false)} aria-label="Cerrar filtros" className="-mr-2 p-2"><Icon name="close" className="size-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4">{filtros}</div>
          <div className="border-t border-linea p-4">
            <button onClick={() => setPanel(false)} className="btn-rojo w-full">
              Ver {resultado.length} {resultado.length === 1 ? "auto" : "autos"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Intercala una tarjeta de "vendé tu auto" dentro de la grilla. */
function FragmentoConPromo({ children, mostrarPromo }: { children: ReactNode; mostrarPromo: boolean }) {
  return (
    <>
      {mostrarPromo && (
        <Link href="/vender" className="flex flex-col justify-between rounded-lg bg-tinta p-6 text-white transition-colors hover:bg-tinta-2">
          <div>
            <p className="sobretitulo">Vendé tu auto</p>
            <p className="titulo mt-3 text-[32px] text-white">¿Querés vender el tuyo?</p>
            <p className="mt-3 text-[15px] text-stone-300">Lo publicamos acá y nos ocupamos de todo: interesados, papeles y cobro. Cobramos solo si se vende.</p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-semibold">
            Publicar mi auto <Icon name="arrow" className="size-4" />
          </span>
        </Link>
      )}
      {children}
    </>
  );
}
