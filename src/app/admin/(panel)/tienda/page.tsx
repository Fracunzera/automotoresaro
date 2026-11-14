import Link from "next/link";
import { notFound } from "next/navigation";
import { esTienda } from "@/lib/rubro";
import { getConfigTienda } from "@/lib/tienda";
import { requerirPagina } from "@/lib/usuarios";
import { ConfigTiendaForm } from "@/components/admin/ConfigTiendaForm";

export default async function TiendaAjustes() {
  if (!esTienda) notFound();
  await requerirPagina("admin");
  const c = await getConfigTienda();
  return (
    <div>
      <Link href="/admin/configuracion" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Ajustes</Link>
      <h1 className="mt-3 text-3xl font-bold">Envíos y pagos</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">Cómo reciben los clientes sus compras y cómo te pagan.</p>
      <ConfigTiendaForm inicial={c} mpToken={!!process.env.MP_ACCESS_TOKEN} />
    </div>
  );
}
