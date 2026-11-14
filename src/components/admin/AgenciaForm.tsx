"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { guardarAgenciaAccion } from "@/app/admin/acciones-equipo";
import { linkMapa, normalizarWhatsapp, type Agencia } from "@/lib/agencia-tipos";

/** Muestra un número de WhatsApp de forma legible: +54 9 2966 12-3456 */
function legible(n: string) {
  if (!n.startsWith("549") || n.length !== 13) return n ? `+${n}` : "";
  const resto = n.slice(3);
  return `+54 9 ${resto.slice(0, 4)} ${resto.slice(4, 6)}-${resto.slice(6)}`;
}

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: ReactNode }) {
  return (
    <section className="tarjeta-g space-y-6 p-5 sm:p-7">
      <div>
        <h2 className="text-2xl font-bold">{titulo}</h2>
        {ayuda && <p className="mt-1 text-lg text-stone-600">{ayuda}</p>}
      </div>
      {children}
    </section>
  );
}

export function AgenciaForm({ inicial }: { inicial: Agencia }) {
  const router = useRouter();
  const [a, setA] = useState<Agencia>(inicial);
  const [waTexto, setWaTexto] = useState(inicial.whatsapp ? legible(inicial.whatsapp) : "");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [guardando, start] = useTransition();
  const wa = normalizarWhatsapp(waTexto);

  const campo = (k: Exclude<keyof Agencia, "legal">, label: string, extra: { ayuda?: string; placeholder?: string; type?: string } = {}) => (
    <div>
      <label htmlFor={k} className="etiqueta-g">{label}</label>
      <input
        id={k}
        type={extra.type ?? "text"}
        value={a[k]}
        onChange={(e) => setA({ ...a, [k]: e.target.value })}
        placeholder={extra.placeholder}
        className="campo-g"
        autoComplete="off"
      />
      {extra.ayuda && <p className="ayuda-g">{extra.ayuda}</p>}
    </div>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(async () => {
          const r = await guardarAgenciaAccion({ ...a, whatsapp: waTexto });
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

      <Seccion titulo="Contacto">
        {campo("nombre", "Nombre de la agencia")}
        <div>
          <label htmlFor="whatsapp" className="etiqueta-g">WhatsApp</label>
          <input id="whatsapp" type="tel" value={waTexto} onChange={(e) => setWaTexto(e.target.value)} placeholder="Ej: 2966 15 123456" className="campo-g" autoComplete="off" />
          <p className="ayuda-g">Escribilo como quieras, con el código de área. A este número llegan todas las consultas.</p>
          {wa.length >= 12 && (
            <p className="mt-2 text-lg">
              Se va a usar: <b>{legible(wa)}</b> ·{" "}
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-rojo underline underline-offset-4">Probar</a>
            </p>
          )}
        </div>
        {campo("telefono", "Teléfono (el que se muestra en la página)", { placeholder: "Ej: (2966) 12-3456", type: "tel" })}
        {campo("email", "Email", { type: "email" })}
      </Seccion>

      <Seccion titulo="Dirección y horarios">
        {campo("direccion", "Dirección", { placeholder: "Ej: Av. Kirchner 1234" })}
        <div className="grid gap-6 sm:grid-cols-2">
          {campo("ciudad", "Ciudad")}
          {campo("provincia", "Provincia")}
        </div>
        {campo("horarios", "Horarios", { placeholder: "Ej: Lunes a viernes 9 a 19 h · Sábados 9 a 13 h" })}
        <div>
          {campo("mapa", "Link de Google Maps (opcional)", {
            ayuda: "En Google Maps buscá la agencia, tocá Compartir y copiá el link. Si lo dejás vacío, se arma solo con la dirección.",
          })}
          <a href={linkMapa(a)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-lg font-semibold text-rojo underline underline-offset-4">
            Ver cómo queda en el mapa
          </a>
        </div>
        <div>
          <label htmlFor="traslado" className="etiqueta-g">Aviso para compradores de otras ciudades</label>
          <textarea id="traslado" rows={3} value={a.traslado} onChange={(e) => setA({ ...a, traslado: e.target.value })} className="campo-g h-auto! py-3" />
          <p className="ayuda-g">Aparece en cada auto, debajo del precio.</p>
        </div>
      </Seccion>

      <Seccion titulo="Redes sociales" ayuda="Dejá vacío lo que no uses.">
        {campo("instagram", "Instagram", { placeholder: "Ej: instagram.com/automotoresaro" })}
        {campo("facebook", "Facebook", { placeholder: "Ej: facebook.com/automotoresaro" })}
      </Seccion>

      <Seccion titulo="Datos para el contrato" ayuda="Aparecen en el contrato de consignación.">
        <div>
          <label htmlFor="titular" className="etiqueta-g">Titular (nombre y apellido o razón social)</label>
          <input id="titular" value={a.legal.titular} onChange={(e) => setA({ ...a, legal: { ...a.legal, titular: e.target.value } })} className="campo-g" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="cuit" className="etiqueta-g">CUIT</label>
          <input id="cuit" inputMode="numeric" value={a.legal.cuit} onChange={(e) => setA({ ...a, legal: { ...a.legal, cuit: e.target.value } })} placeholder="Ej: 20-12345678-9" className="campo-g" autoComplete="off" />
        </div>
      </Seccion>

      <div className="sticky bottom-0 -mx-4 border-t-2 border-linea bg-white p-4 sm:static sm:mx-0 sm:rounded-lg sm:border-2">
        <button disabled={guardando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">{guardando ? "Guardando…" : "Guardar datos"}</button>
      </div>
    </form>
  );
}
