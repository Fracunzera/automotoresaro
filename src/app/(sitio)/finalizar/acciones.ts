"use server";

import { headers } from "next/headers";
import { getAgencia } from "@/lib/agencia";
import { emailValido, normalizarEmail } from "@/lib/clientes";
import { enviarMail, mailConfigurado, urlSitio } from "@/lib/mail";
import { crearPagoMP } from "@/lib/mercadopago";
import { crearPedido, actualizarPedido } from "@/lib/pedidos";
import { getProductosPublicos } from "@/lib/productos";
import { FORMA_PAGO_TEXTO, costoEnvio, type FormaEntrega, type FormaPago, type ItemPedido, type Pedido } from "@/lib/productos-tipos";
import { esTienda } from "@/lib/rubro";
import { getConfigTienda, mpDisponible } from "@/lib/tienda";
import { formatNumero } from "@/lib/utils";

type R = { ok: true; ir: string } | { ok: false; error: string };

const intentos = new Map<string, number[]>();
const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pesos = (n: number) => `$ ${formatNumero(n)}`;
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function crearPedidoAccion(d: {
  items: { productoId: string; variante: string; cantidad: number }[];
  nombre: string; telefono: string; email: string;
  entrega: FormaEntrega; direccion: string; pago: FormaPago; notas: string;
}): Promise<R> {
  if (!esTienda) return { ok: false, error: "No disponible." };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ahora = Date.now();
  const previos = (intentos.get(ip) ?? []).filter((t) => ahora - t < 60 * 60_000);
  if (previos.length >= 15) return { ok: false, error: "Hiciste muchos pedidos seguidos. Escribinos por WhatsApp y te ayudamos." };

  const [productos, config, ag] = await Promise.all([getProductosPublicos(), getConfigTienda(), getAgencia()]);

  // Datos del comprador
  const cliente = { nombre: texto(d.nombre, 80), telefono: texto(d.telefono, 40), email: normalizarEmail(texto(d.email, 120)) };
  if (!cliente.nombre) return { ok: false, error: "Escribí tu nombre." };
  if (cliente.telefono.replace(/\D/g, "").length < 8) return { ok: false, error: "Escribí un teléfono para avisarte del pedido." };
  if (cliente.email && !emailValido(cliente.email)) return { ok: false, error: "Revisá el email." };

  // Entrega y pago permitidos
  const entrega: FormaEntrega = d.entrega === "domicilio" ? "domicilio" : "retiro";
  if (entrega === "domicilio" && !config.domicilio.activo) return { ok: false, error: "Por ahora no hacemos envíos a domicilio." };
  if (entrega === "retiro" && !config.retiro.activo) return { ok: false, error: "Por ahora no hay retiro en el local." };
  const direccion = texto(d.direccion, 200);
  if (entrega === "domicilio" && direccion.length < 6) return { ok: false, error: "Escribí la dirección de entrega." };
  const pagosOk: Record<FormaPago, boolean> = {
    mercadopago: mpDisponible(config),
    transferencia: config.pagos.transferencia.activo,
    efectivo: config.pagos.efectivo,
  };
  if (!pagosOk[d.pago]) return { ok: false, error: "Elegí una forma de pago." };
  if (d.pago === "mercadopago" && !cliente.email) return { ok: false, error: "Para pagar con Mercado Pago necesitamos tu email." };

  // Productos: se toman precio y nombre del servidor, nunca del navegador
  const items: ItemPedido[] = [];
  for (const it of (Array.isArray(d.items) ? d.items : []).slice(0, 50)) {
    const p = productos.find((x) => x.id === it?.productoId);
    const cantidad = Math.floor(Number(it?.cantidad));
    if (!p || !(cantidad >= 1 && cantidad <= 99)) continue;
    const variante = texto(it.variante, 40);
    if (p.variantes.length > 0 && !p.variantes.includes(variante)) return { ok: false, error: `Elegí una opción válida para “${p.nombre}”.` };
    items.push({ productoId: p.id, nombre: p.nombre, variante: p.variantes.length ? variante : "", precio: p.precio, cantidad, foto: p.fotos[0] ?? "" });
  }
  if (items.length === 0) return { ok: false, error: "Tu carrito está vacío o los productos ya no están disponibles." };
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  if (config.compraMinima > 0 && subtotal < config.compraMinima) return { ok: false, error: `La compra mínima es de ${pesos(config.compraMinima)}.` };
  const envio = costoEnvio(config, entrega, subtotal);

  const r = await crearPedido({
    items, subtotal, envio, total: subtotal + envio, entrega, direccion: entrega === "domicilio" ? direccion : "",
    cliente, pago: d.pago, notasCliente: texto(d.notas, 500),
  });
  if ("faltan" in r) return { ok: false, error: `Ya no hay stock suficiente de: ${r.faltan.join(", ")}. Ajustá el carrito.` };
  previos.push(ahora);
  intentos.set(ip, previos);
  const pedido = r.pedido;

  avisarPedido(pedido, ag.nombre, config.pagos.transferencia).catch((e) => console.error("No se pudo avisar el pedido por mail", e));

  const verPedido = `/pedido/${pedido.id}?t=${pedido.token}`;
  if (pedido.pago === "mercadopago") {
    try {
      return { ok: true, ir: await crearPagoMP(pedido, ag.nombre) };
    } catch (e) {
      console.error(e);
      await actualizarPedido(pedido.id, { notas: "No se pudo generar el link de Mercado Pago." });
      return { ok: true, ir: `${verPedido}&mp=error` };
    }
  }
  return { ok: true, ir: verPedido };
}

