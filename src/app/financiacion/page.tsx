import type { Metadata } from "next";
import Link from "next/link";
import { FinancingCalculator } from "@/components/FinancingCalculator";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Financiación",
  description: "Simulá la cuota de tu próximo auto usado. Anticipo + cuotas fijas, y tu usado como parte de pago.",
};

const requisitos = [
  "DNI vigente",
  "Últimos recibos de sueldo o constancia de monotributo / autónomo",
  "Comprobante de domicilio (servicio a tu nombre)",
  "Sin deudas en situación irregular en el sistema financiero",
];

export default function FinanciacionPage() {
  return (
    <div className="contenedor py-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold tracking-wide text-marca-600 uppercase">Financiación</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Tu auto en cuotas fijas</h1>
          <p className="mt-4 text-lg text-slate-600">
            Pagás un anticipo (puede ser con tu usado) y el resto en cuotas. Simulá ahora y te ayudamos con todo el trámite.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["swap", "Tu usado como anticipo"],
              ["clock", "Aprobación rápida"],
              ["card", "Cuotas fijas en pesos"],
            ].map(([i, t]) => (
              <div key={t} className="rounded-2xl border border-slate-200 bg-white p-5">
                <Icon name={i} className="size-6 text-marca-600" />
                <p className="mt-3 text-sm font-semibold text-slate-900">{t}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-bold text-slate-900">Requisitos</h2>
          <ul className="mt-4 space-y-2">
            {requisitos.map((r) => (
              <li key={r} className="flex gap-2 text-slate-700">
                <Icon name="check" className="size-5 shrink-0 text-green-600" /> {r}
              </li>
            ))}
          </ul>

          <p className="mt-10 text-slate-600">
            ¿Ya sabés qué auto querés? Entrá a su ficha y simulá la cuota con el precio exacto.{" "}
            <Link href="/autos" className="font-semibold text-marca-600 hover:underline">Ver autos →</Link>
          </p>
        </div>
        <FinancingCalculator />
      </div>
    </div>
  );
}
