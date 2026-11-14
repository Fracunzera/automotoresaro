/**
 * Usuarios del panel: la cuenta principal (ADMIN_USER / ADMIN_PASSWORD) y los empleados
 * que se dan de alta desde el panel. Solo servidor.
 *
 * Roles:
 * - admin:    ve y cambia todo (costos, comisiones, ganancias, ajustes, empleados, mails).
 * - vendedor: carga y edita autos, los reserva o vende, y atiende clientes. No ve plata del negocio.
 */
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";
import { COOKIE_SESION, ID_PRINCIPAL, iguales, leerToken } from "./sesion";

const scryptAsync = promisify(scrypt) as (pass: string, salt: Buffer, largo: number) => Promise<Buffer>;

export type Rol = "admin" | "vendedor";
export const ROL_TEXTO: Record<Rol, string> = { admin: "Administrador", vendedor: "Vendedor" };

export interface Empleado {
  id: string;
  nombre: string;
  usuario: string;
  /** Contraseña cifrada (scrypt). Nunca se guarda la contraseña real. */
  hash: string;
  rol: Rol;
  activo: boolean;
  /** Cambia al cambiar la contraseña o dar de baja: cierra las sesiones abiertas. */
  version: number;
  creado: string;
  ultimoIngreso?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  rol: Rol;
  principal: boolean;
}

const ARCHIVO = "empleados";
export const normalizarUsuario = (u: string) => u.trim().toLowerCase();
const usuarioPrincipal = () => normalizarUsuario(process.env.ADMIN_USER || "admin");

export async function leerEmpleados(): Promise<Empleado[]> {
  return (await leerPrivado<Empleado[]>(ARCHIVO)) ?? [];
}

function modificar<T>(fn: (lista: Empleado[]) => T | Promise<T>): Promise<T> {
  return conCandado(ARCHIVO, async () => {
    const lista = await leerEmpleados();
    const r = await fn(lista);
    await guardarPrivado(lista, ARCHIVO);
    return r;
  });
}

/* ───────────── Contraseñas ───────────── */

async function hashear(pass: string): Promise<string> {
  const sal = randomBytes(16);
  const h = await scryptAsync(pass, sal, 64);
  return `scrypt$${sal.toString("base64")}$${h.toString("base64")}`;
}

async function verificar(pass: string, guardado: string): Promise<boolean> {
  const [tipo, sal, h] = guardado.split("$");
  if (tipo !== "scrypt" || !sal || !h) return false;
  const esperado = Buffer.from(h, "base64");
  const calculado = await scryptAsync(pass, Buffer.from(sal, "base64"), esperado.length);
  return timingSafeEqual(esperado, calculado);
}

export function validarPassword(pass: string): string | null {
  if (pass.length < 8) return "La contraseña tiene que tener al menos 8 caracteres.";
  if (pass.length > 100) return "La contraseña es demasiado larga.";
  return null;
}

/* ───────────── Ingreso y sesión ───────────── */

const PRINCIPAL = (): Usuario => ({
  id: ID_PRINCIPAL,
  nombre: process.env.ADMIN_NOMBRE || "Administrador",
  usuario: usuarioPrincipal(),
  rol: "admin",
  principal: true,
});

/** Verifica usuario y contraseña. Devuelve el usuario y la versión de sesión, o null. */
export async function autenticar(usuarioCrudo: string, pass: string): Promise<{ usuario: Usuario; version: number } | null> {
  const usuario = normalizarUsuario(usuarioCrudo);
  const okPrincipal = iguales(usuario, usuarioPrincipal()) && iguales(pass, process.env.ADMIN_PASSWORD ?? "");
  if (okPrincipal && process.env.ADMIN_PASSWORD) return { usuario: PRINCIPAL(), version: 0 };

  const e = (await leerEmpleados()).find((x) => x.usuario === usuario);
  if (!e || !e.activo || !(await verificar(pass, e.hash))) return null;
  await modificar((lista) => {
    const x = lista.find((y) => y.id === e.id);
    if (x) x.ultimoIngreso = new Date().toISOString();
  });
  return { usuario: { id: e.id, nombre: e.nombre, usuario: e.usuario, rol: e.rol, principal: false }, version: e.version };
}

