"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { linkMapa, telLink } from "@/lib/agencia-tipos";
import { useAgencia } from "./AgenciaContext";
import { whatsappLink } from "@/lib/utils";
import { Icon, WhatsAppIcon } from "./Icon";
import { useCliente } from "./cuenta/ClienteContext";
import { useCarrito } from "./tienda/CarritoContext";
import { esTienda } from "@/lib/rubro";

const nav = esTienda
  ? [
      { href: "/productos", label: "Productos" },
      { href: "/nosotros#preguntas", label: "Cómo comprar" },
      { href: "/nosotros", label: "Nosotros" },
    ]
  : [
      { href: "/autos", label: "Comprar" },
      { href: "/vender", label: "Vender" },
      { href: "/financiacion", label: "Financiación" },
      { href: "/nosotros", label: "La agencia" },
    ];

export function Logo({ claro = false }: { claro?: boolean }) {
  const ag = useAgencia();
  if (ag.marca.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ag.marca.logo}
        alt={ag.nombre}
        className={`h-9 w-auto max-w-[200px] object-contain sm:h-10 ${claro ? "rounded-md bg-white px-2 py-1" : ""}`}
      />
    );
  }
  const palabras = ag.nombre.trim().split(/\s+/);
  const ultima = palabras.pop();
  return (
    <span className={`flex items-baseline gap-1.5 font-display text-[21px] font-extrabold sm:text-[25px] uppercase leading-none tracking-tight ${claro ? "text-white" : "text-tinta"}`}>
      {palabras.join(" ")}
      <span className="relative text-rojo">
        {ultima}
        <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-rojo" aria-hidden />
      </span>
    </span>
  );
}

export function Header() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  const ag = useAgencia();
  const { cliente, admin, cargado, favoritos } = useCliente();
  useEffect(() => setAbierto(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Barra de datos de la agencia */}
      <div className="hidden bg-tinta text-[13px] text-stone-300 md:block">
        <div className="contenedor flex h-9 items-center justify-between">
          <div className="flex items-center gap-5">
            <a href={linkMapa(ag)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white">
              <Icon name="pin" className="size-4" /> {ag.direccion}, {ag.ciudad}
            </a>
            <span className="flex items-center gap-1.5"><Icon name="clock" className="size-4" /> {ag.horarios}</span>
          </div>
          <a href={telLink(ag.telefono)} className="flex items-center gap-1.5 hover:text-white">
            <Icon name="phone" className="size-4" /> {ag.telefono}
          </a>
        </div>
      </div>

      <div className="border-b border-linea">
        <div className="contenedor flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label={`${ag.nombre}, inicio`}>
            <Logo />
          </Link>

          <nav className="hidden h-full items-stretch md:flex">
            {nav.map((n) => {
              const activo = pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center border-b-2 px-4 text-[15px] font-semibold transition-colors ${
                    activo ? "border-rojo text-tinta" : "border-transparent text-stone-600 hover:text-tinta"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {admin && (
              <Link href="/admin" className="btn-tinta h-10! px-4! max-md:hidden">Panel</Link>
            )}
            {esTienda && <BotonCarrito />}
            <Link
              href={cliente ? "/cuenta" : "/ingresar"}
              className={`flex h-10 items-center gap-1.5 rounded-md border border-stone-300 px-2.5 text-[15px] font-semibold transition-colors hover:border-tinta ${cargado ? "" : "invisible"}`}
            >
              <Icon name="user" className="size-5" />
              <span className={`max-w-32 truncate max-[359px]:hidden ${cliente ? "max-sm:hidden" : ""}`}>{cliente ? cliente.nombre.split(" ")[0] : "Ingresar"}</span>
              {cliente && favoritos.length > 0 && (
                <span className="rounded-full bg-rojo px-1.5 text-xs font-bold text-white" aria-label={`${favoritos.length} favoritos`}>{favoritos.length}</span>
              )}
            </Link>
            <a
              href={whatsappLink(ag.whatsapp, `Hola ${ag.nombre}, quería hacer una consulta.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp h-10! px-4! max-sm:hidden"
            >
              <WhatsAppIcon className="size-4" /> WhatsApp
            </a>
            <button
              className="-mr-2 p-2 text-tinta md:hidden"
              onClick={() => setAbierto((v) => !v)}
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={abierto}
            >
              <Icon name={abierto ? "close" : "menu"} className="size-7" />
            </button>
          </div>
        </div>
      </div>

      {abierto && (
        <nav className="border-b border-linea bg-white md:hidden">
          <div className="contenedor flex flex-col py-2">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-linea py-3.5 font-display text-xl font-bold uppercase">
                {n.label}
              </Link>
            ))}
            <Link href={cliente ? "/cuenta" : "/ingresar"} className="border-b border-linea py-3.5 font-display text-xl font-bold uppercase">
              {cliente ? "Mi cuenta y favoritos" : "Ingresar"}
            </Link>
            {admin && (
              <Link href="/admin" className="border-b border-linea py-3.5 font-display text-xl font-bold uppercase text-rojo">Panel</Link>
            )}
            <div className="space-y-1 py-4 text-sm text-stone-600">
              <p>{ag.direccion}, {ag.ciudad}</p>
              <p>{ag.horarios}</p>
              <a href={telLink(ag.telefono)} className="font-semibold text-tinta">{ag.telefono}</a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function BotonCarrito() {
  const { cantidad } = useCarrito();
  return (
    <Link href="/carrito" aria-label={`Carrito, ${cantidad} productos`} className="relative grid size-10 place-items-center rounded-md border border-stone-300 hover:border-tinta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="size-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
      {cantidad > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-rojo px-1 text-xs font-bold text-white">{cantidad}</span>
      )}
    </Link>
  );
}
