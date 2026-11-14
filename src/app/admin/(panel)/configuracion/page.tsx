import Link from "next/link";
import { requerirPagina } from "@/lib/usuarios";

const opciones = [
  { href: "/admin/agencia", titulo: "Datos del negocio", texto: "Dirección, teléfono, WhatsApp, horarios y redes." },
  { href: "/admin/marca", titulo: "Marca y portada", texto: "Colores, logo, foto y textos de la portada, y beneficios." },
  { href: "/admin/empleados", titulo: "Empleados", texto: "Dar de alta vendedores o administradores, cambiarles la contraseña o darlos de baja." },
  { href: "/admin/ajustes", titulo: "Comisiones y financiación", texto: "Comisión por autos de clientes, acuerdo de consignación, tasa y cuotas." },
  { href: "/admin/mi-cuenta", titulo: "Mi contraseña", texto: "Cambiar la contraseña con la que entrás." },
];

export default async function Configuracion() {
  await requerirPagina("admin");
  return (
    <div>
      <h1 className="text-3xl font-bold">Ajustes</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {opciones.map((o) => (
          <Link key={o.href} href={o.href} className="tarjeta-g block p-5 transition-colors hover:border-tinta">
            <p className="text-xl font-bold">{o.titulo} →</p>
            <p className="mt-1 text-lg text-stone-600">{o.texto}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
