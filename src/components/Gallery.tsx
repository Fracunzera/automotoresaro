"use client";

import { useState } from "react";
import type { Auto } from "@/data/autos";
import { CarImage } from "./CarImage";

export function Gallery({ auto }: { auto: Auto }) {
  const [actual, setActual] = useState(0);
  const total = Math.max(auto.fotos.length, 1);

  return (
    <div>
      <CarImage auto={auto} index={actual} priority className="aspect-[16/10] rounded-2xl" />
      {total > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {auto.fotos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActual(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`overflow-hidden rounded-lg ring-2 transition ${i === actual ? "ring-marca-600" : "ring-transparent opacity-70 hover:opacity-100"}`}
            >
              <CarImage auto={auto} index={i} className="aspect-[4/3]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
