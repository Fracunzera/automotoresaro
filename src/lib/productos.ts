/** Productos de la tienda. Solo servidor. */
import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { productosEjemplo } from "@/data/ejemplos-tienda";
import { borrarFotos, guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";
import type { DatosProducto, ItemPedido, Producto } from "./productos-tipos";

const TAG = "productos";
const ARCHIVO = "productos";

const leer = async (): Promise<Producto[]> => (await leerPrivado<Producto[]>(ARCHIVO)) ?? productosEjemplo;

export const getProductosTodos = unstable_cache(leer, ["productos-todos"], { tags: [TAG] });

export async function getProductosPublicos(): Promise<Producto[]> {
  return (await getProductosTodos()).filter((p) => p.estado === "publicado");
}

export async function getProductoPorSlug(slug: string) {
  return (await getProductosPublicos()).find((p) => p.slug === slug);
}

export async function getProductoPorId(id: string) {
  return (await getProductosTodos()).find((p) => p.id === id);
}

/** Cambia la lista de a un cambio por vez y refresca la página. */
export function modificarProductos<T>(fn: (lista: Producto[]) => T | Promise<T>): Promise<T> {
  return conCandado(ARCHIVO, async () => {
    const lista = await leer();
    const r = await fn(lista);
    await guardarPrivado(lista, ARCHIVO);
    revalidateTag(TAG);
    revalidatePath("/", "layout");
    return r;
  });
}

const aSlug = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function crearProducto(d: DatosProducto): Promise<Producto> {
  return modificarProductos((lista) => {
    const id = randomUUID();
    const ahora = new Date().toISOString();
    const p: Producto = { ...d, id, slug: `${aSlug(d.nombre)}-${id.slice(0, 5)}`, creado: ahora, actualizado: ahora };
    lista.unshift(p);
    return p;
  });
}

export async function actualizarProducto(id: string, d: DatosProducto): Promise<Producto> {
  let fotosViejas: string[] = [];
  const p = await modificarProductos((lista) => {
    const x = lista.find((y) => y.id === id);
    if (!x) throw new Error("No encontramos ese producto. Puede que lo hayan borrado.");
    fotosViejas = x.fotos.filter((f) => !d.fotos.includes(f));
    Object.assign(x, d, { actualizado: new Date().toISOString() });
    return { ...x };
  });
  await borrarFotos(fotosViejas);
  return p;
}

export function cambiarEstadoProducto(id: string, estado: Producto["estado"]) {
  return modificarProductos((lista) => {
    const x = lista.find((y) => y.id === id);
    if (!x) throw new Error("No encontramos ese producto. Puede que lo hayan borrado.");
    x.estado = estado;
    x.actualizado = new Date().toISOString();
    return { ...x };
  });
}

/** Suma o resta stock a mano desde el panel (no baja de 0). */
export function ajustarStock(id: string, nuevo: number | null) {
  return modificarProductos((lista) => {
    const x = lista.find((y) => y.id === id);
    if (!x) throw new Error("No encontramos ese producto. Puede que lo hayan borrado.");
    x.stock = nuevo === null ? null : Math.max(0, Math.round(nuevo));
    x.actualizado = new Date().toISOString();
    return { ...x };
  });
}

/**
 * Descuenta el stock de un pedido. Si algún producto no alcanza, no descuenta nada
 * y devuelve cuáles faltan.
 */
export function descontarStock(items: Pick<ItemPedido, "productoId" | "cantidad" | "nombre">[]): Promise<string[]> {
  return modificarProductos((lista) => {
    const faltan: string[] = [];
    const pedido = new Map<string, number>();
    for (const it of items) pedido.set(it.productoId, (pedido.get(it.productoId) ?? 0) + it.cantidad);
    for (const [id, cant] of pedido) {
      const x = lista.find((y) => y.id === id);
      if (!x || x.estado !== "publicado") faltan.push(items.find((i) => i.productoId === id)?.nombre ?? "Un producto");
      else if (x.stock !== null && x.stock < cant) faltan.push(x.nombre);
    }
    if (faltan.length) return faltan;
    for (const [id, cant] of pedido) {
      const x = lista.find((y) => y.id === id)!;
      if (x.stock !== null) x.stock -= cant;
    }
    return [];
  });
}

/** Devuelve el stock de un pedido cancelado. */
export function devolverStock(items: Pick<ItemPedido, "productoId" | "cantidad">[]) {
  return modificarProductos((lista) => {
    for (const it of items) {
      const x = lista.find((y) => y.id === it.productoId);
      if (x && x.stock !== null) x.stock += it.cantidad;
    }
  });
}

export async function borrarProducto(id: string) {
  let fotos: string[] = [];
  await modificarProductos((lista) => {
    const i = lista.findIndex((y) => y.id === id);
    if (i >= 0) {
      fotos = lista[i].fotos;
      lista.splice(i, 1);
    }
  });
  await borrarFotos(fotos);
}

export function borrarProductosEjemplo(): Promise<number> {
  return modificarProductos((lista) => {
    const antes = lista.length;
    const reales = lista.filter((p) => !p.ejemplo);
    lista.splice(0, lista.length, ...reales);
    return antes - reales.length;
  });
}
