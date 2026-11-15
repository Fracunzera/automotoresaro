"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { enviarConsultaVenta } from "@/app/(sitio)/vender/acciones";
import { whatsappLink } from "@/lib/utils";
import { useAgencia } from "./AgenciaContext";
import { Icon } from "./Icon";
import { SubirFotos } from "./admin/SubirFotos";

const anioActual = new Date().getFullYear();
const anios = Array.from({ length: 30 }, (_, i) => anioActual - i);

type Datos = {
  marca: string; modelo: string; version: string; anio: string; km: string;
  combustible: string; transmision: string; estado: string; choques: string;
  precioPretendido: string; fotos: string[];
  nombre: string; telefono: string; email: string; zona: string; comentarios: string;
};

const pasos = ["Tu auto", "Estado", "Fotos y precio", "Tus datos"];
const puntos = (t: string) => {
  const n = Number(t.replace(/\D/g, "").slice(0, 12));
  return n ? n.toLocaleString("es-AR") : "";
};

/** "Vendé tu auto": el dueño carga su auto para que la agencia lo venda en consignación. */
export function SellForm({ inicial, conCuenta }: { inicial: Partial<Datos>; conCuenta: boolean }) {
  const [paso, setPaso] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [trampa, setTrampa] = useState("");
  const [enviando, start] = useTransition();
  const { whatsapp } = useAgencia();
  const [d, setD] = useState<Datos>({
    marca: "", modelo: "", version: "", anio: "", km: "", combustible: "Nafta", transmision: "Manual",
    estado: "", choques: "No", precioPretendido: "", fotos: [],
    nombre: "", telefono: "", email: "", zona: "", comentarios: "",
    ...inicial,
  });
  const set = (k: keyof Datos) => (e: { target: { value: string } }) => setD((p) => ({ ...p, [k]: e.target.value }));

  const mensaje = () =>
    [
      "Hola, quiero que me vendan mi auto:",
      `• ${d.marca} ${d.modelo} ${d.version}`.trim(),
      `• Año ${d.anio} · ${Number(d.km.replace(/\D/g, "") || 0).toLocaleString("es-AR")} km`,
      `• ${d.combustible} · ${d.transmision} · Estado: ${d.estado} · Choques: ${d.choques}`,
      d.precioPretendido && `• Pretendo $ ${d.precioPretendido}`,
      `Soy ${d.nombre}, de ${d.zona}.`,
    ].filter(Boolean).join("\n");

  function siguiente(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (paso < pasos.length - 1) return setPaso(paso + 1);
    start(async () => {
      const r = await enviarConsultaVenta({ ...d, sitio: trampa }).catch(() => ({ ok: false as const, error: "" }));
      if (r.ok) setEnviado(true);
      else setError(r.error || "No pudimos enviar los datos. Probá de nuevo o escribinos por WhatsApp.");
    });
  }

  if (enviado) {
    return (
      <div className="rounded-lg border border-linea bg-white p-6 sm:p-8" role="status">
        <p className="sobretitulo">Recibido</p>
        <h2 className="titulo mt-2 text-[36px]">¡Listo, {d.nombre.split(" ")[0]}!</h2>
        <p className="mt-3 text-lg text-stone-700">
          Recibimos tu {d.marca} {d.modelo} {d.anio}. Lo revisamos y te llamamos al {d.telefono} para acordar el precio y publicarlo.
        </p>
        {conCuenta ? (
          <p className="mt-4 text-stone-600">Podés ver en qué estado está desde <Link href="/cuenta" className="font-semibold text-tinta underline">Mi cuenta</Link>.</p>
        ) : (
          <p className="mt-4 text-stone-600">
            Si querés seguir el estado de tu publicación, <Link href="/ingresar?volver=/cuenta" className="font-semibold text-tinta underline">ingresá con tu email</Link>
            {d.email ? ` (${d.email})` : ""}.
          </p>
        )}
        <a href={whatsappLink(whatsapp, mensaje())} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6 w-full">
          Escribinos por WhatsApp
        </a>
      </div>
    );
  }

  const opciones = (k: keyof Datos, valores: string[]) => (
    <div className="flex flex-wrap gap-2">
      {valores.map((v) => (
        <label
          key={v}
          className={`flex h-10 cursor-pointer items-center rounded-md border px-3.5 text-[15px] font-medium ${
            d[k] === v ? "border-tinta bg-tinta text-white" : "border-stone-300 hover:border-tinta"
          }`}
        >
          <input type="radio" name={k} value={v} checked={d[k] === v} onChange={set(k)} className="sr-only" required />
          {v}
        </label>
      ))}
    </div>
  );

  return (
    <form onSubmit={siguiente} className="relative rounded-lg border border-linea bg-white">
      <div className="p-5 sm:p-7">
        <ol className="flex gap-2">
          {pasos.map((p, i) => (
            <li key={p} className="flex-1">
              <div className={`h-1 rounded-full ${i <= paso ? "bg-rojo" : "bg-linea"}`} />
              <p className={`mt-2 text-[13px] font-semibold leading-tight ${i === paso ? "text-tinta" : "text-stone-400"}`}>{i + 1}. {p}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 min-h-[300px]">
          {paso === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="etiqueta" htmlFor="marca">Marca</label>
                <input id="marca" value={d.marca} onChange={set("marca")} required className="campo" placeholder="Ej: Volkswagen" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="modelo">Modelo</label>
                <input id="modelo" value={d.modelo} onChange={set("modelo")} required className="campo" placeholder="Ej: Gol Trend" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="anio">Año</label>
                <select id="anio" value={d.anio} onChange={set("anio")} required className="campo">
                  <option value="" disabled>Elegí el año</option>
                  {anios.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="etiqueta" htmlFor="km">Kilómetros</label>
                <input id="km" inputMode="numeric" value={puntos(d.km)} onChange={(e) => setD({ ...d, km: e.target.value })} required className="campo" placeholder="Ej: 85.000" />
              </div>
              <div className="sm:col-span-2">
                <label className="etiqueta" htmlFor="version">Versión <span className="font-normal text-stone-400">(opcional)</span></label>
                <input id="version" value={d.version} onChange={set("version")} className="campo" placeholder="Ej: 1.6 Comfortline" />
              </div>
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-5">
              <div><span className="etiqueta">Combustible</span>{opciones("combustible", ["Nafta", "Diésel", "GNC", "Híbrido"])}</div>
              <div><span className="etiqueta">Transmisión</span>{opciones("transmision", ["Manual", "Automática"])}</div>
              <div><span className="etiqueta">Estado general</span>{opciones("estado", ["Excelente", "Muy bueno", "Bueno", "Con detalles"])}</div>
              <div><span className="etiqueta">¿Tuvo choques?</span>{opciones("choques", ["No", "Leves", "Sí"])}</div>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-6">
              <div>
                <span className="etiqueta">Fotos del auto <span className="font-normal text-stone-400">(recomendado)</span></span>
                <p className="mb-3 text-sm text-stone-600">De día y con el auto limpio: frente, costados, atrás, interior y tablero con los km. Si no tenés ahora, las sacamos nosotros.</p>
                <SubirFotos fotos={d.fotos} onChange={(f) => setD((p) => ({ ...p, fotos: f }))} endpoint="/api/fotos-publicas" maximo={15} />
              </div>
              <div>
                <label className="etiqueta" htmlFor="precio">¿Cuánto pretendés? <span className="font-normal text-stone-400">(opcional)</span></label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
                  <input id="precio" inputMode="numeric" value={puntos(d.precioPretendido)} onChange={(e) => setD({ ...d, precioPretendido: e.target.value })} className="campo pl-7!" />
                </div>
                <p className="mt-1 text-sm text-stone-600">Si no sabés, dejalo vacío: te asesoramos según el mercado.</p>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="etiqueta" htmlFor="nombre">Nombre</label>
                <input id="nombre" value={d.nombre} onChange={set("nombre")} required autoComplete="name" className="campo" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="telefono">Teléfono / WhatsApp</label>
                <input id="telefono" type="tel" value={d.telefono} onChange={set("telefono")} required autoComplete="tel" className="campo" placeholder="Ej: 2966 15 123456" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="email">Email <span className="font-normal text-stone-400">(para seguir el estado)</span></label>
                <input id="email" type="email" value={d.email} onChange={set("email")} autoComplete="email" className="campo" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="zona">Localidad</label>
                <input id="zona" value={d.zona} onChange={set("zona")} required className="campo" />
              </div>
              <div className="sm:col-span-2">
                <label className="etiqueta" htmlFor="comentarios">Algo más que debamos saber <span className="font-normal text-stone-400">(opcional)</span></label>
                <textarea id="comentarios" value={d.comentarios} onChange={set("comentarios")} rows={3} className="campo h-auto! py-2.5" placeholder="Service al día, cubiertas nuevas, equipo de GNC…" />
              </div>
              <input type="text" name="sitio" value={trampa} onChange={(e) => setTrampa(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <div className="rounded-md bg-papel p-4 text-sm text-stone-700 sm:col-span-2">
                <p className="font-semibold text-tinta">Resumen</p>
                <p className="mt-1">
                  {d.marca} {d.modelo} {d.version} · {d.anio} · {puntos(d.km) || 0} km · {d.estado} · {d.fotos.length} foto{d.fotos.length === 1 ? "" : "s"}
                  {d.precioPretendido && <> · pretendés $ {puntos(d.precioPretendido)}</>}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className="btn-borde">Atrás</button>}
          <button type="submit" disabled={enviando} className="btn-rojo flex-1">
            {paso < pasos.length - 1 ? <>Continuar <Icon name="arrow" className="size-4" /></> : enviando ? "Enviando…" : "Enviar mi auto"}
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-md bg-rojo-claro p-3 text-sm text-rojo-oscuro">
            <p className="font-semibold">{error}</p>
            <a href={whatsappLink(whatsapp, mensaje())} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline">Enviar por WhatsApp</a>
          </div>
        )}
      </div>
    </form>
  );
}
