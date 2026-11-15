"use client";

import { useEffect, useState, useTransition } from "react";
import { reservarVisita } from "@/app/(sitio)/autos/[slug]/acciones";
import { whatsappLink } from "@/lib/utils";
import { useAgencia } from "./AgenciaContext";
import { Icon } from "./Icon";

type Dia = { fecha: string; horas: string[] };
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_LARGOS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const aFecha = (f: string) => {
  const [a, m, d] = f.split("-").map(Number);
  return new Date(a, m - 1, d);
};

/** Botón + ventana para reservar día y horario para ver y probar el auto. */
export function AgendarVisita({ autoId, titulo, datos }: { autoId: string; titulo: string; datos?: { nombre: string; telefono: string; email: string } }) {
  const ag = useAgencia();
  const [abierta, setAbierta] = useState(false);
  const [dias, setDias] = useState<Dia[] | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [d, setD] = useState({ nombre: "", telefono: "", email: "", comentario: "", ...datos });
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);
  const [enviando, start] = useTransition();
  const wa = whatsappLink(ag.whatsapp, `Hola, quiero coordinar una visita y prueba de manejo del ${titulo}. ¿Qué días y horarios tienen?`);

  const cargar = () =>
    fetch(`/api/turnos?auto=${autoId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((x: { dias: Dia[] }) => {
        setDias(x.dias);
        if (x.dias[0]) setFecha((f) => (x.dias.some((y) => y.fecha === f) ? f : x.dias[0].fecha));
      })
      .catch(() => setDias([]));

  useEffect(() => {
    if (abierta && dias === null) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta]);

  useEffect(() => {
    if (!abierta) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierta]);

  const delDia = dias?.find((x) => x.fecha === fecha);
  const legible = fecha ? `${DIAS_LARGOS[aFecha(fecha).getDay()]} ${aFecha(fecha).getDate()} de ${MESES[aFecha(fecha).getMonth()]}` : "";

  return (
    <>
      <button type="button" onClick={() => { setAbierta(true); setListo(false); setError(""); }} className="btn-borde w-full">
        <Icon name="calendar" className="size-5" /> Agendar visita y prueba de manejo
      </button>

      {abierta && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Agendar visita">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-lg bg-white p-5 sm:rounded-lg sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="sobretitulo">Agendar visita</p>
                <h2 className="mt-1 text-xl font-semibold leading-snug">{titulo}</h2>
              </div>
              <button onClick={() => setAbierta(false)} aria-label="Cerrar" className="-mr-2 -mt-1 p-2"><Icon name="close" className="size-6" /></button>
            </div>

            {listo ? (
              <div className="mt-5" role="status">
                <p className="titulo text-[30px]">¡Te esperamos!</p>
                <p className="mt-2 text-lg">El <b>{legible}</b> a las <b>{hora}</b> en {ag.direccion}, {ag.ciudad}.</p>
                <p className="mt-2 text-stone-600">Te vamos a escribir para confirmarte. Si no podés venir, avisanos así liberamos el horario.</p>
                <a href={whatsappLink(ag.whatsapp, `Hola, reservé una visita para ver el ${titulo} el ${legible} a las ${hora}. Soy ${d.nombre}.`)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-5 w-full">
                  Avisar por WhatsApp
                </a>
              </div>
            ) : dias === null ? (
              <p className="mt-6 text-stone-600">Buscando horarios libres…</p>
            ) : dias.length === 0 ? (
              <div className="mt-5">
                <p className="text-stone-700">No hay horarios disponibles para reservar online en este momento.</p>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-4 w-full">Coordinar por WhatsApp</a>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setError("");
                  if (!hora) return setError("Elegí un horario.");
                  start(async () => {
                    const r = await reservarVisita({ autoId, fecha, hora, ...d });
                    if (r.ok) return setListo(true);
                    setError(r.error);
                    if (r.ocupado) { setHora(""); cargar(); }
                  });
                }}
                className="mt-5 space-y-5"
              >
                <fieldset>
                  <legend className="etiqueta">Día</legend>
                  <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:px-6">
                    {dias.map((x) => {
                      const f = aFecha(x.fecha);
                      return (
                        <button
                          key={x.fecha}
                          type="button"
                          aria-pressed={fecha === x.fecha}
                          onClick={() => { setFecha(x.fecha); setHora(""); }}
                          className={`flex w-16 shrink-0 flex-col items-center rounded-md border py-2 ${fecha === x.fecha ? "border-tinta bg-tinta text-white" : "border-stone-300 hover:border-tinta"}`}
                        >
                          <span className="text-xs font-semibold uppercase">{DIAS[f.getDay()]}</span>
                          <span className="font-display text-2xl font-bold leading-tight">{f.getDate()}</span>
                          <span className="text-xs">{MESES[f.getMonth()]}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="etiqueta">Horario</legend>
                  <div className="grid grid-cols-4 gap-2">
                    {delDia?.horas.map((h) => (
                      <button key={h} type="button" aria-pressed={hora === h} onClick={() => setHora(h)} className={`h-10 rounded-md border text-[15px] font-semibold ${hora === h ? "border-tinta bg-tinta text-white" : "border-stone-300 hover:border-tinta"}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="v-nombre" className="etiqueta">Nombre</label>
                    <input id="v-nombre" required autoComplete="name" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} className="campo" />
                  </div>
                  <div>
                    <label htmlFor="v-tel" className="etiqueta">Teléfono / WhatsApp</label>
                    <input id="v-tel" type="tel" required autoComplete="tel" value={d.telefono} onChange={(e) => setD({ ...d, telefono: e.target.value })} className="campo" />
                  </div>
                  <div>
                    <label htmlFor="v-email" className="etiqueta">Email <span className="font-normal text-stone-400">(opcional)</span></label>
                    <input id="v-email" type="email" autoComplete="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} className="campo" />
                  </div>
                </div>
                {error && <p role="alert" className="rounded-md bg-rojo-claro p-3 text-sm font-semibold text-rojo-oscuro">{error}</p>}
                <button disabled={enviando} className="btn-rojo w-full">{enviando ? "Reservando…" : hora ? `Reservar ${legible} a las ${hora}` : "Reservar"}</button>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="block text-center text-sm font-semibold text-stone-600 hover:text-tinta">Prefiero coordinar por WhatsApp</a>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