/** Quién está usando el panel ahora, o null si no hay sesión válida. */
export async function usuarioActual(): Promise<Usuario | null> {
  const t = await leerToken((await cookies()).get(COOKIE_SESION)?.value);
  if (!t) return null;
  if (t.uid === ID_PRINCIPAL) return PRINCIPAL();
  const e = (await leerEmpleados()).find((x) => x.id === t.uid);
  if (!e || !e.activo || e.version !== t.version) return null;
  return { id: e.id, nombre: e.nombre, usuario: e.usuario, rol: e.rol, principal: false };
}

/** Para acciones: exige sesión (y rol de administrador si se pide). Si no, lanza un error entendible. */
export async function requerirUsuario(rol?: Rol): Promise<Usuario> {
  const u = await usuarioActual();
  if (!u) throw new Error("Tu sesión se cerró. Volvé a ingresar con tu usuario y contraseña.");
  if (rol === "admin" && u.rol !== "admin") throw new Error("No tenés permiso para hacer esto. Pedíselo a un administrador.");
  return u;
}

/** Para páginas: si no tiene permiso, lo manda al inicio del panel. */
export async function requerirPagina(rol?: Rol): Promise<Usuario> {
  const u = await usuarioActual();
  if (!u) redirect("/ingresar?agencia=1");
  if (rol === "admin" && u.rol !== "admin") redirect("/admin?sinPermiso=1");
  return u;
}

/* ───────────── Alta y cambios (solo administradores) ───────────── */

export async function crearEmpleado(d: { nombre: string; usuario: string; password: string; rol: Rol }): Promise<Empleado> {
  const usuario = normalizarUsuario(d.usuario);
  if (usuario === usuarioPrincipal()) throw new Error("Ese usuario ya existe. Elegí otro.");
  const hash = await hashear(d.password);
  return modificar((lista) => {
    if (lista.some((x) => x.usuario === usuario)) throw new Error("Ese usuario ya existe. Elegí otro.");
    const e: Empleado = {
      id: randomUUID(), nombre: d.nombre, usuario, hash, rol: d.rol, activo: true, version: 1, creado: new Date().toISOString(),
    };
    lista.push(e);
    return e;
  });
}

export function actualizarEmpleado(id: string, d: { nombre: string; rol: Rol; activo: boolean }): Promise<Empleado> {
  return modificar((lista) => {
    const e = lista.find((x) => x.id === id);
    if (!e) throw new Error("No encontramos ese empleado.");
    // Al dar de baja o cambiar el rol se cierran sus sesiones abiertas
    if (e.activo !== d.activo || e.rol !== d.rol) e.version++;
    Object.assign(e, d);
    return e;
  });
}

export async function cambiarPassword(id: string, password: string): Promise<void> {
  const hash = await hashear(password);
  await modificar((lista) => {
    const e = lista.find((x) => x.id === id);
    if (!e) throw new Error("No encontramos ese empleado.");
    e.hash = hash;
    e.version++;
  });
}

/** Cambio de la propia contraseña: pide la actual. */
export async function cambiarPasswordPropia(id: string, actual: string, nueva: string): Promise<number> {
  const e = (await leerEmpleados()).find((x) => x.id === id);
  if (!e || !(await verificar(actual, e.hash))) throw new Error("La contraseña actual no es correcta.");
  await cambiarPassword(id, nueva);
  return e.version + 1;
}

export function borrarEmpleado(id: string): Promise<void> {
  return modificar((lista) => {
    const i = lista.findIndex((x) => x.id === id);
    if (i >= 0) lista.splice(i, 1);
  });
}
