"use client";

import { useState } from "react";
import { formatNumero } from "@/lib/utils";
import { Icon } from "./Icon";

type Tab = "comprar" | "vender";

const anioActual = new Date().getFullYear();

export function HeroBuscador({ marcas }: { marcas: string[] }) {
  const [tab, setTab] = useState<Tab>("comprar");

  const tabs: { id: Tab; label: string }[] = [
    { id: "comprar", label: "Comprar" },
    { id: "vender", label: "Vender mi auto" },
  ];

  return (
    <div className="w-full max-w-[720px] overflow-hidden rounded-lg bg-white text-tinta shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="grid grid-cols-2 border-b border-linea" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`h-12 border-b-[3px] font-display text-lg font-bold uppercase tracking-wide transition-colors ${
              tab === t.id ? "border-rojo text-tinta" : "border-transparent text-stone-400 hover:text-tinta"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "comprar" ? (
        <form action="/autos" className="grid gap-3 p-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:p-5">
          <input name="q" className="campo" placeholder="Modelo (ej: Hilux, 208…)" aria-label="Modelo" />
          <select name="marca" className="campo" defaultValue="" aria-label="Marca">
            <option value="">Todas las marcas</option>
            {marcas.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select name="precioMax" className="campo" defaultValue="" aria-label="Precio hasta">
            <option value="">Precio hasta</option>
            {[15000000, 20000000, 25000000, 30000000, 40000000].map((n) => (
              <option key={n} value={n}>${formatNumero(n)}</option>
            ))}
          </select>
          <button className="btn-rojo"><Icon name="search" className="size-4" /> Buscar</button>
        </form>
      ) : (
        <form action="/vender" className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_0.8fr_auto] sm:p-5">
          <input name="marca" className="campo" placeholder="Marca de tu auto" aria-label="Marca de tu auto" required />
          <input name="modelo" className="campo" placeholder="Modelo" aria-label="Modelo" required />
          <select name="anio" className="campo" defaultValue="" aria-label="Año" required>
            <option value="" disabled>Año</option>
            {Array.from({ length: 25 }, (_, i) => anioActual - i).map((a) => <option key={a}>{a}</option>)}
          </select>
          <button className="btn-rojo">Publicar</button>
        </form>
      )}
    </div>
  );
}
