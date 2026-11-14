import type { Metadata } from "next";
import { getAgencia } from "@/lib/agencia";
import { getPublicos } from "@/lib/autos";
import { getFinanciacion } from "@/lib/negocio";
import { Catalogo } from "@/components/Catalogo";

export async function generateMetadata(): Promise<Metadata> {
  const ag = await getAgencia();
  return {
    title: "Autos usados en venta",
    description: `Autos usados revisados en ${ag.ciudad}, con financiación. Filtrá por marca, precio, año y kilómetros.`,
  };
}

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AutosPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [autos, fin, ag] = await Promise.all([getPublicos(), getFinanciacion(), getAgencia()]);
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  return (
    <div className="contenedor pt-8">
      <h1 className="titulo text-[36px] sm:text-[44px]">Autos usados en venta en {ag.ciudad}</h1>
      <p className="mt-1 text-stone-600">
        Todos revisados y con la documentación al día. Están en {ag.ciudad}, {ag.provincia}: si sos de otra ciudad, coordinamos con vos el traslado.
      </p>
      <div className="mt-6">
        <Catalogo
          // la key reinicia los filtros si se navega con otros parámetros (ej. desde la portada)
          key={JSON.stringify(sp)}
          autos={autos}
          fin={fin}
          iniciales={{ q: s("q"), marca: s("marca"), carroceria: s("carroceria"), transmision: s("transmision"), precioMax: s("precioMax") }}
        />
      </div>
    </div>
  );
}
