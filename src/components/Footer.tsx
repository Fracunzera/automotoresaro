import Link from "next/link";
import { site } from "@/config/site";
import { whatsappLink } from "@/lib/utils";
import { Logo } from "./Header";

export function Footer() {
  return (
    <footer className="mt-24 bg-tinta text-stone-400">
      <div className="contenedor grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo claro />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed">{site.descripcion}</p>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-white uppercase">Autos</h3>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li><Link href="/autos" className="hover:text-white">Ver todos</Link></li>
            <li><Link href="/autos?carroceria=SUV" className="hover:text-white">SUV</Link></li>
            <li><Link href="/autos?carroceria=Pick-up" className="hover:text-white">Pick-ups</Link></li>
            <li><Link href="/autos?transmision=Autom%C3%A1tica" className="hover:text-white">Automáticos</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-white uppercase">Servicios</h3>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li><Link href="/vender" className="hover:text-white">Vender mi auto</Link></li>
            <li><Link href="/vender?modo=cambio" className="hover:text-white">Entregar mi usado</Link></li>
            <li><Link href="/financiacion" className="hover:text-white">Financiación</Link></li>
            <li><Link href="/nosotros#preguntas" className="hover:text-white">Preguntas frecuentes</Link></li>
            <li><Link href="/cuenta" className="hover:text-white">Mis favoritos</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold tracking-[0.12em] text-white uppercase">Agencia</h3>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li><a href={site.mapa} target="_blank" rel="noopener noreferrer" className="hover:text-white">{site.direccion}, {site.ciudad}</a></li>
            <li>{site.horarios}</li>
            <li><a href={`tel:${site.telefono.replace(/[^+\d]/g, "")}`} className="hover:text-white">{site.telefono}</a></li>
            <li>
              <a href={whatsappLink(`Hola ${site.nombre}, quería hacer una consulta.`)} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">
                WhatsApp
              </a>
              {" · "}
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">Instagram</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-1 py-5 text-[13px] text-stone-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.nombre}</p>
          <p>
            Precios y cuotas de referencia, sujetos a cambios sin previo aviso. ·{" "}
            <Link href="/privacidad" className="hover:text-white">Privacidad</Link> ·{" "}
            <Link href="/ingresar?agencia=1" className="hover:text-white">Acceso agencia</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
