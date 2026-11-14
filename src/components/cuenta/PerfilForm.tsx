"use client";

import { useState, useTransition } from "react";
import { guardarPerfil } from "@/app/(sitio)/cuenta/acciones";

type Datos = { nombre: string; telefono: string; ciudad: string; aceptaMails: boolean };

export function PerfilForm({ inicial }: { inicial: Datos }) {
  const [d, setD] = useState(inicial);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [cargando, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await guardarPerfil(d);
          setMsg(r.ok ? { ok: true, t: "Listo, guardamos tus datos." } : { ok: false, t: r.error });
        });
      }}
      className="mt-5 space-y-4"
    >
      <div>
        <label htmlFor="nombre" className="etiqueta">Nombre y apellido</label>
        <input id="nombre" required value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} className="campo" autoComplete="name" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="telefono" className="etiqueta">Teléfono</label>
          <input id="telefono" type="tel" value={d.telefono} onChange={(e) => setD({ ...d, telefono: e.target.value })} className="campo" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="ciudad" className="etiqueta">Ciudad</label>
          <input id="ciudad" value={d.ciudad} onChange={(e) => setD({ ...d, ciudad: e.target.value })} className="campo" />
        </div>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-md bg-papel p-4 text-[15px]">
        <input type="checkbox" checked={d.aceptaMails} onChange={(e) => setD({ ...d, aceptaMails: e.target.checked })} className="mt-0.5 size-5 shrink-0 accent-rojo" />
        <span>Quiero recibir por mail los autos nuevos y novedades.</span>
      </label>
      <button disabled={cargando} className="btn-tinta">{cargando ? "Guardando…" : "Guardar"}</button>
      {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-[#17733c]" : "text-rojo-oscuro"}`}>{msg.t}</p>}
    </form>
  );
}
