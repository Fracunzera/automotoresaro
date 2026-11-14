import type { Metadata } from "next";
import Link from "next/link";
import { getFinanciacion } from "@/lib/negocio";
import { FinancingCalculator } from "@/components/FinancingCalculator";

export const metadata: Metadata = {
  title: "Financiación",
  description: "Simulá la cuota de tu próximo auto usado. Anticipo más cuotas fijas, y tu usado como parte de pago.",
};

const requisitos = [
  "DNI vigente",
  "Recibos de sueldo, o constancia de monotributo o autónomo",
  "Comprobante de domicilio a tu nombre",
  "Sin deudas en situación irregular",
];

export default async function FinanciacionPage() {
  const fin = await getFinanciacion();
  const { anticipoMinimo, plazos } = fin;
  return (
    <div className="contenedor pt-10">
      <p className="sobretitulo">Financiación</p>
      <h1 className="titulo mt-2 max-w-2xl text-[44px] sm:text-[56px]">Tu auto con anticipo y cuotas fijas</h1>
      <p className="mt-4 max-w-xl text-lg text-stone-600">
        Desde {Math.round(anticipoMinimo * 100)}% de anticipo, que puede ser tu usado, y el resto en {plazos[0]} a {Math.max(...plazos)} cuotas.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="rounded-lg border border-linea p-5 sm:p-7">
          <FinancingCalculator fin={fin} variante="ancho" />
        </div>

        <div>
          <h2 className="titulo text-[28px]">Requisitos</h2>
          <ul className="mt-4">
            {requisitos.map((r, i) => (
              <li key={r} className="flex gap-4 border-b border-linea py-3.5 text-[15px]">
                <span className="font-display text-lg font-bold text-rojo">0{i + 1}</span> {r}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] text-stone-600">
            ¿Ya elegiste? En la ficha de cada auto podés simular con el precio exacto.{" "}
            <Link href="/autos" className="font-semibold text-rojo hover:underline">Ver autos</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
