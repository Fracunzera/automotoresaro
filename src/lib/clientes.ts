/**
 * Clientes registrados en la página (para guardar favoritos y, si aceptan, recibir mails).
 * Datos privados: se guardan como "clientes" en el almacenamiento privado. Solo servidor.
 */
import { randomUUID } from "node:crypto";
import { guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";

export interface Cliente {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  ciudad: string;
  /** Aceptó recibir novedades por mail (con fecha, como constancia). */
  aceptaMails: boolean;
  aceptaMailsFecha?: string;
  /** web: se registró solo. agencia: lo cargó la agencia (ej. al vender un auto). */
  origen: "web" | "agencia";
  favoritos: string[];
  compras: { autoId: string; titulo: string; fecha: string }[];
  notas: string;
  creado: string;
  ultimoIngreso?: string;
}

const ARCHIVO = "clientes";
export const normalizarEmail = (e: string) => e.trim().toLowerCase();
export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 120;

export async function leerClientes(): Promise<Cliente[]> {
  return (await leerPrivado<Cliente[]>(ARCHIVO)) ?? [];
}

export async function getCliente(id: string): Promise<Cliente | undefined> {
  return (await leerClientes()).find((c) => c.id === id);
}

/** Modifica la lista de clientes de forma segura (de a un cambio por vez). */
function modificar<T>(fn: (lista: Cliente[]) => T | Promise<T>): Promise<T> {
  return conCandado(ARCHIVO, async () => {
    const lista = await leerClientes();
    const r = await fn(lista);
    await guardarPrivado(lista, ARCHIVO);
    return r;
  });
}

function nuevo(email: string, origen: Cliente["origen"]): Cliente {
  return {
    id: randomUUID(), email, nombre: "", telefono: "", ciudad: "", aceptaMails: false,
    origen, favoritos: [], compras: [], notas: "", creado: new Date().toISOString(),
  };
}

/** Al ingresar con el código: devuelve el cliente (lo crea si es la primera vez). */
export function ingresoCliente(emailCrudo: string): Promise<{ cliente: Cliente; esNuevo: boolean }> {
  const email = normalizarEmail(emailCrudo);
  return modificar((lista) => {
    let c = lista.find((x) => x.email === email);
    const esNuevo = !c;
    if (!c) {
      c = nuevo(email, "web");
      lista.push(c);
    }
    c.ultimoIngreso = new Date().toISOString();
    return { cliente: { ...c }, esNuevo };
  });
}

export type DatosPerfil = { nombre: string; telefono: string; ciudad: string; aceptaMails: boolean };

export function actualizarPerfil(id: string, d: DatosPerfil): Promise<Cliente | null> {
  return modificar((lista) => {
    const c = lista.find((x) => x.id === id);
    if (!c) return null;
    if (d.aceptaMails !== c.aceptaMails) c.aceptaMailsFecha = new Date().toISOString();
    Object.assign(c, d);
    return { ...c };
  });
}

export function alternarFavorito(id: string, autoId: string): Promise<string[] | null> {
  return modificar((lista) => {
    const c = lista.find((x) => x.id === id);
    if (!c) return null;
    c.favoritos = c.favoritos.includes(autoId) ? c.favoritos.filter((f) => f !== autoId) : [autoId, ...c.favoritos].slice(0, 200);
    return [...c.favoritos];
  });
}

export function darDeBajaMails(id: string): Promise<boolean> {
  return modificar((lista) => {
    const c = lista.find((x) => x.id === id);
    if (!c) return false;
    if (c.aceptaMails) {
      c.aceptaMails = false;
      c.aceptaMailsFecha = new Date().toISOString();
    }
    return true;
  });
}

/* ───────────── Desde el panel ───────────── */

export type DatosClienteAgencia = DatosPerfil & { email: string; notas: string };

/** Crea o actualiza un cliente cargado por la agencia. Si el email ya existe, lo actualiza. */
export function guardarClienteAgencia(id: string | null, d: DatosClienteAgencia): Promise<Cliente> {
  const email = normalizarEmail(d.email);
  return modificar((lista) => {
    const repetido = lista.find((x) => x.email === email && x.id !== id);
    if (id && repetido) throw new Error("Ya hay otro cliente con ese email.");
    let c = id ? lista.find((x) => x.id === id) : repetido;
    if (id && !c) throw new Error("No encontramos ese cliente. Puede que lo hayan borrado.");
    if (!c) {
      c = nuevo(email, "agencia");
      lista.push(c);
    }
    if (d.aceptaMails !== c.aceptaMails) c.aceptaMailsFecha = new Date().toISOString();
    Object.assign(c, { ...d, email });
    return { ...c };
  });
}

export function registrarCompra(email: string, datos: Omit<DatosClienteAgencia, "email" | "notas">, compra: Cliente["compras"][number]) {
  const e = normalizarEmail(email);
  return modificar((lista) => {
    let c = lista.find((x) => x.email === e);
    if (!c) {
      c = nuevo(e, "agencia");
      lista.push(c);
    }
    if (datos.nombre) c.nombre = datos.nombre;
    if (datos.telefono) c.telefono = datos.telefono;
    if (datos.ciudad) c.ciudad = datos.ciudad;
    if (datos.aceptaMails && !c.aceptaMails) {
      c.aceptaMails = true;
      c.aceptaMailsFecha = new Date().toISOString();
    }
    c.compras = [compra, ...c.compras.filter((x) => x.autoId !== compra.autoId)];
    return { ...c };
  });
}

export function borrarCliente(id: string): Promise<void> {
  return modificar((lista) => {
    const i = lista.findIndex((x) => x.id === id);
    if (i >= 0) lista.splice(i, 1);
  });
}
