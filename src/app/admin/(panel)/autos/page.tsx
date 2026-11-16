import { esTienda } from "@/lib/rubro";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTodos } from "@/lib/autos";
import { leerNegocio } from "@/lib/negocio";
import { leerClientes } from "@/lib/clientes";
import { usuarioActual } from "@/lib/usuarios";
import { MOTIVO_RETIRO_TEXTO, calcularGanancia, completarNegocio, diasParaVencer, paraElDueno } from "@/lib/negocio-tipos";
import { ESTADOS, ESTADO_TEXTO, type Estado } from "@/lib/tipos";
import { ListaAutos, type FilaAuto } from "@/components/admin/ListaAutos";
import { PanelCompartir } from "@/components/Compartir";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function MisAutos({ searchParams }: { searchParams: SP }) {
  if (esTienda) notFound();
  const sp = await searchParams;
  const [autos, negocioTodo, clientes, yo] = await Promise.all([getTodos(), leerNegocio(), leerClientes(), usuarioActual()]);
  const esAdmin = yo?.rol === "admin";
  // Los vendedores no reciben datos del negocio (costos, comisiones, dueños)
  const negocio = esAdmin ? negocioTodo : { ...negocioTodo, autos: {} };
  const pedido = typeof sp.ver === "string" && (ESTADOS as readonly string[]).includes(sp.ver) ? (sp.ver as Estado) : null;
  const ok = typeof sp.ok === "string" ? sp.ok.slice(0, 300) : undefined;

  const cuenta = Object.fromEntries(ESTADOS.map((e) => [e, autos.filter((a) => a.estado === e).length])) as Record<Estado, number>;
  // Por defecto: "En venta" (incluye reservados)
  const ver: Estado | "stock" = pedido ?? "stock";
  const lista = autos.filter((a) => (ver === "stock" ? a.estado === "publicado" || a.estado === "reservado" : a.estado === ver));

  const filas: FilaAuto[] = lista.map((a) => {
    const n = negocio.autos[a.id] ? completarNegocio(negocio.autos[a.id], negocio.ajustes) : undefined;
    const comisionAlPrecio = n?.tipo === "consignacion" ? calcularGanancia({ ...n, comisionModo: n.comisionModo === "neto" ? "porcentaje" : n.comisionModo, comisionValor: n.comisionModo === "neto" ? negocio.ajustes.comisionValor : n.comisionValor }, a.precio, negocio.ajustes.comisionMinima) : null;
    const precio = a.estado === "vendido" ? (n?.precioVenta ?? a.precio) : a.precio;
    return {
      auto: a,
      tipo: n?.tipo ?? null,
      dueno: n?.tipo === "consignacion" ? n.duenoNombre : "",
      ganancia: n ? calcularGanancia(n, precio, negocio.ajustes.comisionMinima) : null,
      alDueno: n ? paraElDueno(n, precio, negocio.ajustes.comisionMinima) : null,
      precioVenta: n?.precioVenta ?? null,
      pagoDueno: n?.pagoDueno ?? null,
      interesados: clientes.filter((c) => c.favoritos.includes(a.id)).length,
      consignacion: n?.tipo === "consignacion",
      venceEn: n && (a.estado === "publicado" || a.estado === "reservado" || a.estado === "oculto") ? diasParaVencer(n) : null,
      retiro: n?.retiro ? { texto: MOTIVO_RETIRO_TEXTO[n.retiro.motivo], cobrado: n.retiro.cobrado } : null,
      sugerido: {
        antes: n?.cargoRetiro ?? 0,
        vendioAfuera: n?.exclusividad ? Math.round(comisionAlPrecio ?? 0) : 0,
        vencio: 0,
      },
    };
  });

  const pestañas: { id: Estado | "stock"; label: string; n: number }[] = [
    { id: "stock", label: "En venta", n: cuenta.publicado + cuenta.reservado },
    { id: "vendido", label: ESTADO_TEXTO.vendido + "s", n: cuenta.vendido },
    { id: "retirado", label: "Retirados", n: cuenta.retirado },
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
      {(() => {
        const nuevo = typeof sp.compartir === "string" ? autos.find((x) => x.id === sp.compartir && x.estado === "publicado") : undefined;
        return nuevo ? (
          <section className="tarjeta-g mt-4 p-5">
            <h2 className="text-2xl font-bold">Compartilo ahora</h2>
            <p className="mb-4 mt-1 text-lg text-stone-600">Mandalo por WhatsApp, publicalo en las redes o copiá el link.</p>
            <PanelCompartir autoId={nuevo.id} titulo={`${nuevo.marca} ${nuevo.modelo} ${nuevo.anio} · $ ${nuevo.precio.toLocaleString("es-AR")}`} tamano="grande" />
          </section>
        ) : null;
      })()}

      <nav className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
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

      <ListaAutos filas={filas} esAdmin={esAdmin} />

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
