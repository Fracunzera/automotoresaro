import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgencia } from "@/lib/agencia";
import { getPedido } from "@/lib/pedidos";
import { ESTADO_PEDIDO_TEXTO, FORMA_PAGO_TEXTO, type EstadoPedido } from "@/lib/productos-tipos";
import { esTienda } from "@/lib/rubro";
import { getConfigTienda } from "@/lib/tienda";
import { formatNumero, whatsappLink } from "@/lib/utils";
import { iguales } from "@/lib/sesion";
import { WhatsAppIcon } from "@/components/Icon";

export const metadata: Metadata = { title: "Tu pedido", robots: { index: false } };
export const dynamic = "force-dynamic";

const pesos = (n: number) => `$ ${formatNumero(n)}`;
const PASOS: EstadoPedido[] = ["nuevo", "preparando", "listo", "entregado"];

type P = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PedidoPage({ params, searchParams }: P) {
  if (!esTienda) notFound();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const p = await getPedido(id);
  // Solo lo ve quien tiene el link con la clave del pedido
  if (!p || typeof sp.t !== "string" || !iguales(sp.t, p.token)) notFound();
  const [ag, config] = await Promise.all([getAgencia(), getConfigTienda()]);
  const t = config.pagos.transferencia;
  const mp = typeof sp.mp === "string" ? sp.mp : "";
  const pasos = p.entrega === "domicilio" ? PASOS.map((x) => (x === "listo" ? "enviado" : x)) : PASOS;
  const actual = p.estado === "cancelado" ? -1 : Math.max(0, pasos.indexOf(p.estado === "listo" && p.entrega === "domicilio" ? "enviado" : p.estado));
  const comprobante = whatsappLink(ag.whatsapp, `Hola ${ag.nombre}, te mando el comprobante del pedido #${p.numero} (${pesos(p.total)}).`);
  const consulta = whatsappLink(ag.whatsapp, `Hola ${ag.nombre}, te escribo por mi pedido #${p.numero}.`);

  return (
    <div className="contenedor max-w-3xl pt-10">
      <p className="sobretitulo">Pedido #{p.numero}</p>
      <h1 className="titulo mt-2 text-[40px]">
        {p.estado === "cancelado" ? "Pedido cancelado" : p.estadoPago === "pagado" ? "¡Gracias por tu compra!" : "¡Recibimos tu pedido!"}
      </h1>

      {mp === "ok" && p.estadoPago !== "pagado" && <p className="mt-4 rounded-md bg-[#e7f4ec] p-4 font-semibold text-[#17733c]">Mercado Pago está confirmando tu pago. En unos minutos se actualiza acá.</p>}
      {mp === "pendiente" && <p className="mt-4 rounded-md bg-[#fff8e1] p-4 font-semibold">Tu pago quedó pendiente en Mercado Pago. Te avisamos cuando se acredite.</p>}
      {mp === "error" && p.estadoPago !== "pagado" && (
        <p className="mt-4 rounded-md bg-rojo-claro p-4 font-semibold text-rojo-oscuro">
          No se completó el pago con Mercado Pago. Tu pedido quedó guardado: escribinos y te pasamos otra forma de pago.
        </p>
      )}

      {p.estado !== "cancelado" && (
        <ol className="mt-8 grid grid-cols-4 gap-2">
          {pasos.map((x, i) => (
            <li key={x}>
              <div className={`h-1.5 rounded-full ${i <= actual ? "bg-rojo" : "bg-linea"}`} />
              <p className={`mt-2 text-[13px] font-semibold ${i <= actual ? "text-tinta" : "text-stone-400"}`}>{ESTADO_PEDIDO_TEXTO[x]}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 rounded-lg border border-linea p-5">
        <p className="flex justify-between gap-3 text-lg">
          <span>Pago: <b>{FORMA_PAGO_TEXTO[p.pago]}</b></span>
          <span className={`rounded-sm px-2 py-0.5 text-sm font-bold ${p.estadoPago === "pagado" ? "bg-[#e7f4ec] text-[#17733c]" : "bg-[#fff1cc] text-[#7a5300]"}`}>
            {p.estadoPago === "pagado" ? "Pagado" : p.estadoPago === "rechazado" ? "Rechazado" : "Pendiente"}
          </span>
        </p>
        {p.pago === "transferencia" && p.estadoPago !== "pagado" && p.estado !== "cancelado" && (
          <div className="mt-4 rounded-md bg-papel p-4">
            <p className="font-semibold">Transferí {pesos(p.total)} a:</p>
            {t.alias && <p className="mt-1 text-lg">Alias: <b className="select-all">{t.alias}</b></p>}
            {t.cbu && <p className="text-lg">CBU/CVU: <b className="select-all break-all">{t.cbu}</b></p>}
            {t.titular && <p className="text-stone-600">Titular: {t.titular}</p>}
            {!t.alias && !t.cbu && <p className="mt-1 text-stone-600">Te pasamos los datos por WhatsApp.</p>}
            <a href={comprobante} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-4 w-full"><WhatsAppIcon className="size-5" /> Mandar el comprobante</a>
          </div>
        )}
        <p className="mt-4 text-[15px] text-stone-700">
          {p.entrega === "domicilio" ? <>Envío a: <b>{p.direccion}</b></> : <>Retirás en: <b>{ag.direccion}, {ag.ciudad}</b> · {ag.horarios}</>}
        </p>
      </div>

      <ul className="mt-6 divide-y divide-linea border-y border-linea">
        {p.items.map((i) => (
          <li key={`${i.productoId}-${i.variante}`} className="flex justify-between gap-3 py-3">
            <span>{i.cantidad} × {i.nombre}{i.variante ? ` (${i.variante})` : ""}</span>
            <span className="whitespace-nowrap font-semibold">{pesos(i.precio * i.cantidad)}</span>
          </li>
        ))}
        <li className="flex justify-between py-3"><span>Envío</span><span>{p.envio ? pesos(p.envio) : "Gratis"}</span></li>
        <li className="flex justify-between py-3 text-xl font-bold"><span>Total</span><span>{pesos(p.total)}</span></li>
      </ul>

      <div className="mt-8 flex flex-wrap gap-2">
        <a href={consulta} target="_blank" rel="noopener noreferrer" className="btn-borde">Consultar por WhatsApp</a>
        <Link href="/productos" className="btn-borde">Seguir comprando</Link>
      </div>
      <p className="mt-4 text-sm text-stone-500">Guardá este link para ver cómo va tu pedido.</p>
    </div>
  );
}
