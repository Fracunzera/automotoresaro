"use client";

import { useState, type FormEvent } from "react";
import { whatsappLink } from "@/lib/utils";
import { Icon } from "./Icon";

const anioActual = new Date().getFullYear();
const anios = Array.from({ length: 25 }, (_, i) => anioActual - i);

type Datos = {
  marca: string; modelo: string; version: string; anio: string; km: string;
  combustible: string; transmision: string; estado: string; choques: string;
  nombre: string; zona: string; comentarios: string; modo: "venta" | "cambio";
};

const pasos = ["Tu auto", "Estado", "Tus datos"];

export function SellForm({ inicial }: { inicial: Partial<Datos> }) {
  const [paso, setPaso] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [d, setD] = useState<Datos>({
    marca: "", modelo: "", version: "", anio: "", km: "", combustible: "Nafta", transmision: "Manual",
    estado: "", choques: "No", nombre: "", zona: "", comentarios: "", modo: "venta",
    ...inicial,
  });
  const set = (k: keyof Datos) => (e: { target: { value: string } }) => setD((p) => ({ ...p, [k]: e.target.value }));

  function siguiente(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (paso < pasos.length - 1) return setPaso(paso + 1);
    const mensaje = [
      d.modo === "cambio" ? "Hola, quiero entregar mi auto como parte de pago:" : "Hola, quiero vender mi auto:",
      `• ${d.marca} ${d.modelo} ${d.version}`.trim(),
      `• Año ${d.anio} · ${Number(d.km).toLocaleString("es-AR")} km`,
      `• ${d.combustible} · ${d.transmision}`,
      `• Estado: ${d.estado} · Choques: ${d.choques}`,
      d.comentarios && `• ${d.comentarios}`,
      `Soy ${d.nombre}, de ${d.zona}.`,
    ].filter(Boolean).join("\n");
    window.open(whatsappLink(mensaje), "_blank", "noopener,noreferrer");
    setEnviado(true);
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
    <form onSubmit={siguiente} className="rounded-lg border border-linea bg-white">
      {/* ¿Vender o cambiar? */}
      <div className="grid grid-cols-2 border-b border-linea">
        {([["venta", "Quiero venderlo"], ["cambio", "Lo entrego en parte de pago"]] as const).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setD((p) => ({ ...p, modo: v }))}
            className={`h-12 border-b-[3px] px-2 text-[15px] font-semibold ${d.modo === v ? "border-rojo text-tinta" : "border-transparent text-stone-500"}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-7">
        {/* Progreso */}
        <ol className="flex gap-2">
          {pasos.map((p, i) => (
            <li key={p} className="flex-1">
              <div className={`h-1 rounded-full ${i <= paso ? "bg-rojo" : "bg-linea"}`} />
              <p className={`mt-2 text-[13px] font-semibold ${i === paso ? "text-tinta" : "text-stone-400"}`}>
                {i + 1}. {p}
              </p>
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
                <input id="km" type="number" inputMode="numeric" min={0} value={d.km} onChange={set("km")} required className="campo" placeholder="Ej: 85000" />
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="etiqueta" htmlFor="nombre">Nombre</label>
                <input id="nombre" value={d.nombre} onChange={set("nombre")} required autoComplete="name" className="campo" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="zona">Localidad</label>
                <input id="zona" value={d.zona} onChange={set("zona")} required className="campo" placeholder="Ej: San Isidro" />
              </div>
              <div className="sm:col-span-2">
                <label className="etiqueta" htmlFor="comentarios">Algo más que debamos saber <span className="font-normal text-stone-400">(opcional)</span></label>
                <textarea id="comentarios" value={d.comentarios} onChange={set("comentarios")} rows={3} className="campo h-auto! py-2.5" placeholder="Service al día, cubiertas nuevas, equipo de GNC…" />
              </div>
              <div className="rounded-md bg-papel p-4 text-sm text-stone-700 sm:col-span-2">
                <p className="font-semibold text-tinta">Resumen</p>
                <p className="mt-1">{d.marca} {d.modelo} {d.version} · {d.anio} · {Number(d.km || 0).toLocaleString("es-AR")} km · {d.estado}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {paso > 0 && (
            <button type="button" onClick={() => setPaso(paso - 1)} className="btn-borde">Atrás</button>
          )}
          <button type="submit" className="btn-rojo flex-1">
            {paso < pasos.length - 1 ? <>Continuar <Icon name="arrow" className="size-4" /></> : "Enviar por WhatsApp"}
          </button>
        </div>

        {enviado && (
          <p className="mt-4 rounded-md bg-[#e7f4ec] p-3 text-sm text-[#17733c]" role="status">
            Se abrió WhatsApp con tus datos. Enviá el mensaje y, si podés, sumá 4 o 5 fotos del auto.
          </p>
        )}
      </div>
    </form>
  );
}
