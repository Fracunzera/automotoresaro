"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { actualizarConsultaAccion, borrarConsultaAccion } from "@/app/admin/acciones-consultas";
import type { Consulta, EstadoConsulta } from "@/lib/consultas";
import { normalizarWhatsapp, telLink } from "@/lib/agencia-tipos";
import { formatNumero, whatsappLink } from "@/lib/utils";
import { CampoPesos, Opciones } from "./Campos";
import { Confirmar } from "./Confirmar";

const ESTADOS: EstadoConsulta[] = ["nueva", "contactado", "cotizado", "descartada"];
const TEXTO: Record<EstadoConsulta, string> = {
  nueva: "Nueva",
  contactado: "Contactado",
  cotizado: "Acordando condiciones",
  comprado: "Publicado",
  descartada: "Descartada",
};
const COLOR: Record<EstadoConsulta, string> = {
  nueva: "bg-rojo text-white",
  contactado: "bg-[#fff1cc] text-[#7a5300]",
  cotizado: "bg-[#fff1cc] text-[#7a5300]",
  comprado: "bg-[#e7f4ec] text-[#17733c]",
  descartada: "bg-stone-200 text-stone-700",
};

/** "hace 3 horas", "ayer", "12/11" */
function cuando(iso: string) {
  const min = Math.floor((Date.now() - +new Date(iso)) / 60_000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ayer";
  if (d < 7) return `hace ${d} días`;
  const f = new Date(iso);
  return `${f.getDate()}/${f.getMonth() + 1}`;
}

function Tarjeta({ c, agencia, esAdmin }: { c: Consulta; agencia: string; esAdmin: boolean }) {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoConsulta>(c.estado);
  const [oferta, setOferta] = useState(c.oferta);
  const [notas, setNotas] = useState(c.notas);
  const [abierta, setAbierta] = useState(c.estado === "nueva");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [borrar, setBorrar] = useState(false);
  const [cargando, start] = useTransition();
  const titulo = `${c.marca} ${c.modelo} ${c.anio || ""}`.trim();
  const cambios = estado !== c.estado || oferta !== c.oferta || notas !== c.notas;
  const wa = normalizarWhatsapp(c.telefono);
  const saludo = `Hola ${c.nombre.split(" ")[0]}, te escribo de ${agencia} por tu ${titulo} que cargaste para vender con nosotros.`;

  function guardar() {
    setMsg(null);
    start(async () => {
      const r = await actualizarConsultaAccion(c.id, { estado, oferta, notas });
      setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
      if (r.ok) router.refresh();
    });
  }

  return (
    <li className="tarjeta-g overflow-hidden">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-sm px-2.5 py-1 text-base font-bold ${COLOR[c.estado]}`}>{TEXTO[c.estado]}</span>
          <span className="text-base text-stone-500">{cuando(c.fecha)}</span>
        </div>
        <h2 className="mt-2 text-xl font-bold">{titulo}{c.version && <span className="font-normal text-stone-600"> · {c.version}</span>}</h2>
        <p className="text-lg text-stone-700">
          {c.km ? `${formatNumero(c.km)} km · ` : ""}{c.combustible} · {c.transmision}
        </p>
        <p className="text-lg text-stone-700">Estado: <b>{c.condicion || "-"}</b> · Choques: <b>{c.choques || "-"}</b></p>
        <p className="mt-1 text-lg">
          {c.precioPretendido ? <>Pretende <b className="font-display text-2xl">$ {formatNumero(c.precioPretendido)}</b></> : <b>Pide que lo asesoremos con el precio</b>}
        </p>
        {(c.fotos?.length ?? 0) > 0 ? (
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {c.fotos.slice(0, 8).map((f, i) => (
              <a key={f} href={f} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md bg-papel">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-base text-stone-500">No subió fotos.</p>
        )}
        {c.comentarios && <p className="mt-2 rounded-md bg-papel p-3 text-lg">“{c.comentarios}”</p>}
        <div className="mt-3 border-t-2 border-linea pt-3 text-lg">
          <p><b>{c.nombre}</b>{c.zona && <span className="text-stone-600"> · {c.zona}</span>}</p>
          <p className="text-stone-700">{c.telefono}{c.email && <> · <span className="break-all">{c.email}</span></>}</p>
          {c.atendidoPor && c.estado !== "nueva" && <p className="text-base text-stone-500">Lo atendió {c.atendidoPor}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t-2 border-linea p-3">
        <a href={whatsappLink(wa, saludo)} target="_blank" rel="noopener noreferrer" className="btn-g bg-[#1faa53] text-white hover:bg-[#188f45]">WhatsApp</a>
        <a href={telLink(c.telefono)} className="btn-g border-2 border-tinta bg-white hover:bg-papel">Llamar</a>
      </div>

      <div className="border-t-2 border-linea bg-papel p-4">
        {!abierta ? (
          <button onClick={() => setAbierta(true)} className="btn-g w-full border-2 border-stone-300 bg-white hover:border-tinta">Anotar en qué quedó</button>
        ) : (
          <div className="space-y-5">
            <Opciones label="¿En qué quedó?" opciones={ESTADOS} textos={TEXTO} valor={estado} onChange={setEstado} />
            <CampoPesos id={`oferta-${c.id}`} label="Precio acordado para publicar (opcional)" valor={oferta} onChange={setOferta} />
            <div>
              <label htmlFor={`notas-${c.id}`} className="etiqueta-g">Notas</label>
              <textarea id={`notas-${c.id}`} rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} className="campo-g h-auto! py-3" placeholder="Ej: lo trae el sábado para verlo" />
            </div>
            {msg && <p role="status" className={`text-lg font-semibold ${msg.ok ? "text-[#17733c]" : "text-rojo-oscuro"}`}>{msg.ok ? "✓ " : ""}{msg.t}</p>}
            <button onClick={guardar} disabled={cargando || !cambios} className="btn-g w-full bg-tinta text-white hover:bg-tinta-2">
              {cargando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        )}
        {c.autoId ? (
          <Link href={`/admin/autos/${c.autoId}`} className="btn-g mt-3 w-full border-2 border-tinta bg-white hover:bg-papel">Ver el auto publicado</Link>
        ) : c.estado !== "descartada" ? (
          <Link href={`/admin/autos/nuevo?consulta=${c.id}`} className="btn-g mt-3 w-full bg-rojo text-white hover:bg-rojo-oscuro">
            Revisar y publicar
          </Link>
        ) : null}
        {esAdmin && (
          <button onClick={() => setBorrar(true)} className="mt-3 w-full py-2 text-base font-semibold text-stone-500 hover:text-rojo-oscuro">
            Borrar consulta
          </button>
        )}
      </div>

      {borrar && (
        <Confirmar
          titulo="¿Borrar esta consulta?"
          texto={`Se borra la consulta de ${c.nombre} por el ${titulo}. No se puede deshacer.`}
          confirmar="Sí, borrarla"
          peligro
          cargando={cargando}
          onCancelar={() => setBorrar(false)}
          onConfirmar={() => start(async () => { const r = await borrarConsultaAccion(c.id); setBorrar(false); if (r.ok) router.refresh(); else setMsg({ ok: false, t: r.error }); })}
        />
      )}
    </li>
  );
}

export function ListaConsultas({ consultas, agencia, esAdmin }: { consultas: Consulta[]; agencia: string; esAdmin: boolean }) {
  return (
    <ul className="mt-5 space-y-4">
      {consultas.map((c) => <Tarjeta key={`${c.id}-${c.actualizado}`} c={c} agencia={agencia} esAdmin={esAdmin} />)}
    </ul>
  );
}
