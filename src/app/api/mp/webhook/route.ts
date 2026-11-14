import { NextResponse } from "next/server";
import { obtenerPagoMP } from "@/lib/mercadopago";
import { actualizarPedido, getPedido } from "@/lib/pedidos";

/**
 * Aviso de Mercado Pago cuando cambia un pago. No se confía en lo que llega:
 * se consulta el pago a Mercado Pago con nuestro token y se verifica el monto.
 */
export async function POST(req: Request) {
  if (!process.env.MP_ACCESS_TOKEN) return NextResponse.json({ ok: true });
  const url = new URL(req.url);
  const cuerpo = (await req.json().catch(() => ({}))) as { type?: string; topic?: string; data?: { id?: string | number } };
  const tipo = cuerpo.type ?? cuerpo.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = String(cuerpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (tipo !== "payment" || !id) return NextResponse.json({ ok: true });

  const pago = await obtenerPagoMP(id);
  if (!pago?.pedidoId) return NextResponse.json({ ok: true });
  const pedido = await getPedido(pago.pedidoId);
  if (!pedido) return NextResponse.json({ ok: true });

  if (pago.estado === "approved" && pago.monto + 0.01 >= pedido.total) {
    if (pedido.estadoPago !== "pagado") await actualizarPedido(pedido.id, { estadoPago: "pagado", mpPagoId: id });
  } else if ((pago.estado === "rejected" || pago.estado === "cancelled") && pedido.estadoPago === "pendiente") {
    await actualizarPedido(pedido.id, { estadoPago: "rechazado", mpPagoId: id });
  }
  return NextResponse.json({ ok: true });
}
