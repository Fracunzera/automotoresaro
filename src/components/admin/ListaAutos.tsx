"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { borrarAutoAccion, cambiarEstadoAuto } from "@/app/admin/acciones";
import type { Auto, Estado } from "@/lib/tipos";
import { ESTADO_TEXTO } from "@/lib/tipos";
import { formatKm, formatNumero } from "@/lib/utils";
import { CarImage } from "../CarImage";
import { Confirmar } from "./Confirmar";
import { CampoPesos } from "./Campos";

export type FilaAuto = {
  auto: Auto;
  tipo: "propio" | "consignacion" | null;
  dueno: string;
  ganancia: number | null;
  alDueno: number | null;
  precioVenta: number | null;
};

const pesos = (n: number) => `$ ${formatNumero(n)}`;

const COLOR_ESTADO: Record<Estado, string> = {
  publicado: "bg-[#e7f4ec] text-[#17733c]",
  reservado: "bg-[#fff1cc] text-[#7a5300]",
  vendido: "bg-stone-200 text-stone-700",
  oculto: "bg-stone-200 text-stone-700",
};

export function ListaAutos({ filas }: { filas: FilaAuto[] }) {
  const router = useRouter();
  const [cargando, start] = useTransition();
  const [error, setError] = useState("");
  const [vendiendo, setVendiendo] = useState<Auto | null>(null);
  const [precioVenta, setPrecioVenta] = useState(0);
  const [borrando, setBorrando] = useState<Auto | null>(null);

  const titulo = (a: Auto) => `${a.marca} ${a.modelo} ${a.anio}`;

  function ejecutar(fn: () => Promise<{ ok: true; mensaje: string } | { ok: false; error: string }>, alTerminar?: () => void) {
    setError("");
    start(async () => {
      const r = await fn();
      if (!r.ok) return setError(r.error);
      alTerminar?.();
      const ver = new URLSearchParams(window.location.search).get("ver");
      router.push(`/admin/autos?${ver ? `ver=${ver}&` : ""}ok=${encodeURIComponent(r.mensaje)}`);
      router.refresh();
    });
  }

  const cambiar = (a: Auto, estado: Estado) => ejecutar(() => cambiarEstadoAuto(a.id, estado));

  return (
    <>
      {error && <p role="alert" className="mt-5 rounded-lg bg-rojo-claro p-4 text-lg font-semibold text-rojo-oscuro">{error}</p>}

      <ul className="mt-5 space-y-4">
        {filas.map(({ auto: a, tipo, dueno, ganancia, alDueno, precioVenta: vendidoA }) => (
          <li key={a.id} className="tarjeta-g overflow-hidden">
            <div className="flex gap-4 p-4">
              <Link href={`/admin/autos/${a.id}`} className="w-28 shrink-0 sm:w-40">
                <CarImage auto={a} sizes="160px" className="aspect-[4/3] rounded-md" />
              </Link>
              <div className="min-w-0 flex-1">
                <span className={`inline-block rounded-sm px-2.5 py-1 text-base font-bold ${COLOR_ESTADO[a.estado]}`}>
                  {ESTADO_TEXTO[a.estado]}
                </span>
                {a.ejemplo && <span className="ml-2 inline-block rounded-sm bg-[#fff8e1] px-2.5 py-1 text-base font-semibold text-[#7a5300]">Ejemplo</span>}
                <h2 className="mt-1.5 text-xl font-bold leading-snug">{a.marca} {a.modelo}</h2>
                <p className="text-lg text-stone-600">{a.anio} · {formatKm(a.km)}</p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {a.estado === "vendido" && vendidoA ? <>Vendido a {pesos(vendidoA)}</> : pesos(a.precio)}
                </p>
              </div>
            </div>

            {/* Datos privados */}
            <div className="border-t-2 border-linea bg-papel px-4 py-3 text-lg">
              {tipo === "consignacion" ? (
                <p>
                  <b>De un cliente</b>{dueno && <> ({dueno})</>}
                  {ganancia !== null && <> · vos ganás <b>{pesos(ganancia)}</b></>}
                  {alDueno !== null && <> · al dueño le quedan {pesos(alDueno)}</>}
                </p>
              ) : tipo === "propio" ? (
                <p>
                  <b>Auto propio</b>
                  {ganancia !== null ? <> · ganancia {a.estado === "vendido" ? "" : "estimada "}<b>{pesos(ganancia)}</b></> : <> · <span className="text-stone-600">falta cargar cuánto pagaste</span></>}
                </p>
              ) : (
                <p className="text-stone-600">Sin datos de compra o comisión.</p>
              )}
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2 border-t-2 border-linea p-3 sm:flex sm:flex-wrap">
              <Link href={`/admin/autos/${a.id}`} className="btn-g border-2 border-tinta bg-white hover:bg-papel">Editar</Link>
              {(a.estado === "publicado" || a.estado === "reservado") && (
                <button
                  disabled={cargando}
                  onClick={() => { setPrecioVenta(a.precio); setVendiendo(a); }}
                  className="btn-g bg-[#17733c] text-white hover:bg-[#125e31]"
                >
                  Lo vendí
                </button>
              )}
              {a.estado === "publicado" && (
                <button disabled={cargando} onClick={() => cambiar(a, "reservado")} className="btn-g border-2 border-stone-300 bg-white hover:border-tinta">Reservar</button>
              )}
              {a.estado === "reservado" && (
                <button disabled={cargando} onClick={() => cambiar(a, "publicado")} className="btn-g border-2 border-stone-300 bg-white hover:border-tinta">Sacar reserva</button>
              )}
              {(a.estado === "publicado" || a.estado === "reservado") && (
                <button disabled={cargando} onClick={() => cambiar(a, "oculto")} className="btn-g border-2 border-stone-300 bg-white hover:border-tinta">Ocultar</button>
              )}
              {(a.estado === "oculto" || a.estado === "vendido") && (
                <button disabled={cargando} onClick={() => cambiar(a, "publicado")} className="btn-g bg-tinta text-white hover:bg-tinta-2">
                  {a.estado === "vendido" ? "Volver a poner en venta" : "Publicar"}
                </button>
              )}
              {(a.estado === "oculto" || a.estado === "vendido") && (
                <button disabled={cargando} onClick={() => setBorrando(a)} className="btn-g border-2 border-stone-300 bg-white text-rojo-oscuro hover:border-rojo">Borrar</button>
              )}
              {(a.estado === "publicado" || a.estado === "reservado") && (
                <a href={`/autos/${a.slug}`} target="_blank" className="btn-g border-2 border-stone-300 bg-white hover:border-tinta">Ver en la página</a>
              )}
            </div>
          </li>
        ))}
      </ul>

      {vendiendo && (
        <Confirmar
          titulo={`¡Vendiste el ${titulo(vendiendo)}!`}
          texto="¿A cuánto lo vendiste? Si fue al precio publicado, dejalo como está."
          confirmar="Guardar venta"
          cargando={cargando}
          onCancelar={() => setVendiendo(null)}
          onConfirmar={() => ejecutar(() => cambiarEstadoAuto(vendiendo.id, "vendido", precioVenta), () => setVendiendo(null))}
        >
          <div className="mt-4">
            <CampoPesos id="precio-venta" label="Precio final de venta" valor={precioVenta} onChange={setPrecioVenta} />
            <p className="ayuda-g">El auto deja de aparecer en la página y la venta se suma al resumen del mes.</p>
          </div>
        </Confirmar>
      )}

      {borrando && (
        <Confirmar
          titulo={`¿Borrar el ${titulo(borrando)}?`}
          texto="Se borra para siempre, con sus fotos y sus datos. Si solo querés que no se vea, usá “Ocultar”."
          confirmar="Sí, borrarlo"
          peligro
          cargando={cargando}
          onCancelar={() => setBorrando(null)}
          onConfirmar={() => ejecutar(() => borrarAutoAccion(borrando.id, titulo(borrando)), () => setBorrando(null))}
        />
      )}
    </>
  );
}
