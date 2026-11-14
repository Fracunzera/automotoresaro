import Link from "next/link";
import { notFound } from "next/navigation";
import { ClienteForm } from "@/components/admin/ClienteForm";
import { getCliente } from "@/lib/clientes";
import { usuarioActual } from "@/lib/usuarios";

export default async function EditarCliente({ params }: { params: Promise<{ id: string }> }) {
  const [c, yo] = await Promise.all([getCliente((await params).id), usuarioActual()]);
  if (!c) notFound();
  return (
    <div>
      <Link href="/admin/clientes" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Clientes</Link>
      <h1 className="mt-3 mb-6 text-3xl font-bold">{c.nombre || c.email}</h1>
      <ClienteForm
        id={c.id}
        origenWeb={c.origen === "web"}
        puedeBorrar={yo?.rol === "admin"}
        inicial={{ email: c.email, nombre: c.nombre, telefono: c.telefono, ciudad: c.ciudad, notas: c.notas, aceptaMails: c.aceptaMails }}
      />
    </div>
  );
}
