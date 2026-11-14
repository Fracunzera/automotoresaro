import Link from "next/link";
import { MarcaForm } from "@/components/admin/MarcaForm";
import { getAgencia } from "@/lib/agencia";
import { requerirPagina } from "@/lib/usuarios";

export default async function MarcaPage() {
  await requerirPagina("admin");
  const ag = await getAgencia();
  return (
    <div>
      <Link href="/admin/configuracion" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Ajustes</Link>
      <h1 className="mt-3 text-3xl font-bold">Marca y portada</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">Colores, logo y textos de la página.</p>
      <MarcaForm inicial={ag.marca} nombre={ag.nombre} />
    </div>
  );
}
