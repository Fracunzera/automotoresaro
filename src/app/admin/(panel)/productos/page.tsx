import Link from "next/link";
import { notFound } from "next/navigation";
import { leerPedidos } from "@/lib/pedidos";
import { getProductosTodos } from "@/lib/productos";
import { esTienda } from "@/lib/rubro";
import { ListaProductos } from "@/components/admin/ListaProductos";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductosAdmin({ searchParams }: { searchParams: SP }) {
  if (!esTienda) notFound();
  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? sp.ok.slice(0, 300) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const [productos, pedidos] = await Promise.all([getProductosTodos(), leerPedidos()]);
  const vendidos: Record<string, number> = {};
  for (const p of pedidos) if (p.estado !== "cancelado") for (const i of p.items) vendidos[i.productoId] = (vendidos[i.productoId] ?? 0) + i.cantidad;

  const grupos = [
    { id: "venta", label: "A la venta", filtro: (p: (typeof productos)[number]) => p.estado === "publicado" && p.stock !== 0 },
    { id: "sinstock", label: "Sin stock", filtro: (p: (typeof productos)[number]) => p.stock === 0 },
    { id: "ocultos", label: "Ocultos", filtro: (p: (typeof productos)[number]) => p.estado === "oculto" },
  ];
  const g = grupos.find((x) => x.id === sp.ver) ?? grupos[0];
  const lista = productos.filter(g.filtro).filter((p) => !q || `${p.nombre} ${p.categoria}`.toLowerCase().includes(q));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn-g bg-rojo text-white hover:bg-rojo-oscuro">+ Cargar producto</Link>
      </div>
      {ok && <p role="status" className="mt-5 rounded-lg border-2 border-[#9fd3b2] bg-[#e7f4ec] p-4 text-lg font-semibold text-[#17733c]">✓ {ok}</p>}
      <nav className="mt-6 grid grid-cols-3 gap-2">
        {grupos.map((x) => (
          <Link key={x.id} href={x.id === "venta" ? "/admin/productos" : `/admin/productos?ver=${x.id}`} className={`rounded-md border-2 px-2 py-3 text-center text-lg font-semibold ${g.id === x.id ? "border-tinta bg-tinta text-white" : "border-linea bg-white text-stone-700 hover:border-tinta"}`}>
            {x.label} <span className="whitespace-nowrap">({productos.filter(x.filtro).length})</span>
          </Link>
        ))}
      </nav>
      <form className="mt-4">
        {g.id !== "venta" && <input type="hidden" name="ver" value={g.id} />}
        <input type="search" name="q" defaultValue={q} placeholder="Buscar producto" aria-label="Buscar producto" className="campo-g" />
      </form>
      <ListaProductos productos={lista} vendidos={vendidos} />
      {lista.length === 0 && <p className="tarjeta-g mt-4 p-8 text-center text-xl">No hay productos acá.</p>}
    </div>
  );
}
