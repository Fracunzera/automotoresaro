import { esTienda } from "@/lib/rubro";
import type { Metadata } from "next";
import { getAgencia } from "@/lib/agencia";
import { linkMapa } from "@/lib/agencia-tipos";
import { whatsappLink } from "@/lib/utils";
import { Icon, WhatsAppIcon } from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const ag = await getAgencia();
  return { title: esTienda ? "Nosotros" : "La agencia", description: `Conocé ${ag.nombre}: dónde estamos, cómo trabajamos y respuestas a las preguntas más comunes.` };
}

const preguntasTienda = (ag: Awaited<ReturnType<typeof getAgencia>>) => [
  ["¿Cómo compro?", "Elegí los productos, agregalos al carrito y tocá “Finalizar compra”. Completás tus datos, elegís cómo recibirlo y cómo pagar, y listo."],
  ["¿Hacen envíos?", `Sí, hacemos envíos a domicilio. También podés retirar sin cargo en ${ag.direccion}, ${ag.ciudad}. El costo del envío lo ves antes de confirmar.`],
  ["¿Cómo puedo pagar?", "Con Mercado Pago (tarjeta de crédito, débito o dinero en cuenta), por transferencia o en efectivo al retirar o recibir."],
  ["¿Cómo sigo mi pedido?", "Al confirmar la compra te damos un link para ver en qué estado está. Si dejaste tu email, también te llega por mail."],
  ["¿Puedo cambiar un producto?", "Sí. Escribinos por WhatsApp y te explicamos cómo hacer el cambio."],
  ["¿Necesito crear una cuenta?", "No hace falta. Si querés guardar favoritos y ver tus pedidos, podés ingresar solo con tu email."],
];

const preguntas = (ag: Awaited<ReturnType<typeof getAgencia>>) => esTienda ? preguntasTienda(ag) : [
  ["¿Los autos están revisados?", "Sí. Antes de publicar un auto revisamos mecánica, frenos, electricidad y carrocería, y verificamos que la documentación esté en regla."],
  ["¿Puedo entregar mi auto como parte de pago?", "Sí. Te lo cotizamos y el valor se descuenta del auto que elijas. Empezá desde Vender mi auto."],
  ["¿Cómo funciona la financiación?", "Pagás un anticipo y el resto en cuotas fijas. La aprobación y la tasa final dependen de la entidad financiera."],
  ["¿Quién hace la transferencia?", "La gestionamos nosotros en el Registro Automotor. Te avisamos qué papeles traer."],
  ["¿Puedo ver el auto y probarlo?", "Sí. Escribinos por WhatsApp y coordinamos día y horario para que lo veas y lo manejes."],
  ["¿Puedo reservar un auto?", "Sí, con una seña. Consultanos las condiciones por WhatsApp."],
  [`No soy de ${ag.ciudad}, ¿cómo hago?`, `Estamos en ${ag.ciudad}, ${ag.provincia}. ${ag.traslado}`],
];

export default async function NosotrosPage() {
  const ag = await getAgencia();
  const faq = preguntas(ag);
  return (
    <div className="contenedor pt-10">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <p className="sobretitulo">{esTienda ? "Nosotros" : "La agencia"}</p>
          <h1 className="titulo mt-2 text-[44px] sm:text-[56px]">{ag.marca.nosotrosTitulo}</h1>
          {ag.marca.nosotrosTexto.split(/\n\s*\n/).map((par, i) => (
            <p key={i} className={`${i === 0 ? "mt-5 text-lg" : "mt-4"} whitespace-pre-line leading-relaxed text-stone-700`}>{par}</p>
          ))}

          <div className="mt-10 rounded-lg bg-papel p-6">
            <h2 className="titulo text-2xl">Dónde estamos</h2>
            <ul className="mt-4 space-y-3 text-[15px]">
              <li className="flex gap-3"><Icon name="pin" className="size-5 shrink-0 text-stone-500" />{ag.direccion}, {ag.ciudad}</li>
              <li className="flex gap-3"><Icon name="clock" className="size-5 shrink-0 text-stone-500" />{ag.horarios}</li>
              <li className="flex gap-3"><Icon name="phone" className="size-5 shrink-0 text-stone-500" />{ag.telefono}</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={linkMapa(ag)} target="_blank" rel="noopener noreferrer" className="btn-tinta"><Icon name="pin" className="size-4" /> Cómo llegar</a>
              <a href={whatsappLink(ag.whatsapp, `Hola ${ag.nombre}, quería hacer una consulta.`)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
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
