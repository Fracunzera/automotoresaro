"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { whatsappLink } from "@/lib/utils";
import { Icon, WhatsAppIcon } from "./Icon";

const nav = [
  { href: "/autos", label: "Comprar" },
  { href: "/vender", label: "Vender" },
  { href: "/financiacion", label: "Financiación" },
  { href: "/nosotros", label: "La agencia" },
];

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className={`flex items-baseline gap-1.5 font-display text-[25px] font-extrabold uppercase leading-none tracking-tight ${claro ? "text-white" : "text-tinta"}`}>
      Automotores
      <span className="relative text-rojo">
        Aro
        <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-rojo" aria-hidden />
      </span>
    </span>
  );
}

export function Header() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  useEffect(() => setAbierto(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Barra de datos de la agencia */}
      <div className="hidden bg-tinta text-[13px] text-stone-300 md:block">
        <div className="contenedor flex h-9 items-center justify-between">
          <div className="flex items-center gap-5">
            <a href={site.mapa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white">
              <Icon name="pin" className="size-4" /> {site.direccion}, {site.ciudad}
            </a>
            <span className="flex items-center gap-1.5"><Icon name="clock" className="size-4" /> {site.horarios}</span>
          </div>
          <a href={`tel:${site.telefono.replace(/[^+\d]/g, "")}`} className="flex items-center gap-1.5 hover:text-white">
            <Icon name="phone" className="size-4" /> {site.telefono}
          </a>
        </div>
      </div>

      <div className="border-b border-linea">
        <div className="contenedor flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label={`${site.nombre}, inicio`}>
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
            <a
              href={whatsappLink(`Hola ${site.nombre}, quería hacer una consulta.`)}
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
            <div className="space-y-1 py-4 text-sm text-stone-600">
              <p>{site.direccion}, {site.ciudad}</p>
              <p>{site.horarios}</p>
              <a href={`tel:${site.telefono.replace(/[^+\d]/g, "")}`} className="font-semibold text-tinta">{site.telefono}</a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
