"use client";

import { useEffect, useState } from "react";
import { rutaCorta } from "@/lib/link-corto";
import { Icon, WhatsAppIcon } from "./Icon";

/** Copia texto al portapapeles (con alternativa para navegadores viejos). */
async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const t = document.createElement("textarea");
    t.value = texto;
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    const ok = document.execCommand("copy");
    t.remove();
    return ok;
  }
}

type Props = {
  autoId: string;
  /** Ej: "Toyota Corolla 2021 · $ 32.500.000" */
  titulo: string;
  /** "grande" para el panel (letra y botones grandes). */
  tamano?: "normal" | "grande";
};

/** Link corto + copiar + compartir (menú del celular, WhatsApp, Facebook). */
export function PanelCompartir({ autoId, titulo, tamano = "normal" }: Props) {
  const [url, setUrl] = useState(rutaCorta(autoId));
  const [copiado, setCopiado] = useState(false);
  const [nativo, setNativo] = useState(false);
  const g = tamano === "grande";

  useEffect(() => {
    setUrl(`${window.location.origin}${rutaCorta(autoId)}`);
    setNativo(typeof navigator.share === "function");
  }, [autoId]);

  const texto = `${titulo}\n${url}`;
  const btn = g ? "btn-g border-2 border-stone-300 bg-white hover:border-tinta" : "btn-borde";

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          readOnly
          value={url.replace(/^https?:\/\//, "")}
          onFocus={(e) => e.target.select()}
          aria-label="Link para compartir"
          className={`${g ? "campo-g" : "campo"} min-w-0 font-semibold`}
        />
        <button
          type="button"
          onClick={async () => {
            if (await copiar(url)) {
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2500);
            }
          }}
          className={`${g ? "btn-g bg-tinta text-white hover:bg-tinta-2" : "btn-tinta"} shrink-0`}
        >
          {copiado ? "¡Copiado!" : "Copiar link"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" className={g ? "btn-g bg-[#1faa53] text-white hover:bg-[#188f45]" : "btn-whatsapp"}>
          <WhatsAppIcon className="size-5" /> WhatsApp
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={btn}>
          Facebook
        </a>
        {nativo && (
          <button type="button" onClick={() => navigator.share({ title: titulo, text: titulo, url }).catch(() => {})} className={`${btn} col-span-2`}>
            <Icon name="arrow" className="size-5 -rotate-45" /> Más opciones (Instagram, Telegram…)
          </button>
        )}
      </div>
    </div>
  );
}

/** Botón "Compartir" que abre una ventana con las opciones. */
export function BotonCompartir({ autoId, titulo, tamano = "normal", className }: Props & { className?: string }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} className={className ?? "btn-borde w-full"}>
        <Icon name="arrow" className="size-5 -rotate-45" /> Compartir
      </button>
      {abierto && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Compartir" onClick={() => setAbierto(false)}>
          <div className="w-full max-w-md rounded-t-lg bg-white p-5 sm:rounded-lg sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className={tamano === "grande" ? "text-2xl font-bold" : "sobretitulo"}>Compartir</p>
                <p className={`mt-1 font-semibold leading-snug ${tamano === "grande" ? "text-lg" : ""}`}>{titulo}</p>
              </div>
              <button onClick={() => setAbierto(false)} aria-label="Cerrar" className="-mr-2 -mt-1 p-2"><Icon name="close" className="size-6" /></button>
            </div>
            <PanelCompartir autoId={autoId} titulo={titulo} tamano={tamano} />
          </div>
        </div>
      )}
    </>
  );
}
