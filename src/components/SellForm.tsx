"use client";

import { useState, type FormEvent } from "react";
import { whatsappLink } from "@/lib/utils";

const anioActual = new Date().getFullYear();
const anios = Array.from({ length: 25 }, (_, i) => anioActual - i);

export function SellForm() {
  const [enviado, setEnviado] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? "").trim();
    const mensaje = [
      "Hola! Quiero vender / entregar mi auto:",
      `• Auto: ${v("marca")} ${v("modelo")} ${v("version")}`.trim(),
      `• Año: ${v("anio")}`,
      `• Kilómetros: ${v("km")}`,
      `• Estado: ${v("estado")}`,
      v("partePago") === "si" ? "• Lo quiero entregar como parte de pago" : "• Quiero venderlo",
      `• Nombre: ${v("nombre")}`,
      `• Zona: ${v("zona")}`,
      v("comentarios") ? `• Comentarios: ${v("comentarios")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappLink(mensaje), "_blank", "noopener,noreferrer");
    setEnviado(true);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold text-slate-900">Cotizá tu auto</h2>
      <p className="mt-1 text-sm text-slate-500">Completá los datos y te respondemos por WhatsApp con una oferta.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="marca">Marca *</label>
          <input id="marca" name="marca" required className="campo" placeholder="Ej: Volkswagen" />
        </div>
        <div>
          <label className="etiqueta" htmlFor="modelo">Modelo *</label>
          <input id="modelo" name="modelo" required className="campo" placeholder="Ej: Gol Trend" />
        </div>
        <div>
          <label className="etiqueta" htmlFor="version">Versión</label>
          <input id="version" name="version" className="campo" placeholder="Ej: 1.6 Comfortline" />
        </div>
        <div>
          <label className="etiqueta" htmlFor="anio">Año *</label>
          <select id="anio" name="anio" required className="campo" defaultValue="">
            <option value="" disabled>Elegí el año</option>
            {anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="etiqueta" htmlFor="km">Kilómetros *</label>
          <input id="km" name="km" type="number" min={0} required className="campo" placeholder="Ej: 85000" />
        </div>
        <div>
          <label className="etiqueta" htmlFor="estado">Estado general *</label>
          <select id="estado" name="estado" required className="campo" defaultValue="">
            <option value="" disabled>Elegí una opción</option>
            <option>Excelente</option>
            <option>Muy bueno</option>
            <option>Bueno, con detalles</option>
            <option>Necesita reparaciones</option>
          </select>
        </div>
        <div>
          <label className="etiqueta" htmlFor="nombre">Tu nombre *</label>
          <input id="nombre" name="nombre" required className="campo" autoComplete="name" />
        </div>
        <div>
          <label className="etiqueta" htmlFor="zona">Localidad *</label>
          <input id="zona" name="zona" required className="campo" placeholder="Ej: San Isidro" />
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="etiqueta">¿Qué querés hacer?</legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm has-[:checked]:border-marca-600 has-[:checked]:bg-marca-50">
              <input type="radio" name="partePago" value="no" defaultChecked className="accent-marca-600" />
              Venderlo
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm has-[:checked]:border-marca-600 has-[:checked]:bg-marca-50">
              <input type="radio" name="partePago" value="si" className="accent-marca-600" />
              Entregarlo como parte de pago
            </label>
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <label className="etiqueta" htmlFor="comentarios">Comentarios</label>
          <textarea id="comentarios" name="comentarios" rows={3} className="campo" placeholder="Detalles, choques, service, GNC, etc." />
        </div>
      </div>

      <button type="submit" className="btn-acento mt-6 w-full">
        Enviar y recibir oferta
      </button>
      {enviado && (
        <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800" role="status">
          ¡Listo! Se abrió WhatsApp con tus datos. Enviá el mensaje y, si podés, sumá fotos del auto.
        </p>
      )}
    </form>
  );
}
