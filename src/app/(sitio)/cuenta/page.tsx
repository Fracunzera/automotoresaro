import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPublicos } from "@/lib/autos";
import { getCliente } from "@/lib/clientes";
import { getFinanciacion } from "@/lib/negocio";
import { idClienteActual } from "@/lib/sesion-cliente";
import { CarCard } from "@/components/CarCard";
import { ProductoCard } from "@/components/tienda/ProductoCard";
import { getProductosPublicos } from "@/lib/productos";
import { leerPedidos } from "@/lib/pedidos";
import { esTienda } from "@/lib/rubro";
import { ESTADO_PEDIDO_TEXTO } from "@/lib/productos-tipos";
import { formatNumero } from "@/lib/utils";
import { PerfilForm } from "@/components/cuenta/PerfilForm";
import { salirCliente } from "./acciones";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const id = await idClienteActual();
  const cliente = id ? await getCliente(id) : undefined;
  if (!cliente) redirect("/ingresar?volver=/cuenta");

  const [publicos, fin, productos, pedidos] = await Promise.all([
    esTienda ? Promise.resolve([]) : getPublicos(),
    getFinanciacion(),
    esTienda ? getProductosPublicos() : Promise.resolve([]),
    esTienda ? leerPedidos() : Promise.resolve([]),
  ]);
  const favoritos = cliente.favoritos.map((f) => publicos.find((a) => a.id === f)).filter((a) => !!a);
  const favProductos = cliente.favoritos.map((f) => productos.find((p) => p.id === f)).filter((p) => !!p);
  const noDisponibles = cliente.favoritos.length - (esTienda ? favProductos.length : favoritos.length);
  const misPedidos = pedidos.filter((p) => p.cliente.email && p.cliente.email === cliente.email);

  return (
    <div className="contenedor pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="sobretitulo">Mi cuenta</p>
          <h1 className="titulo mt-1 text-[40px]">Hola{cliente.nombre ? `, ${cliente.nombre.split(" ")[0]}` : ""}</h1>
        </div>
        <form action={salirCliente}>
          <button className="btn-borde">Salir</button>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="titulo text-[30px]">Mis favoritos</h2>
        {esTienda && favProductos.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {favProductos.map((p) => <ProductoCard key={p.id} p={p} />)}
          </div>
        ) : !esTienda && favoritos.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {favoritos.map((a) => <CarCard key={a.id} auto={a} fin={fin} />)}
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-papel p-8">
            <p className="text-lg font-semibold">Todavía no guardaste {esTienda ? "productos" : "autos"}.</p>
            <p className="mt-1 text-stone-600">Tocá el corazón en cualquier {esTienda ? "producto" : "auto"} para guardarlo acá.</p>
            <Link href={esTienda ? "/productos" : "/autos"} className="btn-rojo mt-5">{esTienda ? "Ver productos" : "Ver autos"}</Link>
          </div>
        )}
        {noDisponibles > 0 && (
          <p className="mt-4 text-[15px] text-stone-500">
            {esTienda
              ? `${noDisponibles === 1 ? "Un producto que guardaste ya no está disponible" : `${noDisponibles} productos que guardaste ya no están disponibles`}.`
              : `${noDisponibles === 1 ? "Un auto que guardaste ya se vendió" : `${noDisponibles} autos que guardaste ya se vendieron`} o no está disponible.`}
          </p>
        )}
      </section>

      {esTienda && (
        <section className="mt-14">
          <h2 className="titulo text-[30px]">Mis pedidos</h2>
          {misPedidos.length === 0 ? (
            <p className="mt-3 text-stone-600">Cuando hagas un pedido con este email, lo vas a ver acá.</p>
          ) : (
            <ul className="mt-4 divide-y divide-linea border-y border-linea">
              {misPedidos.map((p) => (
                <li key={p.id}>
                  <Link href={`/pedido/${p.id}?t=${p.token}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-papel">
                    <span><b>#{p.numero}</b> · {new Date(p.fecha).toLocaleDateString("es-AR")} · {p.items.reduce((s, i) => s + i.cantidad, 0)} productos</span>
                    <span className="flex items-center gap-3">
                      <span className="rounded-sm bg-papel px-2 py-0.5 text-sm font-semibold">{ESTADO_PEDIDO_TEXTO[p.estado]}</span>
                      <b>$ {formatNumero(p.total)}</b>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="mt-14 max-w-xl">
        <h2 className="titulo text-[30px]">Mis datos</h2>
        <p className="mt-1 text-stone-600">Ingresás con <b className="text-tinta">{cliente.email}</b>.</p>
        <PerfilForm inicial={{ nombre: cliente.nombre, telefono: cliente.telefono, ciudad: cliente.ciudad, aceptaMails: cliente.aceptaMails }} />
      </section>
    </div>
  );
}
