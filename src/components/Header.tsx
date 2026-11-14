"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/config/site";
import { whatsappLink } from "@/lib/utils";
import { Icon, WhatsAppIcon } from "./Icon";

const nav = [
  { href: "/autos", label: "Comprar un auto" },
  { href: "/vender", label: "Vender mi auto" },
  { href: "/financiacion", label: "Financiación" },
  { href: "/nosotros", label: "Nosotros" },
];

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className={`flex items-center gap-2 text-lg font-extrabold tracking-tight ${claro ? "text-white" : "text-marca-950"}`}>
      <span className="grid size-8 place-items-center rounded-full bg-acento-500 text-sm text-marca-950">A</span>
      {site.nombre}
    </span>
  );
}

export function Header() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="contenedor flex h-16 items-center justify-between gap-4">
        <Link href="/" onClick={() => setAbierto(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition hover:bg-slate-100 ${
                pathname.startsWith(n.href) ? "text-marca-600" : "text-slate-700"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink(`Hola ${site.nombre}! Quería hacer una consulta.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp py-2! max-sm:hidden"
          >
            <WhatsAppIcon className="size-4" /> WhatsApp
          </a>
          <button
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setAbierto((v) => !v)}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
          >
            <Icon name={abierto ? "close" : "menu"} className="size-6" />
          </button>
        </div>
      </div>

      {abierto && (
        <nav className="border-t border-slate-200 bg-white md:hidden">
          <div className="contenedor flex flex-col py-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setAbierto(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
