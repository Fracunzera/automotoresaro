import Link from "next/link";
import { AgenciaForm } from "@/components/admin/AgenciaForm";
import { getAgencia } from "@/lib/agencia";
import { requerirPagina } from "@/lib/usuarios";

export default async function AgenciaPage() {
  await requerirPagina("admin");
  const ag = await getAgencia();
  return (
    <div>
      <Link href="/admin/configuracion" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Ajustes</Link>
      <h1 className="mt-3 text-3xl font-bold">Datos de la agencia</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">Es lo que ven los clientes en la página, en los mails y en el contrato.</p>
      <AgenciaForm inicial={ag} />
    </div>
  );
}
