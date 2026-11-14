import type { Metadata } from "next";
import { site } from "@/config/site";
import { whatsappLink } from "@/lib/utils";
import { Icon, WhatsAppIcon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "La agencia",
  description: `Conocé ${site.nombre}: dónde estamos, cómo trabajamos y respuestas a las preguntas más comunes.`,
};

const faq = [
  ["¿Los autos están revisados?", "Sí. Antes de publicar un auto revisamos mecánica, frenos, electricidad y carrocería, y verificamos que la documentación esté en regla."],
  ["¿Puedo entregar mi auto como parte de pago?", "Sí. Te lo cotizamos y el valor se descuenta del auto que elijas. Empezá desde Vender mi auto."],
  ["¿Cómo funciona la financiación?", "Pagás un anticipo y el resto en cuotas fijas. La aprobación y la tasa final dependen de la entidad financiera."],
  ["¿Quién hace la transferencia?", "La gestionamos nosotros en el Registro Automotor. Te avisamos qué papeles traer."],
  ["¿Puedo ver el auto y probarlo?", "Sí. Escribinos por WhatsApp y coordinamos día y horario para que lo veas y lo manejes."],
  ["¿Puedo reservar un auto?", "Sí, con una seña. Consultanos las condiciones por WhatsApp."],
  [`No soy de ${site.ciudad}, ¿cómo hago?`, `Estamos en ${site.ciudad}, ${site.provincia}. ${site.traslado}`],
];

export default function NosotrosPage() {
  return (
    <div className="contenedor pt-10">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <p className="sobretitulo">La agencia</p>
          <h1 className="titulo mt-2 text-[44px] sm:text-[56px]">Atención de agencia de barrio, stock a un click</h1>
          {/* TODO: reemplazar por la historia real (desde qué año, quiénes atienden, etc.) */}
          <p className="mt-5 text-lg leading-relaxed text-stone-700">
            En {site.nombre} nos dedicamos a la compraventa de autos usados. Conocemos cada auto que vendemos y te
            acompañamos desde que lo elegís hasta que tenés la cédula a tu nombre.
          </p>
          <p className="mt-4 leading-relaxed text-stone-700">
            En la web podés ver el stock actualizado, simular la cuota y cotizar tu usado. Cuando quieras, venís, lo ves y lo manejás.
          </p>

          <div className="mt-10 rounded-lg bg-papel p-6">
            <h2 className="titulo text-2xl">Dónde estamos</h2>
            <ul className="mt-4 space-y-3 text-[15px]">
              <li className="flex gap-3"><Icon name="pin" className="size-5 shrink-0 text-stone-500" />{site.direccion}, {site.ciudad}</li>
              <li className="flex gap-3"><Icon name="clock" className="size-5 shrink-0 text-stone-500" />{site.horarios}</li>
              <li className="flex gap-3"><Icon name="phone" className="size-5 shrink-0 text-stone-500" />{site.telefono}</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={site.mapa} target="_blank" rel="noopener noreferrer" className="btn-tinta"><Icon name="pin" className="size-4" /> Cómo llegar</a>
              <a href={whatsappLink(`Hola ${site.nombre}, quería hacer una consulta.`)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div id="preguntas" className="scroll-mt-32">
          <h2 className="titulo text-[32px]">Preguntas frecuentes</h2>
          <div className="mt-4 border-t border-linea">
            {faq.map(([p, r]) => (
              <details key={p} className="group border-b border-linea">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-semibold">
                  {p}
                  <Icon name="chevron" className="size-5 shrink-0 text-stone-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="-mt-1 pb-5 leading-relaxed text-stone-700">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
