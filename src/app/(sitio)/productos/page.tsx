import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgencia } from "@/lib/agencia";
import { getProductosPublicos } from "@/lib/productos";
import { esTienda } from "@/lib/rubro";
import { CatalogoProductos } from "@/components/tienda/CatalogoProductos";

export async function generateMetadata(): Promise<Metadata> {
  const ag = await getAgencia();
  return { title: "Productos", description: `Todos los productos de ${ag.nombre}. ${ag.marca.eslogan}` };
}

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductosPage({ searchParams }: { searchParams: SP }) {
  if (!esTienda) notFound();
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const productos = await getProductosPublicos();
  return (
    <div className="contenedor pt-8">
      <h1 className="titulo text-[36px] sm:text-[44px]">Productos</h1>
      <div className="mt-6">
        <CatalogoProductos key={JSON.stringify(sp)} productos={productos} inicial={{ q: s("q"), categoria: s("categoria") }} />
      </div>
    </div>
  );
}
