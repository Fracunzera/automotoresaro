import Link from "next/link";
import { leerClientes } from "@/lib/clientes";
import { leerPedidos } from "@/lib/pedidos";
import { getProductosTodos } from "@/lib/productos";
import { formatNumero } from "@/lib/utils";
import { BotonBorrarEjemplosTienda } from "./BotonBorrarEjemplosTienda";

const pesos = (n: number) => `$ ${formatNumero(n)}`;
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function Dato({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="tarjeta-g p-5">
      <p className="text-base font-semibold text-stone-600">{titulo}</p>
      <p className="mt-1 break-words font-display text-[36px] font-bold leading-none tracking-tight sm:text-[40px]">{valor}</p>
      {detalle && <p className="mt-2 text-base text-stone-600">{detalle}</p>}
    </div>
  );
}

export async function TableroTienda({ esAdmin, sinPermiso }: { esAdmin: boolean; sinPermiso: boolean }) {
  const [pedidos, productos, clientes] = await Promise.all([leerPedidos(), getProductosTodos(), leerClientes()]);
  const hoy = new Date();
  const delMes = (offset: number) => {
    const ref = new Date(hoy.getFullYear(), hoy.getMonth() - offset, 1);
    return pedidos.filter((p) => {
      const f = new Date(p.fecha);
      return p.estado !== "cancelado" && f.getFullYear() === ref.getFullYear() && f.getMonth() === ref.getMonth();
    });
  };
  const esteMes = delMes(0);
  const mesPasado = delMes(1);
  const vendidoMes = esteMes.reduce((s, p) => s + p.total, 0);
  const nuevos = pedidos.filter((p) => p.estado === "nuevo");
  const porCobrar = pedidos.filter((p) => p.estado !== "cancelado" && p.estadoPago !== "pagado");
  const enCurso = pedidos.filter((p) => ["preparando", "listo", "enviado"].includes(p.estado));

  const aLaVenta = productos.filter((p) => p.estado === "publicado" && p.stock !== 0);
  const sinStock = productos.filter((p) => p.estado === "publicado" && p.stock === 0);
  const pocoStock = productos.filter((p) => p.estado === "publicado" && p.stock !== null && p.stock > 0 && p.stock <= 3);
  const hayEjemplos = productos.some((p) => p.ejemplo);

  const unidades = new Map<string, { nombre: string; n: number }>();
  for (const p of esteMes) for (const i of p.items) unidades.set(i.productoId, { nombre: i.nombre, n: (unidades.get(i.productoId)?.n ?? 0) + i.cantidad });
  const masVendidos = Array.from(unidades.entries()).sort((a, b) => b[1].n - a[1].n).slice(0, 5);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Resumen</h1>
        <p className="mt-1 text-lg text-stone-600">Así está la tienda hoy, {hoy.getDate()} de {MESES[hoy.getMonth()]}.</p>
      </div>

      {sinPermiso && <p role="alert" className="rounded-lg border-2 border-rojo bg-rojo-claro p-4 text-lg font-semibold text-rojo-oscuro">Esa sección es solo para administradores.</p>}

      {nuevos.length > 0 && (
        <Link href="/admin/pedidos" className="block rounded-lg bg-rojo p-5 text-white transition-colors hover:bg-rojo-oscuro">
          <p className="text-2xl font-bold">{nuevos.length === 1 ? "Tenés 1 pedido nuevo" : `Tenés ${nuevos.length} pedidos nuevos`}</p>
          <p className="mt-1 text-lg">Tocá acá para verlos y prepararlos →</p>
        </Link>
      )}

      {esAdmin && hayEjemplos && (
        <div className="rounded-lg border-2 border-[#e6c35c] bg-[#fff8e1] p-5">
          <p className="text-lg font-bold">La tienda todavía muestra productos de ejemplo</p>
          <p className="mt-1 text-lg text-stone-700">Son inventados para que se vea cómo queda. Cuando cargues los tuyos, borralos con este botón.</p>
          <BotonBorrarEjemplosTienda />
        </div>
      )}

      <section>
        <h2 className="text-xl font-bold">¿Qué querés hacer?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/productos/nuevo" className="btn-g justify-start bg-rojo text-white hover:bg-rojo-oscuro">+ Cargar un producto</Link>
          <Link href="/admin/pedidos" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Ver pedidos</Link>
          <Link href="/admin/productos" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Productos y stock</Link>
          {esAdmin && <Link href="/admin/tienda" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Envíos y pagos</Link>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">Pedidos</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Dato titulo="Nuevos" valor={String(nuevos.length)} />
          <Dato titulo="En preparación o enviados" valor={String(enCurso.length)} />
          <div className="col-span-2 sm:col-span-1">
            <Dato titulo="Falta cobrar" valor={esAdmin ? pesos(porCobrar.reduce((s, p) => s + p.total, 0)) : String(porCobrar.length)} detalle={esAdmin ? `${porCobrar.length} pedido${porCobrar.length === 1 ? "" : "s"}` : "pedidos"} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">Ventas de {MESES[hoy.getMonth()]}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Dato titulo="Pedidos" valor={String(esteMes.length)} detalle={`El mes pasado: ${mesPasado.length}`} />
          {esAdmin && <Dato titulo="Total vendido" valor={pesos(vendidoMes)} detalle={`El mes pasado: ${pesos(mesPasado.reduce((s, p) => s + p.total, 0))}`} />}
          {esAdmin && <Dato titulo="Ticket promedio" valor={pesos(esteMes.length ? vendidoMes / esteMes.length : 0)} />}
        </div>
        {masVendidos.length > 0 && (
          <div className="tarjeta-g mt-3 divide-y-2 divide-linea">
            <p className="px-5 py-3 text-base font-semibold text-stone-600">Los más vendidos del mes</p>
            {masVendidos.map(([id, x]) => (
              <Link key={id} href={`/admin/productos/${id}`} className="flex justify-between gap-4 px-5 py-3 text-lg hover:bg-papel">
                <span className="font-semibold">{x.nombre}</span>
                <span>{x.n} u.</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold">Productos</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Dato titulo="A la venta" valor={String(aLaVenta.length)} />
          <Dato titulo="Sin stock" valor={String(sinStock.length)} />
          <div className="col-span-2 sm:col-span-1"><Dato titulo="Clientes registrados" valor={String(clientes.length)} detalle={`${clientes.filter((c) => c.aceptaMails).length} aceptan mails`} /></div>
        </div>
        {(sinStock.length > 0 || pocoStock.length > 0) && (
          <div className="tarjeta-g mt-3 p-5">
            <p className="text-lg font-bold">Para reponer</p>
            <ul className="mt-2 space-y-2">
              {[...sinStock, ...pocoStock].slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/productos/${p.id}`} className="text-lg font-semibold text-rojo underline underline-offset-4">
                    {p.nombre} · {p.stock === 0 ? "sin stock" : `quedan ${p.stock}`} → Editar
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
