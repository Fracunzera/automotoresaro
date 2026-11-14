/**
 * Lectura y modificación de los autos. Solo se usa en el servidor.
 */
import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { autosEjemplo } from "@/data/ejemplos";
import { borrarFotos, guardarLista, leerLista } from "./almacen";
import type { Auto, DatosAuto, Estado } from "./tipos";

const TAG = "autos";

/** Todos los autos (incluye vendidos y ocultos). Cacheado hasta el próximo cambio. */
export const getTodos = unstable_cache(async (): Promise<Auto[]> => (await leerLista()) ?? autosEjemplo, ["autos-todos"], {
  tags: [TAG],
});

/** Los que se ven en la página: en venta y reservados. */
export async function getPublicos(): Promise<Auto[]> {
  return (await getTodos()).filter((a) => a.estado === "publicado" || a.estado === "reservado");
}

export async function getPorSlug(slug: string): Promise<Auto | undefined> {
  return (await getPublicos()).find((a) => a.slug === slug);
}

export async function getPorId(id: string): Promise<Auto | undefined> {
  return (await getTodos()).find((a) => a.id === id);
}

export function tituloAuto(a: Pick<Auto, "marca" | "modelo" | "version">): string {
  return `${a.marca} ${a.modelo} ${a.version}`.trim();
}

/* ───────────── Cambios (panel) ───────────── */

const aSlug = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function guardarYRefrescar(lista: Auto[]) {
  await guardarLista(lista);
  revalidateTag(TAG);
  revalidatePath("/", "layout");
}

async function listaActual(): Promise<Auto[]> {
  // Se lee directo (sin caché) para no pisar cambios recientes
  return (await leerLista()) ?? autosEjemplo;
}

export async function crearAuto(datos: DatosAuto, estado: Estado): Promise<Auto> {
  const lista = await listaActual();
  const id = randomUUID();
  const ahora = new Date().toISOString();
  const auto: Auto = {
    ...datos,
    id,
    slug: `${aSlug(`${datos.marca} ${datos.modelo} ${datos.anio}`)}-${id.slice(0, 5)}`,
    estado,
    creado: ahora,
    actualizado: ahora,
  };
  await guardarYRefrescar([auto, ...lista]);
  return auto;
}

export async function actualizarAuto(id: string, datos: DatosAuto): Promise<Auto> {
  const lista = await listaActual();
  const i = lista.findIndex((a) => a.id === id);
  if (i === -1) throw new Error("No encontramos ese auto. Puede que lo hayan borrado.");
  const anterior = lista[i];
  const auto: Auto = { ...anterior, ...datos, actualizado: new Date().toISOString() };
  lista[i] = auto;
  await guardarYRefrescar(lista);
  await borrarFotos(anterior.fotos.filter((f) => !auto.fotos.includes(f)));
  return auto;
}

export async function cambiarEstado(id: string, estado: Estado): Promise<Auto> {
  const lista = await listaActual();
  const auto = lista.find((a) => a.id === id);
  if (!auto) throw new Error("No encontramos ese auto. Puede que lo hayan borrado.");
  auto.estado = estado;
  auto.actualizado = new Date().toISOString();
  await guardarYRefrescar(lista);
  return auto;
}

export async function borrarAuto(id: string): Promise<void> {
  const lista = await listaActual();
  const auto = lista.find((a) => a.id === id);
  if (!auto) return;
  await guardarYRefrescar(lista.filter((a) => a.id !== id));
  await borrarFotos(auto.fotos);
}

export async function borrarEjemplos(): Promise<number> {
  const lista = await listaActual();
  const reales = lista.filter((a) => !a.ejemplo);
  await guardarYRefrescar(reales);
  return lista.length - reales.length;
}
