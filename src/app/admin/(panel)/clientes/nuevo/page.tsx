import Link from "next/link";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default function NuevoCliente() {
  return (
    <div>
      <Link href="/admin/clientes" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Clientes</Link>
      <h1 className="mt-3 mb-6 text-3xl font-bold">Agregar un cliente</h1>
      <ClienteForm inicial={{ email: "", nombre: "", telefono: "", ciudad: "", notas: "", aceptaMails: false }} />
    </div>
  );
}
