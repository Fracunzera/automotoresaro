"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { actualizarPedidoAccion } from "@/app/admin/acciones-tienda";
import { normalizarWhatsapp, telLink } from "@/lib/agencia-tipos";
import { ESTADO_PEDIDO_TEXTO, FORMA_PAGO_TEXTO, type EstadoPedido, type Pedido } from "@/lib/productos-tipos";
import { formatNumero, whatsappLink } from "@/lib/utils";
import { Confirmar } from "./Confirmar";

const pesos = (n: number) => `$ ${formatNumero(n)}`;
const cuando = (iso: string) => new Date(iso).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** El siguiente paso lógico de cada pedido, para mostrar un solo botón grande. */
function siguiente(p: Pedido): { estado: EstadoPedido; texto: string } | null {
  if (p.estado === "nuevo") return { estado: "preparando", texto: "Empezar a prepararlo" };
  if (p.estado === "preparando") return p.entrega === "domicilio" ? { estado: "enviado", texto: "Ya lo envié" } : { estado: "listo", texto: "Está listo para retirar" };
  if (p.estado === "listo" || p.estado === "enviado") return { estado: "entregado", texto: "Ya lo entregué" };
  return null;
}

function Tarjeta({ p, tienda, esAdmin }: { p: Pedido; tienda: string; esAdmin: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [cancelar, setCancelar] = useState(false);
  const [notas, setNotas] = useState(p.notas);
  const [cargando, start] = useTransition();
  const sig = siguiente(p);
  const wa = normalizarWhatsapp(p.cliente.telefono);
  const aviso: Record<string, string> = {
    preparando: `Hola ${p.cliente.nombre.split(" ")[0]}, ya estamos preparando tu pedido #${p.numero} de ${tienda}.`,
    listo: `Hola ${p.cliente.nombre.split(" ")[0]}, tu pedido #${p.numero} ya está listo para retirar en ${tienda}.`,
    enviado: `Hola ${p.cliente.nombre.split(" ")[0]}, tu pedido #${p.numero} de ${tienda} ya salió para tu casa.`,
  };

  const correr = (d: Parameters<typeof actualizarPedidoAccion>[1]) =>
    start(async () => {
      const r = await actualizarPedidoAccion(p.id, d);
      setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
      if (r.ok) router.refresh();
    });

  return (
    <li className="tarjeta-g overflow-hidden">
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xl font-bold">Pedido #{p.numero}</p>
          <span className="text-base text-stone-500">{cuando(p.fecha)}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-sm bg-tinta px-2.5 py-1 text-base font-bold text-white">{ESTADO_PEDIDO_TEXTO[p.estado]}</span>
          <span className={`rounded-sm px-2.5 py-1 text-base font-bold ${p.estadoPago === "pagado" ? "bg-[#e7f4ec] text-[#17733c]" : p.estadoPago === "rechazado" ? "bg-rojo-claro text-rojo-oscuro" : "bg-[#fff1cc] text-[#7a5300]"}`}>
            {p.estadoPago === "pagado" ? "Pagado" : p.estadoPago === "rechazado" ? "Pago rechazado" : "Falta cobrar"}
          </span>
        </div>
        <ul className="mt-3 space-y-1 text-lg">
          {p.items.map((i) => (
            <li key={`${i.productoId}-${i.variante}`} className="flex justify-between gap-3">
              <span><b>{i.cantidad} ×</b> {i.nombre}{i.variante && <span className="font-semibold"> ({i.variante})</span>}</span>
              <span className="whitespace-nowrap">{pesos(i.precio * i.cantidad)}</span>
            </li>
          ))}
          {p.envio > 0 && <li className="flex justify-between text-stone-600"><span>Envío</span><span>{pesos(p.envio)}</span></li>}
          <li className="flex justify-between border-t-2 border-linea pt-1 text-xl font-bold"><span>Total</span><span>{pesos(p.total)}</span></li>
        </ul>
        <div className="mt-3 space-y-0.5 text-lg">
          <p><b>{p.cliente.nombre}</b> · {p.cliente.telefono}</p>
          {p.cliente.email && <p className="break-all text-stone-600">{p.cliente.email}</p>}
          <p>{p.entrega === "domicilio" ? <>Envío a: <b>{p.direccion}</b></> : <b>Retira en el local</b>}</p>
          <p>Paga con: <b>{FORMA_PAGO_TEXTO[p.pago]}</b></p>
          {p.notasCliente && <p className="mt-1 rounded-md bg-papel p-2">“{p.notasCliente}”</p>}
          {p.atendidoPor && <p className="text-base text-stone-500">Lo atiende {p.atendidoPor}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t-2 border-linea p-3">
        <a href={whatsappLink(wa, aviso[sig?.estado ?? ""] ?? `Hola ${p.cliente.nombre.split(" ")[0]}, te escribo de ${tienda} por tu pedido #${p.numero}.`)} target="_blank" rel="noopener noreferrer" className="btn-g bg-[#1faa53] text-white hover:bg-[#188f45]">WhatsApp</a>
        <a href={telLink(p.cliente.telefono)} className="btn-g border-2 border-tinta bg-white hover:bg-papel">Llamar</a>
      </div>

      {p.estado !== "cancelado" && (
        <div className="space-y-2 border-t-2 border-linea bg-papel p-3">
          {sig && <button disabled={cargando} onClick={() => correr({ estado: sig.estado })} className="btn-g w-full bg-tinta text-white hover:bg-tinta-2">{sig.texto}</button>}
          {p.estadoPago !== "pagado" && (
            <button disabled={cargando} onClick={() => correr({ estadoPago: "pagado" })} className="btn-g w-full bg-[#17733c] text-white hover:bg-[#125e31]">Ya me pagó</button>
          )}
          <details>
            <summary className="cursor-pointer list-none py-2 text-center text-lg font-semibold text-stone-600">Notas y más opciones</summary>
            <div className="space-y-2 pt-2">
              <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} className="campo-g h-auto! py-3" placeholder="Notas internas (el cliente no las ve)" aria-label="Notas internas" />
              <button disabled={cargando || notas === p.notas} onClick={() => correr({ notas })} className="btn-g w-full border-2 border-stone-300 bg-white">Guardar nota</button>
              {esAdmin && (
                <button disabled={cargando} onClick={() => setCancelar(true)} className="btn-g w-full border-2 border-stone-300 bg-white text-rojo-oscuro hover:border-rojo">Cancelar pedido</button>
              )}
            </div>
          </details>
        </div>
      )}
      {msg && <p role="status" className={`border-t-2 border-linea p-3 text-lg font-semibold ${msg.ok ? "text-[#17733c]" : "text-rojo-oscuro"}`}>{msg.ok ? "✓ " : ""}{msg.t}</p>}

      {cancelar && (
        <Confirmar
          titulo={`¿Cancelar el pedido #${p.numero}?`}
          texto={`Los productos vuelven al stock. ${p.estadoPago === "pagado" ? "Ojo: figura como pagado, acordate de devolverle la plata." : ""}`}
          confirmar="Sí, cancelarlo"
          peligro
          cargando={cargando}
          onCancelar={() => setCancelar(false)}
          onConfirmar={() => { setCancelar(false); correr({ estado: "cancelado" }); }}
        />
      )}
    </li>
  );
}

export function ListaPedidos({ pedidos, tienda, esAdmin }: { pedidos: Pedido[]; tienda: string; esAdmin: boolean }) {
  return (
    <ul className="mt-5 space-y-4">
      {pedidos.map((p) => <Tarjeta key={`${p.id}-${p.actualizado}`} p={p} tienda={tienda} esAdmin={esAdmin} />)}
    </ul>
  );
}
