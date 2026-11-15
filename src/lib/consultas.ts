/**
 * Autos que los dueños cargan en "Vendé tu auto" para que la agencia los venda en consignación.
 * Quedan pendientes hasta que la agencia los revisa y los publica. Datos privados. Solo servidor.
 */
import { randomUUID } from "node:crypto";
import { borrarFotos, guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";

export const ESTADOS_CONSULTA = ["nueva", "contactado", "cotizado", "comprado", "descartada"] as const;
export type EstadoConsulta = (typeof ESTADOS_CONSULTA)[number];

export const ESTADO_CONSULTA_TEXTO: Record<EstadoConsulta, string> = {
  nueva: "Nueva",
  contactado: "Contactado",
  cotizado: "Acordando condiciones",
  comprado: "Publicado",
  descartada: "Descartada",
};

export interface Consulta {
  id: string;
  fecha: string;
  /** Siempre "venta" (se conserva por compatibilidad con datos anteriores). */
  modo: "venta" | "cambio";
  marca: string;
  modelo: string;
  version: string;
  anio: number;
  km: number;
  combustible: string;
  transmision: string;
  /** Estado general del auto según la persona. */
  condicion: string;
  choques: string;
  comentarios: string;
  nombre: string;
  telefono: string;
  email: string;
  zona: string;
  /** Fotos que subió el dueño. */
  fotos: string[];
  /** Precio que pretende el dueño (0 = no sabe, pide asesoramiento). */
  precioPretendido: number;
  /** Cuenta del dueño en la página, si estaba conectado. */
  clienteId?: string;
  /** Auto publicado a partir de esta solicitud. */
  autoId?: string;
  /* Seguimiento de la agencia */
  estado: EstadoConsulta;
  oferta: number;
  notas: string;
  atendidoPor?: string;
  actualizado: string;
}

const ARCHIVO = "consultas";
const MAXIMO = 1000;

export async function leerConsultas(): Promise<Consulta[]> {
  return (await leerPrivado<Consulta[]>(ARCHIVO)) ?? [];
}

export async function getConsulta(id: string): Promise<Consulta | undefined> {
  return (await leerConsultas()).find((c) => c.id === id);
}

function modificar<T>(fn: (lista: Consulta[]) => T): Promise<T> {
  return conCandado(ARCHIVO, async () => {
    const lista = await leerConsultas();
    const r = fn(lista);
    await guardarPrivado(lista.slice(0, MAXIMO), ARCHIVO);
    return r;
  });
}

export type DatosConsulta = Omit<Consulta, "id" | "fecha" | "estado" | "oferta" | "notas" | "atendidoPor" | "actualizado" | "autoId">;

export function crearConsulta(d: DatosConsulta): Promise<Consulta> {
  return modificar((lista) => {
    const ahora = new Date().toISOString();
    const c: Consulta = { ...d, id: randomUUID(), fecha: ahora, estado: "nueva", oferta: 0, notas: "", actualizado: ahora };
    lista.unshift(c);
    return c;
  });
}

export function actualizarSeguimiento(
  id: string,
  d: { estado: EstadoConsulta; oferta: number; notas: string },
  quien: string,
): Promise<Consulta> {
  return modificar((lista) => {
    const c = lista.find((x) => x.id === id);
    if (!c) throw new Error("No encontramos esa consulta. Puede que la hayan borrado.");
    Object.assign(c, d, { atendidoPor: quien, actualizado: new Date().toISOString() });
    return { ...c };
  });
}

/** Marca la solicitud como publicada y la vincula al auto creado. */
export function marcarPublicada(id: string, autoId: string, quien: string) {
  return modificar((lista) => {
    const c = lista.find((x) => x.id === id);
    if (!c) return;
    Object.assign(c, { estado: "comprado", autoId, atendidoPor: quien, actualizado: new Date().toISOString() });
  });
}

export async function borrarConsulta(id: string): Promise<void> {
  let fotos: string[] = [];
  await modificar((lista) => {
    const i = lista.findIndex((x) => x.id === id);
    if (i >= 0) {
      // Las fotos se borran solo si no se usaron para publicar el auto
      if (!lista[i].autoId) fotos = lista[i].fotos ?? [];
      lista.splice(i, 1);
    }
  });
  await borrarFotos(fotos);
}

/** Solicitudes de un dueño (por su cuenta o por su email). */
export async function consultasDe(clienteId: string, email: string) {
  return (await leerConsultas()).filter((c) => c.clienteId === clienteId || (email && c.email === email));
}

export async function contarNuevas(): Promise<number> {
  return (await leerConsultas()).filter((c) => c.estado === "nueva").length;
}
