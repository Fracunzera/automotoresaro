import type { Metadata } from "next";
import { autos } from "@/data/autos";
import { Catalogo } from "@/components/Catalogo";

export const metadata: Metadata = {
  title: "Autos usados en venta",
  description: "Catálogo de autos usados revisados con financiación. Filtrá por marca, precio, año y kilómetros.",
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AutosPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  return (
    <div className="contenedor py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Autos disponibles</h1>
      <p className="mt-1 text-slate-500">Todos revisados, con papeles al día y opción de financiación.</p>
      <div className="mt-8">
        <Catalogo
          // la key reinicia los filtros si se navega con otros parámetros (ej. desde la home)
          key={JSON.stringify(sp)}
          autos={autos}
          iniciales={{ q: s("q"), marca: s("marca"), carroceria: s("carroceria"), precioMax: s("precioMax") }}
        />
      </div>
    </div>
  );
}