/** Mail a la tienda (aviso de pedido nuevo) y al comprador (confirmación). */
async function avisarPedido(p: Pedido, tienda: string, transf: { alias: string; cbu: string; titular: string }) {
  if (!mailConfigurado()) return;
  const lineas = p.items.map((i) => `${i.cantidad} × ${i.nombre}${i.variante ? ` (${i.variante})` : ""} — ${pesos(i.precio * i.cantidad)}`);
  const resumen = [
    ...lineas,
    p.envio ? `Envío: ${pesos(p.envio)}` : "",
    `Total: ${pesos(p.total)}`,
    `Entrega: ${p.entrega === "domicilio" ? `a domicilio (${p.direccion})` : "retiro en el local"}`,
    `Pago: ${FORMA_PAGO_TEXTO[p.pago]}`,
  ].filter(Boolean);
  const html = (ls: string[]) => `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5">${ls.map((l) => `<p style="margin:0 0 6px">${esc(l)}</p>`).join("")}</div>`;

  if (process.env.ADMIN_EMAIL) {
    const ls = [`Pedido #${p.numero} de ${p.cliente.nombre} (${p.cliente.telefono}${p.cliente.email ? `, ${p.cliente.email}` : ""})`, ...resumen, `Verlo en el panel: ${urlSitio()}/admin/pedidos`];
    await enviarMail({ para: process.env.ADMIN_EMAIL, asunto: `Nuevo pedido #${p.numero} · ${pesos(p.total)}`, texto: ls.join("\n"), html: html(ls), nombreAgencia: tienda });
  }
  if (p.cliente.email) {
    const ls = [
      `¡Hola ${p.cliente.nombre.split(" ")[0]}! Recibimos tu pedido #${p.numero}.`,
      ...resumen,
      p.pago === "transferencia" && (transf.alias || transf.cbu)
        ? `Para pagar, transferí ${pesos(p.total)} a ${[transf.alias && `alias ${transf.alias}`, transf.cbu && `CBU ${transf.cbu}`].filter(Boolean).join(" / ")}${transf.titular ? ` (${transf.titular})` : ""} y mandanos el comprobante.`
        : "",
      `Seguí tu pedido acá: ${urlSitio()}/pedido/${p.id}?t=${p.token}`,
    ].filter(Boolean);
    await enviarMail({ para: p.cliente.email, asunto: `Tu pedido #${p.numero} en ${tienda}`, texto: ls.join("\n"), html: html(ls), nombreAgencia: tienda });
  }
}
