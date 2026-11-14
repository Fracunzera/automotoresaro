"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { hayStock, type Producto } from "@/lib/productos-tipos";
import { whatsappLink } from "@/lib/utils";
import { useAgencia } from "../AgenciaContext";
import { BotonFavorito } from "../cuenta/ClienteContext";
import { WhatsAppIcon } from "../Icon";
import { useCarrito } from "./CarritoContext";

export function AgregarAlCarrito({ p }: { p: Producto }) {
  const router = useRouter();
  const { agregar } = useCarrito();
  const { whatsapp, nombre } = useAgencia();
  const [variante, setVariante] = useState(p.variantes.length === 1 ? p.variantes[0] : "");
  const [cantidad, setCantidad] = useState(1);
  const [aviso, setAviso] = useState("");
  const [agregado, setAgregado] = useState(false);
  const max = p.stock === null ? 99 : Math.min(99, p.stock);
  const disponible = hayStock(p);

  function sumar(irAlCarrito: boolean) {
    if (p.variantes.length > 0 && !variante) return setAviso(`Elegí ${p.nombreVariante ? `el ${p.nombreVariante.toLowerCase()}` : "una opción"}.`);
    setAviso("");
    agregar({ productoId: p.id, variante, cantidad });
    if (irAlCarrito) router.push("/carrito");
    else setAgregado(true);
  }

  if (!disponible) {
    return (
      <div className="space-y-3">
        <p className="rounded-md bg-papel p-4 font-semibold">Sin stock por ahora.</p>
        <a href={whatsappLink(whatsapp, `Hola ${nombre}, ¿van a volver a tener "${p.nombre}"?`)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
          <WhatsAppIcon className="size-5" /> Avisame cuando vuelva
        </a>
        <BotonFavorito autoId={p.id} conTexto className="btn-borde w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {p.variantes.length > 0 && (
        <fieldset>
          <legend className="etiqueta">{p.nombreVariante || "Opción"}</legend>
          <div className="flex flex-wrap gap-2">
            {p.variantes.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={variante === v}
                onClick={() => { setVariante(v); setAviso(""); }}
                className={`h-11 min-w-12 rounded-md border px-3.5 text-[15px] font-semibold ${variante === v ? "border-tinta bg-tinta text-white" : "border-stone-300 bg-white hover:border-tinta"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div>
        <span className="etiqueta">Cantidad</span>
        <div className="flex items-center gap-3">
          <div className="flex h-11 items-center rounded-md border border-stone-300">
            <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Menos" className="h-full w-11 text-xl font-semibold">−</button>
            <span className="w-10 text-center font-semibold" aria-live="polite">{cantidad}</span>
            <button type="button" onClick={() => setCantidad((c) => Math.min(max, c + 1))} aria-label="Más" className="h-full w-11 text-xl font-semibold">+</button>
          </div>
          {p.stock !== null && p.stock <= 5 && <span className="text-sm font-semibold text-rojo">¡Quedan {p.stock}!</span>}
        </div>
      </div>
      {aviso && <p role="alert" className="font-semibold text-rojo-oscuro">{aviso}</p>}
      <div className="space-y-2">
        <button onClick={() => sumar(true)} className="btn-rojo w-full">Comprar</button>
        <button onClick={() => sumar(false)} className="btn-borde w-full">Agregar al carrito</button>
        <BotonFavorito autoId={p.id} conTexto className="btn-borde w-full" />
      </div>
      {agregado && (
        <p role="status" className="rounded-md bg-[#e7f4ec] p-3 text-sm font-semibold text-[#17733c]">
          ✓ Agregado. <Link href="/carrito" className="underline">Ver carrito</Link> o seguí comprando.
        </p>
      )}
    </div>
  );
}
