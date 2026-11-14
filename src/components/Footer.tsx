import Link from "next/link";
import { getAgencia } from "@/lib/agencia";
import { linkMapa, telLink } from "@/lib/agencia-tipos";
import { whatsappLink } from "@/lib/utils";
import { Logo } from "./Header";

export async function Footer() {
  const ag = await getAgencia();
  return (
    <footer className="mt-24 bg-tinta text-stone-400">
      <div className="contenedor grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo claro />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed">{ag.marca.descripcion}</p>
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
            <li><a href={linkMapa(ag)} target="_blank" rel="noopener noreferrer" className="hover:text-white">{ag.direccion}, {ag.ciudad}</a></li>
            <li>{ag.horarios}</li>
            <li><a href={telLink(ag.telefono)} className="hover:text-white">{ag.telefono}</a></li>
            <li>
              <a href={whatsappLink(ag.whatsapp, `Hola ${ag.nombre}, quería hacer una consulta.`)} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">
                WhatsApp
              </a>
              {ag.instagram && <>{" · "}<a href={ag.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">Instagram</a></>}
              {ag.facebook && <>{" · "}<a href={ag.facebook} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">Facebook</a></>}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-1 py-5 text-[13px] text-stone-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {ag.nombre}</p>
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
