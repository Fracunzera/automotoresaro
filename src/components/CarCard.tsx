import Link from "next/link";
import type { Auto } from "@/data/autos";
import { site } from "@/config/site";
import { cuotaMensual, formatKm, formatNumero } from "@/lib/utils";
import { CarImage } from "./CarImage";

/** Etiqueta principal que se muestra sobre la foto (una sola, como en los portales grandes). */
function etiqueta(a: Auto): { texto: string; clase: string } | null {
  if (a.reservado) return { texto: "Reservado", clase: "bg-tinta text-white" };
  if (a.unicoDueno) return { texto: "Único dueño", clase: "bg-white text-tinta" };
  if (a.serviceOficial) return { texto: "Services oficiales", clase: "bg-white text-tinta" };
  return null;
}

export function Precio({ valor, className = "" }: { valor: number; className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      <span className="mr-0.5 align-[0.35em] text-[0.55em]">$</span>
      {formatNumero(valor)}
    </span>
  );
}

export function CarCard({ auto }: { auto: Auto }) {
  const { tna, anticipoMinimo, plazos } = site.financiacion;
  const plazoMax = Math.max(...plazos);
  const cuota = cuotaMensual(auto.precio * (1 - anticipoMinimo), plazoMax, tna);
  const tag = etiqueta(auto);

  return (
    <Link
      href={`/autos/${auto.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-linea bg-white transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)]"
    >
      <div className="relative">
        <CarImage auto={auto} className={`aspect-[4/3] ${auto.reservado ? "opacity-70" : ""}`} />
        {tag && (
          <span className={`absolute bottom-3 left-3 rounded-sm px-2 py-1 text-xs font-semibold shadow-sm ${tag.clase}`}>
            {tag.texto}
          </span>
        )}
      </div>

      <div className="px-4 pb-3 pt-3.5">
        <h3 className="text-[17px] font-semibold leading-snug text-tinta">
          {auto.marca} <span className="text-stone-400">·</span> {auto.modelo}
        </h3>
        <p className="mt-0.5 truncate text-sm text-stone-500">
          {auto.anio} · {formatKm(auto.km)} · {auto.version}
        </p>
      </div>

      <div className="mx-4 border-t border-linea py-3">
        <p className="text-[13px] text-stone-500">Precio de contado</p>
        <Precio valor={auto.precio} className="text-[28px] leading-tight text-tinta" />
        <p className="text-[13px] text-stone-600">
          o <span className="font-semibold text-tinta">${formatNumero(Math.round(cuota))}</span> / mes*
        </p>
      </div>

      <div className="mx-4 mt-auto flex gap-4 border-t border-linea py-2.5 text-[13px] text-stone-500">
        <span>{auto.transmision}</span>
        <span>{auto.combustible}</span>
        <span>{auto.carroceria}</span>
      </div>
    </Link>
  );
}
