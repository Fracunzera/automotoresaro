import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgencia } from "@/lib/agencia";
import { leerPedidos } from "@/lib/pedidos";
import type { EstadoPedido } from "@/lib/productos-tipos";
import { esTienda } from "@/lib/rubro";
import { usuarioActual } from "@/lib/usuarios";
import { ListaPedidos } from "@/components/admin/ListaPedidos";

type SP = Promise<Record<string, string | string[] | undefined>>;

const GRUPOS: { id: string; label: string; estados: EstadoPedido[] }[] = [
  { id: "nuevos", label: "Nuevos", estados: ["nuevo"] },
  { id: "curso", label: "En curso", estados: ["preparando", "listo", "enviado"] },
  { id: "entregados", label: "Entregados", estados: ["entregado"] },
  { id: "cancelados", label: "Cancelados", estados: ["cancelado"] },
];

export default async function PedidosPage({ searchParams }: { searchParams: SP }) {
  if (!esTienda) notFound();
  const sp = await searchParams;
  const [pedidos, ag, yo] = await Promise.all([leerPedidos(), getAgencia(), usuarioActual()]);
  const g = GRUPOS.find((x) => x.id === sp.ver) ?? GRUPOS[0];
  const lista = pedidos.filter((p) => g.estados.includes(p.estado));
  return (
    <div>
      <h1 className="text-3xl font-bold">Pedidos</h1>
      <nav className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {GRUPOS.map((x) => (
          <Link key={x.id} href={x.id === "nuevos" ? "/admin/pedidos" : `/admin/pedidos?ver=${x.id}`} className={`rounded-md border-2 px-2 py-3 text-center text-lg font-semibold ${g.id === x.id ? "border-tinta bg-tinta text-white" : "border-linea bg-white text-stone-700 hover:border-tinta"}`}>
            {x.label} <span className="whitespace-nowrap">({pedidos.filter((p) => x.estados.includes(p.estado)).length})</span>
          </Link>
        ))}
      </nav>
      <ListaPedidos pedidos={lista} tienda={ag.nombre} esAdmin={yo?.rol === "admin"} />
      {lista.length === 0 && <p className="tarjeta-g mt-4 p-8 text-center text-xl">{g.id === "nuevos" ? "No hay pedidos nuevos. Cuando alguien compre, aparece acá." : "No hay pedidos acá."}</p>}
    </div>
  );
}
