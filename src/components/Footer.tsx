import Link from "next/link";
import { site } from "@/config/site";
import { whatsappLink } from "@/lib/utils";
import { Logo } from "./Header";
import { Icon, WhatsAppIcon } from "./Icon";

export function Footer() {
  return (
    <footer className="mt-24 bg-marca-950 text-slate-300">
      <div className="contenedor grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo claro />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{site.descripcion}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Navegación</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/autos" className="hover:text-white">Comprar un auto</Link></li>
            <li><Link href="/vender" className="hover:text-white">Vender mi auto</Link></li>
            <li><Link href="/financiacion" className="hover:text-white">Financiación</Link></li>
            <li><Link href="/nosotros" className="hover:text-white">Nosotros y preguntas frecuentes</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Contacto</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><Icon name="pin" className="size-5 shrink-0" />{site.direccion}</li>
            <li className="flex gap-2"><Icon name="clock" className="size-5 shrink-0" />{site.horarios}</li>
            <li className="flex gap-2"><Icon name="phone" className="size-5 shrink-0" />{site.telefono}</li>
            <li>
              <a
                href={whatsappLink(`Hola ${site.nombre}! Quería hacer una consulta.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-[#25d366] hover:underline"
              >
                <WhatsAppIcon className="size-4" /> Escribinos por WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.nombre}. Todos los derechos reservados.</p>
          <p>Precios y cuotas de referencia, sujetos a cambios sin previo aviso.</p>
        </div>
      </div>
    </footer>
  );
}
