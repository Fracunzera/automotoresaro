import type { Metadata } from "next";
import { SellForm } from "@/components/SellForm";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Vendé tu auto",
  description: "Cotizá tu auto usado gratis. Te pagamos en el acto o lo tomamos como parte de pago.",
};

const pasos = [
  { icono: "doc", titulo: "Contanos de tu auto", texto: "Completá el formulario en 1 minuto. Si tenés fotos, mejor." },
  { icono: "phone", titulo: "Recibí una oferta", texto: "Te respondemos por WhatsApp con una cotización estimada." },
  { icono: "check", titulo: "Inspección", texto: "Lo revisamos en persona y confirmamos el precio final." },
  { icono: "card", titulo: "Cobrá o cambialo", texto: "Te pagamos en el acto o lo usás como parte de pago." },
];

export default function VenderPage() {
  return (
    <div className="contenedor py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-marca-600 uppercase tracking-wide">Vendé tu auto</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
            Vendé tu auto rápido, seguro y sin vueltas
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Olvidate de publicar, atender llamados y recibir desconocidos en tu casa. Nosotros te lo compramos.
          </p>
          <ol className="mt-10 space-y-6">
            {pasos.map((p, i) => (
              <li key={p.titulo} className="flex gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-marca-50 text-marca-600">
                  <Icon name={p.icono} className="size-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{i + 1}. {p.titulo}</h2>
                  <p className="text-sm text-slate-600">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-2xl bg-acento-500/10 p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">¿Qué necesitás para vender?</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Título del automotor y cédula verde</li>
              <li>DNI del titular</li>
              <li>Formulario 08 (lo podemos gestionar nosotros)</li>
              <li>Libre deuda de patentes</li>
            </ul>
          </div>
        </div>
        <SellForm />
      </div>
    </div>
  );
}
