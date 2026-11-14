/**
 * Consultas de "Vendé tu auto": personas que quieren vender su auto o entregarlo como parte de pago.
 * Datos privados (teléfonos, emails). Solo servidor.
 */
import { randomUUID } from "node:crypto";
import { guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";

export const ESTADOS_CONSULTA = ["nueva", "contactado", "cotizado", "comprado", "descartada"] as const;
export type EstadoConsulta = (typeof ESTADOS_CONSULTA)[number];

export const ESTADO_CONSULTA_TEXTO: Record<EstadoConsulta, string> = {
  nueva: "Nueva",
  contactado: "Contactado",
  cotizado: "Le pasé precio",
  comprado: "Lo compramos",
  descartada: "Descartada",
};

export interface Consulta {
  id: string;
  fecha: string;
  /** venta: quiere venderlo. cambio: lo entrega como parte de pago. */
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

export type DatosConsulta = Omit<Consulta, "id" | "fecha" | "estado" | "oferta" | "notas" | "atendidoPor" | "actualizado">;

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

export function borrarConsulta(id: string): Promise<void> {
  return modificar((lista) => {
    const i = lista.findIndex((x) => x.id === id);
    if (i >= 0) lista.splice(i, 1);
  });
}

export async function contarNuevas(): Promise<number> {
  return (await leerConsultas()).filter((c) => c.estado === "nueva").length;
}
