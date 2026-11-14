"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { crearPedidoAccion } from "@/app/(sitio)/finalizar/acciones";
import { FORMA_PAGO_TEXTO, costoEnvio, type ConfigTienda, type FormaEntrega, type FormaPago, type Producto } from "@/lib/productos-tipos";
import { formatNumero } from "@/lib/utils";
import { useAgencia } from "../AgenciaContext";
import { useCarrito } from "./CarritoContext";
import { useLineas } from "./Carrito";

const pesos = (n: number) => `$ ${formatNumero(n)}`;

export function Checkout({
  productos, config, mp, datosCliente,
}: { productos: Producto[]; config: ConfigTienda; mp: boolean; datosCliente: { nombre: string; telefono: string; email: string } | null }) {
  const ag = useAgencia();
  const { vaciar, items } = useCarrito();
  const lineas = useLineas(productos);
  const [d, setD] = useState({ nombre: "", telefono: "", email: "", direccion: "", notas: "", ...datosCliente });
  const entregas = (["retiro", "domicilio"] as FormaEntrega[]).filter((e) => (e === "retiro" ? config.retiro.activo : config.domicilio.activo));
  const pagos = (["mercadopago", "transferencia", "efectivo"] as FormaPago[]).filter((p) =>
    p === "mercadopago" ? mp : p === "transferencia" ? config.pagos.transferencia.activo : config.pagos.efectivo,
  );
  const [entrega, setEntrega] = useState<FormaEntrega>(entregas[0] ?? "retiro");
  const [pago, setPago] = useState<FormaPago>(pagos[0] ?? "efectivo");
  const [error, setError] = useState("");
  const [enviando, start] = useTransition();
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (datosCliente) setD((p) => ({ ...p, ...datosCliente }));
  }, [datosCliente]);

  const subtotal = lineas.reduce((s, l) => s + l.subtotal, 0);
  const envio = costoEnvio(config, entrega, subtotal);

  if (!listo && items.length === 0) {
    return (
      <div className="mt-6 rounded-lg bg-papel px-6 py-12 text-center">
        <p className="titulo text-2xl">Tu carrito está vacío</p>
        <Link href="/productos" className="btn-rojo mt-5">Ver productos</Link>
      </div>
    );
  }

  const opcion = (activo: boolean) =>
    `flex w-full cursor-pointer items-start gap-3 rounded-md border p-4 text-left ${activo ? "border-tinta bg-papel" : "border-stone-300 bg-white hover:border-tinta"}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        start(async () => {
          const r = await crearPedidoAccion({ items, ...d, entrega, pago });
          if (!r.ok) return setError(r.error);
          setListo(true);
          vaciar();
          window.location.assign(r.ir);
        });
      }}
      className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]"
    >
      <div className="space-y-8">
        <section>
          <h2 className="titulo text-[26px]">1. Tus datos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nombre" className="etiqueta">Nombre y apellido</label>
              <input id="nombre" required autoComplete="name" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} className="campo" />
            </div>
            <div>
              <label htmlFor="telefono" className="etiqueta">Teléfono / WhatsApp</label>
              <input id="telefono" type="tel" required autoComplete="tel" value={d.telefono} onChange={(e) => setD({ ...d, telefono: e.target.value })} className="campo" />
            </div>
            <div>
              <label htmlFor="email" className="etiqueta">Email {pago !== "mercadopago" && <span className="font-normal text-stone-400">(para recibir el detalle)</span>}</label>
              <input id="email" type="email" required={pago === "mercadopago"} autoComplete="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} className="campo" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="titulo text-[26px]">2. Entrega</h2>
          <div className="mt-4 space-y-2" role="radiogroup">
            {entregas.map((e) => (
              <label key={e} className={opcion(entrega === e)}>
                <input type="radio" name="entrega" checked={entrega === e} onChange={() => setEntrega(e)} className="mt-1 size-4 accent-rojo" />
                <span className="flex-1">
                  <span className="flex justify-between gap-3 font-semibold">
                    {e === "retiro" ? "Retiro en el local" : "Envío a domicilio"}
                    <span>{e === "retiro" ? "Gratis" : costoEnvio(config, "domicilio", subtotal) ? pesos(costoEnvio(config, "domicilio", subtotal)) : "Gratis"}</span>
                  </span>
                  <span className="block text-sm text-stone-600">{e === "retiro" ? `${ag.direccion}, ${ag.ciudad}. ${config.retiro.texto}` : config.domicilio.texto}</span>
                </span>
              </label>
            ))}
          </div>
          {entrega === "domicilio" && (
            <div className="mt-4">
              <label htmlFor="direccion" className="etiqueta">Dirección de entrega</label>
              <input id="direccion" required autoComplete="street-address" value={d.direccion} onChange={(e) => setD({ ...d, direccion: e.target.value })} className="campo" placeholder="Calle, número, piso/depto y barrio" />
            </div>
          )}
        </section>

        <section>
          <h2 className="titulo text-[26px]">3. Pago</h2>
          <div className="mt-4 space-y-2" role="radiogroup">
            {pagos.map((p) => (
              <label key={p} className={opcion(pago === p)}>
                <input type="radio" name="pago" checked={pago === p} onChange={() => setPago(p)} className="mt-1 size-4 accent-rojo" />
                <span>
                  <span className="block font-semibold">{FORMA_PAGO_TEXTO[p]}</span>
                  <span className="block text-sm text-stone-600">
                    {p === "mercadopago" && "Tarjeta de crédito, débito o dinero en cuenta. Te llevamos a Mercado Pago para pagar."}
                    {p === "transferencia" && "Al confirmar te mostramos el alias/CBU. Mandanos el comprobante por WhatsApp."}
                    {p === "efectivo" && "Pagás al retirar o cuando lo recibís."}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4">
            <label htmlFor="notas" className="etiqueta">Aclaraciones <span className="font-normal text-stone-400">(opcional)</span></label>
            <textarea id="notas" rows={2} value={d.notas} onChange={(e) => setD({ ...d, notas: e.target.value })} className="campo h-auto! py-2.5" placeholder="Horario para recibir, es para regalo, etc." />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-lg bg-papel p-5 lg:sticky lg:top-[120px]">
        <h2 className="titulo text-[24px]">Resumen</h2>
        <ul className="mt-3 space-y-2 text-[15px]">
          {lineas.map(({ it, p, subtotal: st }) => (
            <li key={`${it.productoId}-${it.variante}`} className="flex justify-between gap-3">
              <span>{it.cantidad} × {p.nombre}{it.variante ? ` (${it.variante})` : ""}</span>
              <span className="whitespace-nowrap">{pesos(st)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-linea pt-3">
          <div className="flex justify-between"><span>Subtotal</span><span>{pesos(subtotal)}</span></div>
          <div className="flex justify-between"><span>Envío</span><span>{envio ? pesos(envio) : "Gratis"}</span></div>
          <div className="flex justify-between pt-1 text-xl font-bold"><span>Total</span><span>{pesos(subtotal + envio)}</span></div>
        </div>
        {error && <p role="alert" className="mt-4 rounded-md bg-rojo-claro p-3 text-sm font-semibold text-rojo-oscuro">{error}</p>}
        <button disabled={enviando || listo} className="btn-rojo mt-4 w-full">
          {enviando || listo ? "Procesando…" : pago === "mercadopago" ? "Ir a pagar" : "Confirmar pedido"}
        </button>
        <p className="mt-3 text-xs text-stone-500">Al confirmar aceptás la <Link href="/privacidad" className="underline">política de privacidad</Link>.</p>
      </aside>
    </form>
  );
}
