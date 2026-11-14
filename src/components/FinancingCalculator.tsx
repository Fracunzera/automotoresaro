"use client";

import { useMemo, useState } from "react";
import { site } from "@/config/site";
import { cuotaMensual, formatPrecio, whatsappLink } from "@/lib/utils";

type Props = {
  /** Si viene, el precio queda fijo (ficha de un auto). Si no, se puede editar. */
  precio?: number;
  tituloAuto?: string;
};

export function FinancingCalculator({ precio: precioFijo, tituloAuto }: Props) {
  const { tna, anticipoMinimo, plazos } = site.financiacion;
  const [precio, setPrecio] = useState(precioFijo ?? 20000000);
  const minAnticipo = Math.round(precio * anticipoMinimo);
  const [anticipo, setAnticipo] = useState(Math.round((precioFijo ?? 20000000) * 0.4));
  const [plazo, setPlazo] = useState<number>(plazos[Math.floor(plazos.length / 2)]);

  const anticipoReal = Math.min(Math.max(anticipo, minAnticipo), precio);
  const financiado = precio - anticipoReal;
  const cuota = useMemo(() => cuotaMensual(financiado, plazo, tna), [financiado, plazo, tna]);

  const mensaje = `Hola! Quiero financiar${tituloAuto ? ` el ${tituloAuto}` : " un auto"}: precio ${formatPrecio(
    precio,
  )}, anticipo ${formatPrecio(anticipoReal)}, ${plazo} cuotas de aprox. ${formatPrecio(cuota)}. ¿Me pasan los requisitos?`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-bold text-slate-900">Simulá tu financiación</h3>
      <p className="mt-1 text-sm text-slate-500">Calculá tu cuota en segundos. Sin compromiso.</p>

      <div className="mt-5 space-y-5">
        {precioFijo === undefined && (
          <div>
            <label className="etiqueta" htmlFor="precio">Precio del auto</label>
            <input
              id="precio"
              type="number"
              min={1000000}
              step={100000}
              value={precio}
              onChange={(e) => setPrecio(Math.max(0, Number(e.target.value)))}
              className="campo"
            />
          </div>
        )}

        <div>
          <div className="flex items-baseline justify-between">
            <label className="etiqueta" htmlFor="anticipo">Anticipo</label>
            <span className="text-sm font-semibold text-slate-900">{formatPrecio(anticipoReal)}</span>
          </div>
          <input
            id="anticipo"
            type="range"
            min={minAnticipo}
            max={precio}
            step={50000}
            value={anticipoReal}
            onChange={(e) => setAnticipo(Number(e.target.value))}
            className="w-full accent-marca-600"
          />
          <p className="text-xs text-slate-500">Mínimo {Math.round(anticipoMinimo * 100)}% ({formatPrecio(minAnticipo)}). Podés usar tu usado como anticipo.</p>
        </div>

        <div>
          <span className="etiqueta">Plazo</span>
          <div className="grid grid-cols-5 gap-2">
            {plazos.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlazo(p)}
                className={`rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                  plazo === p
                    ? "border-marca-600 bg-marca-50 text-marca-700"
                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">cuotas mensuales</p>
        </div>

        <div className="rounded-xl bg-marca-950 p-4 text-white">
          <p className="text-xs text-slate-300">Cuota mensual estimada</p>
          <p className="text-3xl font-extrabold">{formatPrecio(cuota)}</p>
          <p className="mt-1 text-xs text-slate-400">
            Financiás {formatPrecio(financiado)} · TNA {Math.round(tna * 100)}% · Cuota fija
          </p>
        </div>

        <a href={whatsappLink(mensaje)} target="_blank" rel="noopener noreferrer" className="btn-acento w-full">
          Quiero esta financiación
        </a>
        <p className="text-[11px] leading-snug text-slate-400">
          Simulación de referencia. La aprobación, tasa final y gastos dependen de la entidad financiera y de tu perfil crediticio.
        </p>
      </div>
    </div>
  );
}
