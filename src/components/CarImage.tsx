import Image from "next/image";
import type { Auto } from "@/data/autos";

/** Silueta según carrocería para cuando el auto todavía no tiene fotos. */
const siluetas: Record<Auto["carroceria"], string> = {
  Sedán: "M20 70 L40 50 Q50 40 70 38 L130 36 Q150 36 165 48 L185 60 Q200 62 205 70 L205 82 L20 82 Z",
  Hatchback: "M22 70 L45 46 Q55 38 75 37 L140 36 Q155 37 168 50 L182 66 Q196 68 200 74 L200 82 L22 82 Z",
  SUV: "M20 66 L38 40 Q46 30 66 30 L150 30 Q165 30 175 44 L188 60 Q202 62 206 70 L206 84 L20 84 Z",
  "Pick-up": "M15 64 L35 40 Q42 32 58 32 L110 32 L112 56 L205 56 L208 84 L15 84 Z",
  Utilitario: "M20 70 L32 36 Q36 28 50 28 L175 28 Q190 28 195 40 L205 70 L205 84 L20 84 Z",
  Coupé: "M18 72 L50 50 Q65 40 90 40 L125 40 Q150 42 170 56 L190 64 Q204 66 206 74 L206 82 L18 82 Z",
};

export function CarImage({
  auto,
  index = 0,
  className = "",
  priority = false,
}: {
  auto: Auto;
  index?: number;
  className?: string;
  priority?: boolean;
}) {
  const foto = auto.fotos[index];
  if (foto) {
    return (
      <div className={`relative overflow-hidden bg-slate-200 ${className}`}>
        <Image
          src={foto}
          alt={`${auto.marca} ${auto.modelo} ${auto.anio}`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-slate-300 ${className}`}
      role="img"
      aria-label={`${auto.marca} ${auto.modelo} ${auto.anio} (foto próximamente)`}
    >
      <svg viewBox="0 0 225 100" className="w-4/5 drop-shadow-md">
        <ellipse cx="112" cy="90" rx="100" ry="6" fill="#0f172a" opacity="0.15" />
        <path d={siluetas[auto.carroceria]} fill={auto.colorHex} stroke="#0f172a" strokeOpacity="0.35" strokeWidth="1.5" />
        <circle cx="60" cy="84" r="13" fill="#1f2937" />
        <circle cx="60" cy="84" r="6" fill="#9ca3af" />
        <circle cx="168" cy="84" r="13" fill="#1f2937" />
        <circle cx="168" cy="84" r="6" fill="#9ca3af" />
      </svg>
      <span className="absolute bottom-2 right-3 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
        Fotos próximamente
      </span>
    </div>
  );
}
