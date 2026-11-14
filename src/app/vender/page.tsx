import type { Metadata } from "next";
import { SellForm } from "@/components/SellForm";

export const metadata: Metadata = {
  title: "Vendé tu auto",
  description: "Cotizá tu auto usado gratis. Te lo compramos o lo tomamos como parte de pago.",
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function VenderPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const cambio = s("modo") === "cambio";

  return (
    <div className="contenedor pt-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div>
          <p className="sobretitulo">{cambio ? "Permuta" : "Vendé tu auto"}</p>
          <h1 className="titulo mt-2 text-[44px] sm:text-[56px]">
            {cambio ? "Entregá tu auto y llevate otro" : "Te compramos el auto"}
          </h1>
          <p className="mt-4 max-w-md text-lg text-stone-600">
            Completá los datos en un minuto y te respondemos por WhatsApp con una cotización. Sin compromiso.
          </p>

          <dl className="mt-10 grid max-w-md grid-cols-2 border-l border-t border-linea">
            {[
              ["Respuesta", "Por WhatsApp"],
              ["Pago", "Al cerrar la operación"],
              ["Trámites", "Los gestionamos nosotros"],
              ["Revisión", "En la agencia"],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-r border-linea p-4">
                <dt className="text-[13px] text-stone-500">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 max-w-md">
            <h2 className="text-lg font-semibold">Qué vas a necesitar</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-stone-700">
              <li className="border-b border-linea pb-2">Título y cédula del auto</li>
              <li className="border-b border-linea pb-2">DNI del titular</li>
              <li className="border-b border-linea pb-2">Formulario 08 (lo podemos gestionar nosotros)</li>
              <li>Libre deuda de patentes</li>
            </ul>
          </div>
        </div>

        <SellForm
          key={JSON.stringify(sp)}
          inicial={{ marca: s("marca") ?? "", modelo: s("modelo") ?? "", anio: s("anio") ?? "", modo: cambio ? "cambio" : "venta" }}
        />
      </div>
    </div>
  );
}
