/** Pedidos de la tienda. Datos privados. Solo servidor. */
import { randomBytes, randomUUID } from "node:crypto";
import { guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";
import { descontarStock, devolverStock } from "./productos";
import type { EstadoPedido, Pedido } from "./productos-tipos";

const ARCHIVO = "pedidos";

export async function leerPedidos(): Promise<Pedido[]> {
  return (await leerPrivado<Pedido[]>(ARCHIVO)) ?? [];
}

export async function getPedido(id: string) {
  return (await leerPedidos()).find((p) => p.id === id);
}

function modificar<T>(fn: (lista: Pedido[]) => T | Promise<T>): Promise<T> {
  return conCandado(ARCHIVO, async () => {
    const lista = await leerPedidos();
    const r = await fn(lista);
    await guardarPrivado(lista, ARCHIVO);
    return r;
  });
}

export type NuevoPedido = Omit<Pedido, "id" | "numero" | "token" | "fecha" | "estado" | "estadoPago" | "notas" | "actualizado">;

/** Crea el pedido y descuenta el stock. Si falta stock devuelve qué productos faltan. */
export function crearPedido(d: NuevoPedido): Promise<{ pedido: Pedido } | { faltan: string[] }> {
  return modificar(async (lista) => {
    const faltan = await descontarStock(d.items);
    if (faltan.length) return { faltan };
    const ahora = new Date().toISOString();
    const pedido: Pedido = {
      ...d,
      id: randomUUID(),
      numero: lista.reduce((m, p) => Math.max(m, p.numero), 1000) + 1,
      token: randomBytes(12).toString("base64url"),
      fecha: ahora,
      estado: "nuevo",
      estadoPago: "pendiente",
      notas: "",
      actualizado: ahora,
    };
    lista.unshift(pedido);
    return { pedido };
  });
}

export function actualizarPedido(
  id: string,
  cambios: { estado?: EstadoPedido; estadoPago?: Pedido["estadoPago"]; notas?: string; mpPagoId?: string },
  quien?: string,
): Promise<Pedido> {
  let devolver: Pedido | null = null;
  return modificar((lista) => {
    const p = lista.find((x) => x.id === id);
    if (!p) throw new Error("No encontramos ese pedido.");
    // Al cancelar se devuelve el stock; si se "descancela" no se vuelve a descontar (se ajusta a mano)
    if (cambios.estado === "cancelado" && p.estado !== "cancelado") devolver = p;
    Object.assign(p, cambios, { actualizado: new Date().toISOString() }, quien ? { atendidoPor: quien } : {});
    return { ...p };
  }).then(async (p) => {
    if (devolver) await devolverStock(p.items);
    return p;
  });
}

export async function contarPedidosNuevos() {
  return (await leerPedidos()).filter((p) => p.estado === "nuevo").length;
}
