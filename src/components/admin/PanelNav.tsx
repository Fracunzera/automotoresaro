"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { salir } from "@/app/admin/acciones";
import { useAgencia } from "../AgenciaContext";
import { esTienda } from "@/lib/rubro";

type Item = { href: string; label: string; exacto?: boolean; tambien?: string[]; soloAdmin?: boolean; soloVendedor?: boolean };

const AJUSTES = ["/admin/ajustes", "/admin/agencia", "/admin/marca", "/admin/empleados", "/admin/mi-cuenta", "/admin/tienda"];

const links: Item[] = esTienda
  ? [
      { href: "/admin", label: "Inicio", exacto: true },
      { href: "/admin/productos", label: "Productos" },
      { href: "/admin/productos/nuevo", label: "Cargar producto", exacto: true },
      { href: "/admin/pedidos", label: "Pedidos" },
      { href: "/admin/clientes", label: "Clientes" },
      { href: "/admin/mails", label: "Mails", soloAdmin: true },
      { href: "/admin/configuracion", label: "Ajustes", soloAdmin: true, tambien: AJUSTES },
      { href: "/admin/mi-cuenta", label: "Mi contraseña", soloVendedor: true },
    ]
  : [
  { href: "/admin", label: "Inicio", exacto: true },
  { href: "/admin/autos", label: "Mis autos" },
  { href: "/admin/autos/nuevo", label: "Cargar auto", exacto: true },
  { href: "/admin/consultas", label: "Consultas" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/mails", label: "Mails", soloAdmin: true },
  { href: "/admin/configuracion", label: "Ajustes", soloAdmin: true, tambien: AJUSTES },
  { href: "/admin/mi-cuenta", label: "Mi contraseña", soloVendedor: true },
];

export function PanelNav({ nombreUsuario, esAdmin, consultasNuevas }: { nombreUsuario: string; esAdmin: boolean; consultasNuevas: number }) {
  const conNumero = esTienda ? "/admin/pedidos" : "/admin/consultas";
  const path = usePathname();
  const { nombre } = useAgencia();
  const visibles = links.filter((l) => (l.soloAdmin ? esAdmin : l.soloVendedor ? !esAdmin : true));
  const activo = (l: Item) =>
    l.exacto
      ? path === l.href
      : [l.href, ...(l.tambien ?? [])].some((h) => path.startsWith(h)) && !path.endsWith("/nuevo");

  return (
    <header className="sticky top-0 z-40 bg-tinta text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-bold uppercase leading-tight tracking-tight">
            Panel <span className="text-rojo">{nombre}</span>
          </p>
          <p className="truncate text-sm text-stone-400">Hola, {nombreUsuario.split(" ")[0]}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a href="/" target="_blank" className="whitespace-nowrap rounded-md border border-white/30 px-3 py-2 text-base font-semibold hover:bg-white/10">
            Ver la página
          </a>
          <form action={salir}>
            <button className="rounded-md px-3 py-2 text-base font-semibold text-stone-300 hover:text-white">Salir</button>
          </form>
        </div>
      </div>
      <nav className="mx-auto grid max-w-5xl grid-cols-3 px-1 sm:flex sm:gap-1 sm:px-4">
        {visibles.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`border-b-4 px-1 py-3 text-center text-base font-semibold sm:px-3 sm:text-left sm:text-lg ${
              activo(l) ? "border-rojo text-white" : "border-transparent text-stone-400 hover:text-white"
            }`}
          >
            {l.label}
            {l.href === conNumero && consultasNuevas > 0 && (
              <span className="ml-1.5 inline-grid min-w-6 place-items-center rounded-full bg-rojo px-1.5 text-sm font-bold text-white" aria-label={`${consultasNuevas} nuevas`}>
                {consultasNuevas}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </header>
  );
}
