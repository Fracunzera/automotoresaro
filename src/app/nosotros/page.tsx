import type { Metadata } from "next";
import { site } from "@/config/site";
import { whatsappLink } from "@/lib/utils";
import { Icon, WhatsAppIcon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Nosotros y preguntas frecuentes",
  description: `Conocé ${site.nombre}: dónde estamos, cómo trabajamos y respuestas a las dudas más comunes.`,
};

const faq = [
  {
    p: "¿Los autos están revisados?",
    r: "Sí. Antes de publicar cada auto hacemos una revisión mecánica, eléctrica y de carrocería, y verificamos que la documentación esté en regla.",
  },
  {
    p: "¿Puedo entregar mi auto como parte de pago?",
    r: "Sí. Te lo cotizamos en el día y el valor se descuenta del precio del auto que elijas. Podés empezar desde la sección Vender mi auto.",
  },
  {
    p: "¿Cómo funciona la financiación?",
    r: "Pagás un anticipo y el resto en cuotas fijas mensuales. Podés simular la cuota en cada ficha o en la sección Financiación. La aprobación depende de la entidad financiera.",
  },
  {
    p: "¿Quién hace la transferencia?",
    r: "Nos encargamos de la gestión de la transferencia en el Registro Automotor para que vos no tengas que hacer trámites.",
  },
  {
    p: "¿Puedo ver el auto y probarlo antes de comprar?",
    r: "Por supuesto. Escribinos por WhatsApp y coordinamos un horario para que lo veas y hagas la prueba de manejo.",
  },
  {
    p: "¿Puedo reservar un auto?",
    r: "Sí, con una seña podés reservarlo. Consultanos las condiciones por WhatsApp.",
  },
];

export default function NosotrosPage() {
  return (
    <div className="contenedor py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold tracking-wide text-marca-600 uppercase">Nosotros</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Una agencia de confianza, ahora también online</h1>
          {/* TODO: reemplazar por la historia real de la agencia */}
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            En {site.nombre} nos dedicamos hace años a la compraventa de autos usados. Conocemos cada unidad que vendemos y
            te acompañamos en todo el proceso: desde elegir el auto hasta la transferencia.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            Ahora sumamos la comodidad de ver el stock, simular la financiación y cotizar tu usado desde tu casa, con la
            atención personalizada de siempre.
          </p>

          <div className="mt-10 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold text-slate-900">Visitanos</h2>
            <p className="flex gap-3 text-slate-700"><Icon name="pin" className="size-5 shrink-0 text-marca-600" />{site.direccion}</p>
            <p className="flex gap-3 text-slate-700"><Icon name="clock" className="size-5 shrink-0 text-marca-600" />{site.horarios}</p>
            <p className="flex gap-3 text-slate-700"><Icon name="phone" className="size-5 shrink-0 text-marca-600" />{site.telefono}</p>
            <a
              href={whatsappLink(`Hola ${site.nombre}! Quería hacer una consulta.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <WhatsAppIcon /> Escribinos por WhatsApp
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Preguntas frecuentes</h2>
          <div className="mt-6 space-y-3">
            {faq.map((f) => (
              <details key={f.p} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                  {f.p}
                  <span className="text-xl text-marca-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-slate-600">{f.r}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
