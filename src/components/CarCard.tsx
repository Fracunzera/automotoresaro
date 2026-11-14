import Link from "next/link";
import type { Auto } from "@/data/autos";
import { site } from "@/config/site";
import { cuotaMensual, formatKm, formatPrecio } from "@/lib/utils";
import { CarImage } from "./CarImage";

export function CarCard({ auto }: { auto: Auto }) {
  const { tna, anticipoMinimo, plazos } = site.financiacion;
  const plazoMax = Math.max(...plazos);
  const cuota = cuotaMensual(auto.precio * (1 - anticipoMinimo), plazoMax, tna);

  return (
    <Link
      href={`/autos/${auto.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative">
        <CarImage auto={auto} className="aspect-[4/3]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {auto.reservado && (
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">Reservado</span>
          )}
          {auto.unicoDueno && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800">Único dueño</span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-slate-900 group-hover:text-marca-600">
          {auto.marca} {auto.modelo}
        </h3>
        <p className="truncate text-sm text-slate-500">{auto.version}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
          <span>{auto.anio}</span>
          <span aria-hidden>·</span>
          <span>{formatKm(auto.km)}</span>
          <span aria-hidden>·</span>
          <span>{auto.transmision}</span>
          <span aria-hidden>·</span>
          <span>{auto.combustible}</span>
        </div>
        <div className="mt-auto pt-4">
          <p className="text-xl font-bold text-slate-900">{formatPrecio(auto.precio)}</p>
          <p className="text-xs text-slate-500">
            o anticipo + {plazoMax} cuotas de <span className="font-semibold text-marca-600">{formatPrecio(cuota)}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
