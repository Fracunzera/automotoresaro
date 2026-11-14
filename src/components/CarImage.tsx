import Image from "next/image";
import type { Auto, Carroceria } from "@/data/autos";

/** Perfil lateral de cada tipo de carrocería (viewBox 0 0 225 100). */
export const siluetas: Record<Carroceria, string> = {
  Sedán: "M14 74 Q14 66 22 64 L52 58 L78 42 Q86 38 98 38 L138 38 Q150 38 160 46 L176 58 L200 62 Q210 64 211 72 L211 80 L14 80 Z",
  Hatchback: "M16 74 Q16 66 24 64 L50 58 L76 40 Q84 36 96 36 L150 36 Q160 36 166 44 L180 62 Q200 64 204 72 L204 80 L16 80 Z",
  SUV: "M14 72 Q14 62 24 60 L44 56 L66 34 Q72 28 84 28 L164 28 Q176 28 182 38 L192 56 Q208 58 210 68 L210 80 L14 80 Z",
  "Pick-up": "M10 72 Q10 62 20 60 L40 56 L60 34 Q66 30 78 30 L118 30 L120 54 L208 54 Q214 54 214 62 L214 80 L10 80 Z",
  Utilitario: "M14 72 Q14 62 22 60 L36 56 L52 32 Q56 26 66 26 L196 26 Q206 26 206 36 L208 80 L14 80 Z",
  Coupé: "M12 74 Q12 66 20 64 L60 56 L88 42 Q96 39 108 39 L134 39 Q150 40 166 52 L196 62 Q210 64 211 72 L211 80 L12 80 Z",
};

/** Ícono de línea por carrocería, para los accesos rápidos. */
export function TipoIcono({ tipo, className = "" }: { tipo: Carroceria; className?: string }) {
  return (
    <svg viewBox="0 0 225 100" className={className} aria-hidden="true">
      <path d={siluetas[tipo]} fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="58" cy="80" r="13" fill="#fff" stroke="currentColor" strokeWidth="5" />
      <circle cx="168" cy="80" r="13" fill="#fff" stroke="currentColor" strokeWidth="5" />
    </svg>
  );
}

export function CarImage({
  auto,
  index = 0,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: {
  auto: Auto;
  index?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const foto = auto.fotos[index];
  if (foto) {
    return (
      <div className={`relative overflow-hidden bg-stone-200 ${className}`}>
        <Image src={foto} alt={`${auto.marca} ${auto.modelo} ${auto.anio}`} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    );
  }

  // Sin fotos: "estudio" neutro con el perfil del auto en su color.
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: "linear-gradient(180deg,#e9e8e4 0%,#e9e8e4 64%,#d9d7d1 64%,#cfccc5 100%)" }}
      role="img"
      aria-label={`${auto.marca} ${auto.modelo} ${auto.anio}. Fotos en preparación.`}
    >
      <svg viewBox="0 0 225 100" className="absolute inset-x-[10%] bottom-[18%] w-[80%]">
        <ellipse cx="112" cy="91" rx="104" ry="5" fill="#000" opacity="0.18" />
        <path d={siluetas[auto.carroceria]} fill={auto.colorHex} stroke="#000" strokeOpacity="0.25" strokeWidth="1" />
        <path d={siluetas[auto.carroceria]} fill="url(#brillo)" />
        {[58, 168].map((x) => (
          <g key={x}>
            <circle cx={x} cy="80" r="13" fill="#1c1c1c" />
            <circle cx={x} cy="80" r="7.5" fill="#8a8a8a" />
            <circle cx={x} cy="80" r="2.5" fill="#3a3a3a" />
          </g>
        ))}
        <defs>
          <linearGradient id="brillo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute left-3 top-3 font-display text-[11px] font-semibold tracking-[0.14em] text-stone-500 uppercase">
        Fotos en preparación
      </span>
    </div>
  );
}
