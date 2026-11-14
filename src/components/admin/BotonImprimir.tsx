"use client";

export function BotonImprimir() {
  return (
    <button onClick={() => window.print()} className="btn-g bg-rojo text-white hover:bg-rojo-oscuro">
      Imprimir
    </button>
  );
}
