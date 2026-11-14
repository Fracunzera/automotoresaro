"use client";

import { useState } from "react";
import type { Auto } from "@/lib/tipos";
import { CarImage } from "./CarImage";
import { Icon } from "./Icon";

export function Gallery({ auto }: { auto: Auto }) {
  const [actual, setActual] = useState(0);
  const total = auto.fotos.length;
  const mover = (d: number) => setActual((i) => (i + d + total) % total);

  return (
    <div>
      <div className="relative">
        <CarImage auto={auto} index={actual} priority sizes="(max-width: 1024px) 100vw, 66vw" className="aspect-[16/10] rounded-lg" />
        {total > 1 && (
          <>
            <button onClick={() => mover(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow hover:bg-white">
              <Icon name="chevron" className="size-5 rotate-90" />
            </button>
            <button onClick={() => mover(1)} aria-label="Foto siguiente" className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow hover:bg-white">
              <Icon name="chevron" className="size-5 -rotate-90" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-sm bg-black/70 px-2 py-1 text-xs font-semibold text-white">
              {actual + 1} / {total}
            </span>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {auto.fotos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActual(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`w-24 shrink-0 overflow-hidden rounded-md border-2 ${i === actual ? "border-rojo" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <CarImage auto={auto} index={i} sizes="96px" className="aspect-[4/3]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
