import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoForm } from "@/components/admin/AutoForm";
import { getPorId } from "@/lib/autos";
import { leerNegocio } from "@/lib/negocio";
import { negocioVacio } from "@/lib/negocio-tipos";
import { ESTADO_TEXTO } from "@/lib/tipos";

export default async function EditarAuto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [auto, negocio] = await Promise.all([getPorId(id), leerNegocio()]);
  if (!auto) notFound();

  return (
    <div>
      <Link href="/admin/autos" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Mis autos</Link>
      <h1 className="mt-3 text-3xl font-bold">Editar {auto.marca} {auto.modelo} {auto.anio}</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">
        Estado: <b>{ESTADO_TEXTO[auto.estado]}</b>. Para venderlo, reservarlo u ocultarlo usá los botones de Mis autos.
      </p>
      <AutoForm auto={auto} negocioInicial={negocio.autos[id] ?? negocioVacio(negocio.ajustes)} ajustes={negocio.ajustes} />
    </div>
  );
}
