"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { guardarConfigTiendaAccion } from "@/app/admin/acciones-tienda";
import type { ConfigTienda } from "@/lib/productos-tipos";
import { Casilla, CampoPesos } from "./Campos";

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: ReactNode }) {
  return (
    <section className="tarjeta-g space-y-5 p-5 sm:p-7">
      <div>
        <h2 className="text-2xl font-bold">{titulo}</h2>
        {ayuda && <p className="mt-1 text-lg text-stone-600">{ayuda}</p>}
      </div>
      {children}
    </section>
  );
}

export function ConfigTiendaForm({ inicial, mpToken }: { inicial: ConfigTienda; mpToken: boolean }) {
  const router = useRouter();
  const [c, setC] = useState<ConfigTienda>(inicial);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [guardando, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(async () => {
          const r = await guardarConfigTiendaAccion(c);
          setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
          if (r.ok) router.refresh();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }}
      className="space-y-6"
    >
      {msg && (
        <p role="status" className={`rounded-lg border-2 p-4 text-lg font-semibold ${msg.ok ? "border-[#9fd3b2] bg-[#e7f4ec] text-[#17733c]" : "border-rojo bg-rojo-claro text-rojo-oscuro"}`}>
          {msg.ok ? "✓ " : ""}{msg.t}
        </p>
      )}

      <Seccion titulo="Entregas">
        <Casilla label="Retiro en el local" valor={c.retiro.activo} onChange={(v) => setC({ ...c, retiro: { ...c.retiro, activo: v } })} />
        {c.retiro.activo && (
          <div>
            <label htmlFor="retiro-texto" className="etiqueta-g">Aclaración para el retiro</label>
            <input id="retiro-texto" value={c.retiro.texto} onChange={(e) => setC({ ...c, retiro: { ...c.retiro, texto: e.target.value } })} className="campo-g" />
          </div>
        )}
        <Casilla label="Envío a domicilio" valor={c.domicilio.activo} onChange={(v) => setC({ ...c, domicilio: { ...c.domicilio, activo: v } })} />
        {c.domicilio.activo && (
          <div className="space-y-5 rounded-md border-2 border-linea p-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <CampoPesos id="costo-envio" label="Costo del envío" valor={c.domicilio.costo} onChange={(v) => setC({ ...c, domicilio: { ...c.domicilio, costo: v } })} ayuda="0 = siempre gratis." />
              <CampoPesos id="gratis-desde" label="Envío gratis desde" valor={c.domicilio.gratisDesde} onChange={(v) => setC({ ...c, domicilio: { ...c.domicilio, gratisDesde: v } })} ayuda="0 = nunca es gratis." />
            </div>
            <div>
              <label htmlFor="envio-texto" className="etiqueta-g">Aclaración para los envíos</label>
              <input id="envio-texto" value={c.domicilio.texto} onChange={(e) => setC({ ...c, domicilio: { ...c.domicilio, texto: e.target.value } })} className="campo-g" placeholder="Ej: Solo dentro de la ciudad, en 24 a 48 h" />
            </div>
          </div>
        )}
        <CampoPesos id="minima" label="Compra mínima (opcional)" valor={c.compraMinima} onChange={(v) => setC({ ...c, compraMinima: v })} ayuda="0 = sin mínimo." />
      </Seccion>

      <Seccion titulo="Formas de pago">
        <Casilla label="Mercado Pago (tarjetas y dinero en cuenta)" valor={c.pagos.mercadoPago} onChange={(v) => setC({ ...c, pagos: { ...c.pagos, mercadoPago: v } })} />
        {c.pagos.mercadoPago && !mpToken && (
          <p className="rounded-md bg-[#fff8e1] p-3 text-lg">
            Falta conectar la cuenta de Mercado Pago (variable MP_ACCESS_TOKEN en el servidor). Mientras tanto no aparece como opción. Pedíselo a quien administra la página.
          </p>
        )}
        <Casilla label="Transferencia bancaria" valor={c.pagos.transferencia.activo} onChange={(v) => setC({ ...c, pagos: { ...c.pagos, transferencia: { ...c.pagos.transferencia, activo: v } } })} />
        {c.pagos.transferencia.activo && (
          <div className="space-y-4 rounded-md border-2 border-linea p-4">
            {(["alias", "cbu", "titular"] as const).map((k) => (
              <div key={k}>
                <label htmlFor={`transf-${k}`} className="etiqueta-g">{{ alias: "Alias", cbu: "CBU o CVU", titular: "Titular de la cuenta" }[k]}</label>
                <input
                  id={`transf-${k}`}
                  value={c.pagos.transferencia[k]}
                  onChange={(e) => setC({ ...c, pagos: { ...c.pagos, transferencia: { ...c.pagos.transferencia, [k]: e.target.value } } })}
                  inputMode={k === "cbu" ? "numeric" : undefined}
                  className="campo-g"
                  autoComplete="off"
                />
              </div>
            ))}
            <p className="text-base text-stone-600">Se muestran al cliente cuando elige transferencia, con un botón para mandarte el comprobante por WhatsApp.</p>
          </div>
        )}
        <Casilla label="Efectivo al retirar o recibir" valor={c.pagos.efectivo} onChange={(v) => setC({ ...c, pagos: { ...c.pagos, efectivo: v } })} />
      </Seccion>

      <div className="sticky bottom-0 -mx-4 border-t-2 border-linea bg-white p-4 sm:static sm:mx-0 sm:rounded-lg sm:border-2">
        <button disabled={guardando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">{guardando ? "Guardando…" : "Guardar envíos y pagos"}</button>
      </div>
    </form>
  );
}
