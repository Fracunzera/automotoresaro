import Link from "next/link";
import { getTodos } from "@/lib/autos";
import { leerNegocio } from "@/lib/negocio";
import { calcularGanancia, paraElDueno } from "@/lib/negocio-tipos";
import { ESTADOS, ESTADO_TEXTO, type Estado } from "@/lib/tipos";
import { ListaAutos, type FilaAuto } from "@/components/admin/ListaAutos";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function MisAutos({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [autos, negocio] = await Promise.all([getTodos(), leerNegocio()]);
  const pedido = typeof sp.ver === "string" && (ESTADOS as readonly string[]).includes(sp.ver) ? (sp.ver as Estado) : null;
  const ok = typeof sp.ok === "string" ? sp.ok.slice(0, 300) : undefined;

  const cuenta = Object.fromEntries(ESTADOS.map((e) => [e, autos.filter((a) => a.estado === e).length])) as Record<Estado, number>;
  // Por defecto: "En venta" (incluye reservados)
  const ver: Estado | "stock" = pedido ?? "stock";
  const lista = autos.filter((a) => (ver === "stock" ? a.estado === "publicado" || a.estado === "reservado" : a.estado === ver));

  const filas: FilaAuto[] = lista.map((a) => {
    const n = negocio.autos[a.id];
    const precio = a.estado === "vendido" ? (n?.precioVenta ?? a.precio) : a.precio;
    return {
      auto: a,
      tipo: n?.tipo ?? null,
      dueno: n?.tipo === "consignacion" ? n.duenoNombre : "",
      ganancia: n ? calcularGanancia(n, precio, negocio.ajustes.comisionMinima) : null,
      alDueno: n ? paraElDueno(n, precio, negocio.ajustes.comisionMinima) : null,
      precioVenta: n?.precioVenta ?? null,
    };
  });

  const pestañas: { id: Estado | "stock"; label: string; n: number }[] = [
    { id: "stock", label: "En venta", n: cuenta.publicado + cuenta.reservado },
    { id: "vendido", label: ESTADO_TEXTO.vendido + "s", n: cuenta.vendido },
    { id: "oculto", label: ESTADO_TEXTO.oculto + "s", n: cuenta.oculto },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Mis autos</h1>
        <Link href="/admin/autos/nuevo" className="btn-g bg-rojo text-white hover:bg-rojo-oscuro">+ Cargar un auto nuevo</Link>
      </div>

      {ok && (
        <p role="status" className="mt-5 rounded-lg border-2 border-[#9fd3b2] bg-[#e7f4ec] p-4 text-lg font-semibold text-[#17733c]">
          ✓ {ok}
        </p>
      )}

      <nav className="mt-6 grid grid-cols-3 gap-2">
        {pestañas.map((p) => (
          <Link
            key={p.id}
            href={p.id === "stock" ? "/admin/autos" : `/admin/autos?ver=${p.id}`}
            className={`rounded-md border-2 px-2 py-3 text-center text-lg font-semibold ${
              ver === p.id ? "border-tinta bg-tinta text-white" : "border-linea bg-white text-stone-700 hover:border-tinta"
            }`}
          >
            {p.label} <span className="whitespace-nowrap">({p.n})</span>
          </Link>
        ))}
      </nav>

      <ListaAutos filas={filas} />

      {filas.length === 0 && (
        <div className="tarjeta-g mt-4 p-8 text-center">
          <p className="text-xl font-semibold">No hay autos acá.</p>
          {ver === "stock" && (
            <Link href="/admin/autos/nuevo" className="btn-g mt-4 bg-rojo text-white hover:bg-rojo-oscuro">+ Cargar un auto nuevo</Link>
          )}
        </div>
      )}
    </div>
  );
}
