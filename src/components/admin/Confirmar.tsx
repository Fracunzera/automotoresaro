"use client";

import { useEffect, type ReactNode } from "react";

/** Ventana de confirmación grande y clara, con dos botones bien separados. */
export function Confirmar({
  titulo,
  texto,
  confirmar,
  peligro = false,
  cargando = false,
  onConfirmar,
  onCancelar,
  children,
}: {
  titulo: string;
  texto?: string;
  confirmar: string;
  peligro?: boolean;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  children?: ReactNode;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onCancelar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onCancelar]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="confirmar-titulo">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
        <h2 id="confirmar-titulo" className="text-2xl font-bold">{titulo}</h2>
        {texto && <p className="mt-2 text-lg text-stone-700">{texto}</p>}
        {children}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button onClick={onCancelar} disabled={cargando} className="btn-g border-2 border-stone-300 bg-white hover:border-tinta">
            No, volver
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            className={`btn-g text-white ${peligro ? "bg-rojo hover:bg-rojo-oscuro" : "bg-tinta hover:bg-tinta-2"}`}
          >
            {cargando ? "Un momento…" : confirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
