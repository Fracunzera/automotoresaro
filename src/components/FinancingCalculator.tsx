"use client";

import { useAgencia } from "./AgenciaContext";
import { useMemo, useState } from "react";
import type { Financiacion } from "@/lib/negocio-tipos";
import { cuotaMensual, formatNumero, whatsappLink } from "@/lib/utils";

type Props = {
  fin: Financiacion;
  /** Si viene, el precio queda fijo (ficha de un auto). Si no, se puede editar. */
  precio?: number;
  tituloAuto?: string;
  /** "panel": columna angosta. "ancho": controles y resultado lado a lado. */
  variante?: "panel" | "ancho";
};

export function FinancingCalculator({ fin, precio: precioFijo, tituloAuto, variante = "panel" }: Props) {
  const { tna, anticipoMinimo, plazos } = fin;
  const { whatsapp } = useAgencia();
  const [precio, setPrecio] = useState(precioFijo ?? 20000000);
  const minAnticipo = Math.round(precio * anticipoMinimo);
  const [anticipo, setAnticipo] = useState(Math.round((precioFijo ?? 20000000) * 0.4));
  const [plazo, setPlazo] = useState<number>(plazos[Math.floor(plazos.length / 2)]);

  const anticipoReal = Math.min(Math.max(anticipo, minAnticipo), precio);
  const financiado = precio - anticipoReal;
  const cuota = useMemo(() => cuotaMensual(financiado, plazo, tna), [financiado, plazo, tna]);
  const total = cuota * plazo;

  const mensaje = `Hola, quiero financiar${tituloAuto ? ` el ${tituloAuto}` : " un auto"}: precio $${formatNumero(precio)}, anticipo $${formatNumero(
    anticipoReal,
  )}, ${plazo} cuotas de aprox. $${formatNumero(cuota)}. ¿Qué necesito para avanzar?`;

  const controles = (
    <div className="space-y-6">
      {precioFijo === undefined && (
        <div>
          <label className="etiqueta" htmlFor="fin-precio">Precio del auto</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
            <input
              id="fin-precio"
              type="number"
              inputMode="numeric"
              min={1000000}
              step={100000}
              value={precio}
              onChange={(e) => setPrecio(Math.max(0, Number(e.target.value)))}
              className="campo pl-7!"
            />
          </div>
        </div>
      )}

      <div>
        <div className="flex items-baseline justify-between">
          <label className="etiqueta" htmlFor="fin-anticipo">Anticipo</label>
          <span className="font-display text-xl font-bold">${formatNumero(anticipoReal)}</span>
        </div>
        <input
          id="fin-anticipo"
          type="range"
          min={minAnticipo}
          max={precio}
          step={50000}
          value={anticipoReal}
          onChange={(e) => setAnticipo(Number(e.target.value))}
          className="w-full accent-rojo"
        />
        <div className="flex justify-between text-[13px] text-stone-500">
          <span>Mín. {Math.round(anticipoMinimo * 100)}%</span>
          <span>Puede ser tu usado</span>
        </div>
      </div>

      <div>
        <span className="etiqueta">Cantidad de cuotas</span>
        <div className="flex overflow-hidden rounded-md border border-stone-300">
          {plazos.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlazo(p)}
              aria-pressed={plazo === p}
              className={`h-10 flex-1 border-r border-stone-300 text-[15px] font-semibold last:border-r-0 ${
                plazo === p ? "bg-tinta text-white" : "bg-white text-stone-700 hover:bg-papel"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const resultado = (
    <div className="rounded-md bg-papel p-5">
      <p className="text-sm text-stone-600">{plazo} cuotas fijas de</p>
      <p className="font-display text-[44px] font-bold leading-none tracking-tight">
        <span className="mr-0.5 align-[0.35em] text-[0.5em]">$</span>{formatNumero(cuota)}
      </p>
      <dl className="mt-4 space-y-1.5 border-t border-linea pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-stone-600">Monto a financiar</dt><dd className="font-semibold">${formatNumero(financiado)}</dd></div>
        <div className="flex justify-between"><dt className="text-stone-600">TNA de referencia</dt><dd className="font-semibold">{Math.round(tna * 100)}%</dd></div>
        <div className="flex justify-between"><dt className="text-stone-600">Total en cuotas</dt><dd className="font-semibold">${formatNumero(total)}</dd></div>
      </dl>
      <a href={whatsappLink(whatsapp, mensaje)} target="_blank" rel="noopener noreferrer" className="btn-rojo mt-5 w-full">
        Consultar esta financiación
      </a>
      <p className="mt-3 text-xs leading-snug text-stone-500">
        *Simulación de referencia. Tasa final, gastos y aprobación sujetos a la entidad financiera y a tu perfil crediticio.
      </p>
    </div>
  );

  if (variante === "ancho") {
    return <div className="grid gap-8 md:grid-cols-2 md:items-start">{controles}{resultado}</div>;
  }
  return <div className="space-y-6">{controles}{resultado}</div>;
}
