import type { Metadata } from "next";
import { site } from "@/config/site";
import { autos } from "@/data/autos";
import { Catalogo } from "@/components/Catalogo";

export const metadata: Metadata = {
  title: "Autos usados en venta",
  description: `Autos usados revisados en ${site.ciudad}, con financiación. Filtrá por marca, precio, año y kilómetros.`,
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AutosPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  return (
    <div className="contenedor pt-8">
      <h1 className="titulo text-[36px] sm:text-[44px]">Autos usados en venta</h1>
      <p className="mt-1 text-stone-600">Todos revisados y con la documentación al día.</p>
      <div className="mt-6">
        <Catalogo
          // la key reinicia los filtros si se navega con otros parámetros (ej. desde la portada)
          key={JSON.stringify(sp)}
          autos={autos}
          iniciales={{ q: s("q"), marca: s("marca"), carroceria: s("carroceria"), transmision: s("transmision"), precioMax: s("precioMax") }}
        />
      </div>
    </div>
  );
}
