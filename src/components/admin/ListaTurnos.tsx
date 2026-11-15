"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { actualizarTurnoAccion } from "@/app/admin/acciones-agenda";
import { normalizarWhatsapp, telLink } from "@/lib/agencia-tipos";
import type { EstadoTurno, Turno } from "@/lib/turnos";
import { whatsappLink } from "@/lib/utils";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const ESTADO: Record<EstadoTurno, { t: string; c: string }> = {
  pendiente: { t: "Sin confirmar", c: "bg-[#fff1cc] text-[#7a5300]" },
  confirmado: { t: "Confirmada", c: "bg-[#e7f4ec] text-[#17733c]" },
  realizado: { t: "Vino", c: "bg-stone-200 text-stone-700" },
  noVino: { t: "No vino", c: "bg-rojo-claro text-rojo-oscuro" },
  cancelado: { t: "Cancelada", c: "bg-stone-200 text-stone-700" },
};

function tituloDia(fecha: string, hoy: string) {
  const [a, m, d] = fecha.split("-").map(Number);
  const f = new Date(a, m - 1, d);
  const [ha, hm, hd] = hoy.split("-").map(Number);
  const dif = Math.round((+f - +new Date(ha, hm - 1, hd)) / 86_400_000);
  const base = `${DIAS[f.getDay()]} ${d} de ${MESES[m - 1]}`;
  return dif === 0 ? `Hoy · ${base}` : dif === 1 ? `Mañana · ${base}` : base;
}

function Tarjeta({ t, vendedores, slug, agencia }: { t: Turno; vendedores: string[]; slug: string; agencia: { nombre: string; direccion: string } }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [cargando, start] = useTransition();
  const [a, m, d] = t.fecha.split("-").map(Number);
  const cuando = `el ${DIAS[new Date(a, m - 1, d).getDay()].toLowerCase()} ${d} a las ${t.hora}`;
  const confirmar = `Hola ${t.nombre.split(" ")[0]}, te escribo de ${agencia.nombre} para confirmar tu visita ${cuando} para ver el ${t.autoTitulo}. Te esperamos en ${agencia.direccion}.`;

  const correr = (c: { estado?: EstadoTurno; vendedor?: string }) =>
    start(async () => {
      const r = await actualizarTurnoAccion(t.id, c);
      setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
      if (r.ok) router.refresh();
    });

  return (
    <li className="tarjeta-g overflow-hidden">
      <div className="flex gap-4 p-4">
        <p className="font-display text-[34px] font-bold leading-none">{t.hora}</p>
        <div className="min-w-0 flex-1">
          <span className={`inline-block rounded-sm px-2.5 py-1 text-base font-bold ${ESTADO[t.estado].c}`}>{ESTADO[t.estado].t}</span>
          <p className="mt-1.5 text-xl font-bold leading-snug">{t.autoTitulo}</p>
          <p className="text-lg"><b>{t.nombre}</b> · {t.telefono}</p>
          {t.email && <p className="break-all text-base text-stone-600">{t.email}</p>}
          {t.comentario && <p className="mt-1 rounded-md bg-papel p-2 text-lg">“{t.comentario}”</p>}
          {slug && <a href={`/autos/${slug}`} target="_blank" className="text-base font-semibold text-rojo underline underline-offset-4">Ver el auto</a>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t-2 border-linea p-3">
        <a href={whatsappLink(normalizarWhatsapp(t.telefono), confirmar)} target="_blank" rel="noopener noreferrer" className="btn-g bg-[#1faa53] text-white hover:bg-[#188f45]">WhatsApp</a>
        <a href={telLink(t.telefono)} className="btn-g border-2 border-tinta bg-white hover:bg-papel">Llamar</a>
      </div>
      <div className="space-y-3 border-t-2 border-linea bg-papel p-3">
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Lo atiende</span>
          <select value={t.vendedor} disabled={cargando} onChange={(e) => correr({ vendedor: e.target.value })} className="campo-g">
            <option value="">Sin asignar</option>
            {vendedores.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {t.estado === "pendiente" && <button disabled={cargando} onClick={() => correr({ estado: "confirmado" })} className="btn-g col-span-2 bg-tinta text-white hover:bg-tinta-2">Ya le confirmé</button>}
          {(t.estado === "pendiente" || t.estado === "confirmado") && (
            <>
              <button disabled={cargando} onClick={() => correr({ estado: "realizado" })} className="btn-g border-2 border-stone-300 bg-white hover:border-tinta">Vino</button>
              <button disabled={cargando} onClick={() => correr({ estado: "noVino" })} className="btn-g border-2 border-stone-300 bg-white hover:border-tinta">No vino</button>
              <button disabled={cargando} onClick={() => correr({ estado: "cancelado" })} className="btn-g col-span-2 border-2 border-stone-300 bg-white text-rojo-oscuro hover:border-rojo">Cancelar visita</button>
            </>
          )}
          {(t.estado === "cancelado" || t.estado === "noVino" || t.estado === "realizado") && (
            <button disabled={cargando} onClick={() => correr({ estado: "pendiente" })} className="btn-g col-span-2 border-2 border-stone-300 bg-white hover:border-tinta">Volver a dejarla pendiente</button>
          )}
        </div>
        {msg && <p role="status" className={`text-lg font-semibold ${msg.ok ? "text-[#17733c]" : "text-rojo-oscuro"}`}>{msg.ok ? "✓ " : ""}{msg.t}</p>}
      </div>
    </li>
  );
}

export function ListaTurnos({ turnos, hoy, vendedores, slugs, agencia }: { turnos: Turno[]; hoy: string; vendedores: string[]; slugs: Record<string, string>; agencia: { nombre: string; direccion: string } }) {
  const dias = Array.from(new Set(turnos.map((t) => t.fecha)));
  return (
    <div className="mt-5 space-y-6">
      {dias.map((f) => (
        <section key={f}>
          <h2 className="text-xl font-bold">{tituloDia(f, hoy)}</h2>
          <ul className="mt-2 space-y-3">
            {turnos.filter((t) => t.fecha === f).map((t) => <Tarjeta key={`${t.id}-${t.actualizado}`} t={t} vendedores={vendedores} slug={slugs[t.autoId] ?? ""} agencia={agencia} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}
