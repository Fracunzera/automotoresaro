"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { borrarEjemplosAccion } from "@/app/admin/acciones";
import { Confirmar } from "./Confirmar";

export function BotonBorrarEjemplos() {
  const [preguntar, setPreguntar] = useState(false);
  const [error, setError] = useState("");
  const [cargando, start] = useTransition();
  const router = useRouter();

  return (
    <>
      <button onClick={() => setPreguntar(true)} className="btn-g mt-4 bg-tinta text-white hover:bg-tinta-2">
        Borrar los autos de ejemplo
      </button>
      {error && <p className="mt-3 text-lg font-semibold text-rojo-oscuro">{error}</p>}
      {preguntar && (
        <Confirmar
          titulo="¿Borrar todos los autos de ejemplo?"
          texto="Se borran solo los autos de muestra. Los autos que cargaste vos no se tocan."
          confirmar="Sí, borrarlos"
          cargando={cargando}
          onCancelar={() => setPreguntar(false)}
          onConfirmar={() =>
            start(async () => {
              const r = await borrarEjemplosAccion();
              if (!r.ok) return setError(r.error);
              setPreguntar(false);
              router.refresh();
            })
          }
        />
      )}
    </>
  );
}
