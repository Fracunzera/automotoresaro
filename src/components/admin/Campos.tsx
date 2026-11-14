"use client";

import type { ReactNode } from "react";

const puntos = (n: number) => (n ? n.toLocaleString("es-AR") : "");
const soloNumeros = (t: string) => Number(t.replace(/\D/g, "").slice(0, 12)) || 0;

/** Campo de plata: muestra los puntos de miles mientras se escribe (32.500.000). */
export function CampoPesos({
  id, label, valor, onChange, ayuda, requerido,
}: { id: string; label: ReactNode; valor: number; onChange: (n: number) => void; ayuda?: string; requerido?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta-g">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-stone-500">$</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={puntos(valor)}
          onChange={(e) => onChange(soloNumeros(e.target.value))}
          required={requerido}
          className="campo-g pl-9!"
          placeholder="0"
        />
      </div>
      {ayuda && <p className="ayuda-g">{ayuda}</p>}
    </div>
  );
}

/** Campo de número entero con puntos de miles (ej. kilómetros). */
export function CampoNumero({
  id, label, valor, onChange, sufijo, ayuda, requerido,
}: { id: string; label: ReactNode; valor: number; onChange: (n: number) => void; sufijo?: string; ayuda?: string; requerido?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta-g">{label}</label>
      <div className="relative">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={puntos(valor)}
          onChange={(e) => onChange(soloNumeros(e.target.value))}
          required={requerido}
          className={`campo-g ${sufijo ? "pr-14!" : ""}`}
          placeholder="0"
        />
        {sufijo && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-stone-500">{sufijo}</span>}
      </div>
      {ayuda && <p className="ayuda-g">{ayuda}</p>}
    </div>
  );
}

/** Botones grandes para elegir una opción (en vez de un desplegable). */
export function Opciones<T extends string>({
  label, opciones, valor, onChange, textos,
}: { label: ReactNode; opciones: readonly T[]; valor: T | ""; onChange: (v: T) => void; textos?: Partial<Record<T, string>> }) {
  return (
    <fieldset>
      <legend className="etiqueta-g">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={valor === o}
            className={`min-h-14 rounded-md border-2 px-5 text-lg font-semibold transition-colors ${
              valor === o ? "border-tinta bg-tinta text-white" : "border-stone-300 bg-white hover:border-tinta"
            }`}
          >
            {textos?.[o] ?? o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Casilla grande con texto. */
export function Casilla({ label, ayuda, valor, onChange }: { label: string; ayuda?: string; valor: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-md border-2 border-stone-300 bg-white p-4 has-[:checked]:border-tinta">
      <input type="checkbox" checked={valor} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-7 shrink-0 accent-rojo" />
      <span>
        <span className="block text-lg font-semibold">{label}</span>
        {ayuda && <span className="block text-base text-stone-600">{ayuda}</span>}
      </span>
    </label>
  );
}
