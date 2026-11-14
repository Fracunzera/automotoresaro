"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { guardarAjustesAccion } from "@/app/admin/acciones";
import { MODO_COMISION_TEXTO, calcularGanancia, type Ajustes, type ModoComision } from "@/lib/negocio-tipos";
import { cuotaMensual, formatNumero } from "@/lib/utils";
import { CampoNumero, CampoPesos, Opciones } from "./Campos";

const pesos = (n: number) => `$ ${formatNumero(n)}`;
const PLAZOS_POSIBLES = [6, 12, 18, 24, 36, 48, 60];
const EJEMPLO = 20_000_000;

export function AjustesForm({ inicial }: { inicial: Ajustes }) {
  const router = useRouter();
  const [a, setA] = useState<Ajustes>(inicial);
  const [tnaTexto, setTnaTexto] = useState(String(inicial.financiacion.tna));
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [guardando, start] = useTransition();
  const setFin = (k: keyof Ajustes["financiacion"], v: number | number[]) => setA((p) => ({ ...p, financiacion: { ...p.financiacion, [k]: v } }));

  const comisionEjemplo = calcularGanancia(
    { tipo: "consignacion", costo: 0, gastos: 0, duenoNombre: "", duenoTelefono: "", comisionModo: a.comisionModo, comisionValor: a.comisionValor, notas: "" },
    EJEMPLO,
    a.comisionMinima,
  );
  const plazoMax = Math.max(...a.financiacion.plazos, 0);
  const cuotaEjemplo = plazoMax
    ? cuotaMensual(EJEMPLO * (1 - a.financiacion.anticipoMinimo / 100), plazoMax, a.financiacion.tna / 100)
    : 0;

  function guardar() {
    setMsg(null);
    start(async () => {
      const r = await guardarAjustesAccion({ ...a });
      setMsg(r.ok ? { ok: true, texto: r.mensaje } : { ok: false, texto: r.error });
      if (r.ok) router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); guardar(); }} className="space-y-6">
      {msg && (
        <p role="status" className={`rounded-lg border-2 p-4 text-lg font-semibold ${msg.ok ? "border-[#9fd3b2] bg-[#e7f4ec] text-[#17733c]" : "border-rojo bg-rojo-claro text-rojo-oscuro"}`}>
          {msg.ok ? "✓ " : ""}{msg.texto}
        </p>
      )}

      <section id="comisiones" className="tarjeta-g scroll-mt-32 space-y-6 p-5 sm:p-7">
        <div>
          <h2 className="text-2xl font-bold">Comisión por autos de clientes</h2>
          <p className="mt-1 text-lg text-stone-600">
            Es lo que se propone automáticamente cuando cargás un auto que es de otra persona (consignación). En cada auto lo podés cambiar.
          </p>
        </div>
        <Opciones
          label="¿Cómo cobrás normalmente?"
          opciones={["porcentaje", "fijo", "neto"] as readonly ModoComision[]}
          textos={MODO_COMISION_TEXTO}
          valor={a.comisionModo}
          onChange={(v) => setA((p) => ({ ...p, comisionModo: v, comisionValor: v === "porcentaje" ? 5 : v === "fijo" ? 500_000 : 0 }))}
        />
        {a.comisionModo === "porcentaje" && (
          <CampoNumero id="valor" label="Porcentaje" valor={a.comisionValor} onChange={(v) => setA((p) => ({ ...p, comisionValor: Math.min(v, 100) }))} sufijo="%" />
        )}
        {a.comisionModo === "fijo" && (
          <CampoPesos id="valor" label="Monto fijo por auto" valor={a.comisionValor} onChange={(v) => setA((p) => ({ ...p, comisionValor: v }))} />
        )}
        {a.comisionModo === "neto" && (
          <p className="rounded-md bg-papel p-4 text-lg">
            En cada auto vas a escribir cuánto recibe el dueño. Lo que se venda por encima de eso es tu ganancia.
          </p>
        )}
        {a.comisionModo !== "neto" && (
          <CampoPesos
            id="minima"
            label="Comisión mínima (opcional)"
            valor={a.comisionMinima}
            onChange={(v) => setA((p) => ({ ...p, comisionMinima: v }))}
            ayuda="Si el porcentaje da menos que esto, se cobra el mínimo. Dejalo en 0 si no usás mínimo."
          />
        )}
        {comisionEjemplo !== null && (
          <p className="rounded-md bg-tinta p-4 text-lg text-white">
            Ejemplo: en un auto de {pesos(EJEMPLO)} ganás <b>{pesos(comisionEjemplo)}</b> y al dueño le quedan {pesos(EJEMPLO - comisionEjemplo)}.
          </p>
        )}
      </section>

      <section id="financiacion" className="tarjeta-g scroll-mt-32 space-y-6 p-5 sm:p-7">
        <div>
          <h2 className="text-2xl font-bold">Financiación</h2>
          <p className="mt-1 text-lg text-stone-600">Son los valores del simulador de cuotas que ven los clientes en la página.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="tna" className="etiqueta-g">Tasa anual (TNA)</label>
            <div className="relative">
              <input
                id="tna"
                inputMode="decimal"
                value={tnaTexto}
                onChange={(e) => {
                  const t = e.target.value.replace(/[^\d.,]/g, "");
                  setTnaTexto(t);
                  setFin("tna", Number(t.replace(",", ".")) || 0);
                }}
                className="campo-g pr-12!"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-stone-500">%</span>
            </div>
            <p className="ayuda-g">La que te pasa la financiera.</p>
          </div>
          <CampoNumero id="anticipo" label="Anticipo mínimo" valor={a.financiacion.anticipoMinimo} onChange={(v) => setFin("anticipoMinimo", Math.min(v, 100))} sufijo="%" />
        </div>
        <fieldset>
          <legend className="etiqueta-g">Cantidad de cuotas que ofrecés</legend>
          <div className="flex flex-wrap gap-2">
            {PLAZOS_POSIBLES.map((p) => {
              const on = a.financiacion.plazos.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFin("plazos", on ? a.financiacion.plazos.filter((x) => x !== p) : [...a.financiacion.plazos, p].sort((x, y) => x - y))}
                  className={`min-h-14 min-w-20 rounded-md border-2 px-4 text-lg font-semibold ${on ? "border-tinta bg-tinta text-white" : "border-stone-300 bg-white hover:border-tinta"}`}
                >
                  {on ? "✓ " : ""}{p}
                </button>
              );
            })}
          </div>
        </fieldset>
        {cuotaEjemplo > 0 && (
          <p className="rounded-md bg-tinta p-4 text-lg text-white">
            Ejemplo: un auto de {pesos(EJEMPLO)} con {a.financiacion.anticipoMinimo}% de anticipo queda en <b>{plazoMax} cuotas de {pesos(cuotaEjemplo)}</b>.
          </p>
        )}
      </section>

      <section className="tarjeta-g space-y-6 p-5 sm:p-7">
        <h2 className="text-2xl font-bold">Avisos</h2>
        <CampoNumero
          id="dias"
          label="Avisarme cuando un auto lleva más de"
          valor={a.diasAlerta}
          onChange={(v) => setA((p) => ({ ...p, diasAlerta: v }))}
          sufijo="días"
          ayuda="Aparece en el Inicio, para revisar el precio o las fotos."
        />
      </section>

      <div className="sticky bottom-0 -mx-4 border-t-2 border-linea bg-white p-4 sm:static sm:mx-0 sm:rounded-lg sm:border-2">
        <button disabled={guardando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">
          {guardando ? "Guardando…" : "Guardar ajustes"}
        </button>
      </div>
    </form>
  );
}
