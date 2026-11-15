import { esTienda } from "@/lib/rubro";
import { notFound } from "next/navigation";
import Link from "next/link";
import { leerConsultas, type EstadoConsulta } from "@/lib/consultas";
import { getAgencia } from "@/lib/agencia";
import { usuarioActual } from "@/lib/usuarios";
import { ListaConsultas } from "@/components/admin/ListaConsultas";

type SP = Promise<Record<string, string | string[] | undefined>>;

const GRUPOS: { id: string; label: string; estados: EstadoConsulta[] }[] = [
  { id: "nuevas", label: "Para revisar", estados: ["nueva"] },
  { id: "curso", label: "En curso", estados: ["contactado", "cotizado"] },
  { id: "cerradas", label: "Publicados o descartados", estados: ["comprado", "descartada"] },
];

export default async function ConsultasPage({ searchParams }: { searchParams: SP }) {
  if (esTienda) notFound();
  const sp = await searchParams;
  const [consultas, ag, yo] = await Promise.all([leerConsultas(), getAgencia(), usuarioActual()]);
  const grupo = GRUPOS.find((g) => g.id === sp.ver) ?? GRUPOS[0];
  const lista = consultas.filter((c) => grupo.estados.includes(c.estado));

  return (
    <div>
      <h1 className="text-3xl font-bold">Autos para publicar</h1>
      <p className="mt-1 text-lg text-stone-600">
        Dueños que cargaron su auto en “Vendé tu auto”. Revisalo, hablá con el dueño para acordar precio y comisión, y publicalo.
      </p>
      <nav className="mt-6 grid grid-cols-3 gap-2">
        {GRUPOS.map((g) => {
          const n = consultas.filter((c) => g.estados.includes(c.estado)).length;
          return (
            <Link
              key={g.id}
              href={g.id === "nuevas" ? "/admin/consultas" : `/admin/consultas?ver=${g.id}`}
              className={`rounded-md border-2 px-2 py-3 text-center text-lg font-semibold ${
                grupo.id === g.id ? "border-tinta bg-tinta text-white" : "border-linea bg-white text-stone-700 hover:border-tinta"
              }`}
            >
              {g.label} <span className="whitespace-nowrap">({n})</span>
            </Link>
          );
        })}
      </nav>
      <ListaConsultas consultas={lista} agencia={ag.nombre} esAdmin={yo?.rol === "admin"} />
      {lista.length === 0 && (
        <p className="tarjeta-g mt-4 p-8 text-center text-xl">
          {grupo.id === "nuevas" ? "No hay autos para revisar. Cuando un dueño cargue su auto en “Vendé tu auto”, aparece acá." : "No hay consultas acá."}
        </p>
      )}
    </div>
  );
}
