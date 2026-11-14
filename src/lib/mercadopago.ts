/**
 * Cobro con Mercado Pago (Checkout Pro). Solo servidor.
 * Variable: MP_ACCESS_TOKEN (Mercado Pago → Tus integraciones → Credenciales de producción → Access Token).
 * El comprador paga en Mercado Pago y vuelve a la página del pedido; el aviso de pago llega a /api/mp/webhook.
 */
import { urlSitio } from "./mail";
import type { Pedido } from "./productos-tipos";

const API = "https://api.mercadopago.com";
const token = () => process.env.MP_ACCESS_TOKEN ?? "";

/** Crea la "preferencia" de pago y devuelve el link para pagar. */
export async function crearPagoMP(p: Pedido, nombreTienda: string): Promise<string> {
  const vuelta = `${urlSitio()}/pedido/${p.id}?t=${p.token}`;
  const res = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", "X-Idempotency-Key": p.id },
    body: JSON.stringify({
      items: [
        ...p.items.map((i) => ({
          id: i.productoId,
          title: `${i.nombre}${i.variante ? ` (${i.variante})` : ""}`.slice(0, 250),
          quantity: i.cantidad,
          unit_price: i.precio,
          currency_id: "ARS",
        })),
        ...(p.envio > 0 ? [{ id: "envio", title: "Envío a domicilio", quantity: 1, unit_price: p.envio, currency_id: "ARS" }] : []),
      ],
      payer: { name: p.cliente.nombre, email: p.cliente.email || undefined },
      external_reference: p.id,
      statement_descriptor: nombreTienda.slice(0, 22),
      back_urls: { success: `${vuelta}&mp=ok`, pending: `${vuelta}&mp=pendiente`, failure: `${vuelta}&mp=error` },
      auto_return: "approved",
      notification_url: `${urlSitio()}/api/mp/webhook`,
    }),
  });
  if (!res.ok) throw new Error(`Mercado Pago respondió ${res.status}: ${await res.text()}`);
  const d = (await res.json()) as { init_point?: string };
  if (!d.init_point) throw new Error("Mercado Pago no devolvió el link de pago");
  return d.init_point;
}

/** Consulta un pago (para confirmar el aviso que llega al webhook). */
export async function obtenerPagoMP(id: string): Promise<{ estado: string; pedidoId: string; monto: number } | null> {
  const res = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!res.ok) return null;
  const d = (await res.json()) as { status?: string; external_reference?: string; transaction_amount?: number };
  return { estado: d.status ?? "", pedidoId: d.external_reference ?? "", monto: d.transaction_amount ?? 0 };
}
