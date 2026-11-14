"use client";

import { useState } from "react";
import type { Producto } from "@/lib/productos-tipos";
import { ProductoImagen } from "./ProductoImagen";

export function GaleriaProducto({ p }: { p: Producto }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <ProductoImagen producto={p} index={i} priority sizes="(max-width: 1024px) 100vw, 50vw" className="aspect-square rounded-lg" />
      {p.fotos.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {p.fotos.map((_, j) => (
            <button key={j} onClick={() => setI(j)} aria-label={`Ver foto ${j + 1}`} className={`w-20 shrink-0 overflow-hidden rounded-md border-2 ${j === i ? "border-rojo" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <ProductoImagen producto={p} index={j} sizes="80px" className="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
