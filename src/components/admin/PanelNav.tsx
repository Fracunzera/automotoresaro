"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { salir } from "@/app/admin/acciones";
import { site } from "@/config/site";

const links = [
  { href: "/admin", label: "Inicio", exacto: true },
  { href: "/admin/autos", label: "Mis autos" },
  { href: "/admin/autos/nuevo", label: "Cargar auto" },
  { href: "/admin/ajustes", label: "Comisiones" },
];

export function PanelNav() {
  const path = usePathname();
  const activo = (l: (typeof links)[number]) =>
    l.exacto ? path === l.href : path.startsWith(l.href) && !(l.href === "/admin/autos" && path === "/admin/autos/nuevo");

  return (
    <header className="sticky top-0 z-40 bg-tinta text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="font-display text-xl font-bold uppercase leading-tight tracking-tight">
          Panel <span className="text-rojo">{site.nombre}</span>
        </p>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" className="whitespace-nowrap rounded-md border border-white/30 px-3 py-2 text-base font-semibold hover:bg-white/10">
            Ver la página
          </a>
          <form action={salir}>
            <button className="rounded-md px-3 py-2 text-base font-semibold text-stone-300 hover:text-white">Salir</button>
          </form>
        </div>
      </div>
      <nav className="mx-auto grid max-w-5xl grid-cols-2 px-2 sm:flex sm:gap-1 sm:px-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`border-b-4 px-3 py-3 text-center text-lg font-semibold sm:text-left ${
              activo(l) ? "border-rojo text-white" : "border-transparent text-stone-400 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
