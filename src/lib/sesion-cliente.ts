/**
 * Sesión de los clientes de la página, códigos de ingreso por mail y links de baja.
 * Solo servidor.
 */
import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_CLIENTE = "aro_cliente";
const DURACION_SEG = 60 * 60 * 24 * 180; // 6 meses

function secreto(): string {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("Falta configurar SESSION_SECRET");
  return `clientes:${s}`;
}

const firmar = (texto: string) => createHmac("sha256", secreto()).update(texto).digest("base64url");

function igual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/* ───────────── Sesión ───────────── */

export async function iniciarSesionCliente(id: string) {
  const vence = Math.floor(Date.now() / 1000) + DURACION_SEG;
  const datos = `${id}.${vence}`;
  (await cookies()).set(COOKIE_CLIENTE, `${datos}.${firmar(datos)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEG,
  });
}

export async function cerrarSesionCliente() {
  (await cookies()).delete(COOKIE_CLIENTE);
}

/** Devuelve el id del cliente conectado, o null. */
export async function idClienteActual(): Promise<string | null> {
  const valor = (await cookies()).get(COOKIE_CLIENTE)?.value;
  if (!valor) return null;
  const partes = valor.split(".");
  if (partes.length !== 3) return null;
  const [id, vence, firma] = partes;
  if (Number(vence) < Date.now() / 1000) return null;
  return igual(firma, firmar(`${id}.${vence}`)) ? id : null;
}

/* ───────────── Códigos de ingreso ───────────── */

/*
 * Se guardan en memoria (la app corre en un solo proceso en el VPS).
 * Si la app se reinicia, el cliente pide un código nuevo y listo.
 */
type Pendiente = { hash: string; vence: number; intentos: number };
const pendientes = new Map<string, Pendiente>();
const pedidos = new Map<string, number[]>();

const hashCodigo = (email: string, codigo: string) => createHash("sha256").update(`${secreto()}:${email}:${codigo}`).digest("hex");

/** Genera un código de 6 dígitos. Devuelve null si se pidieron demasiados. */
export function generarCodigo(email: string, ip: string): string | null {
  const ahora = Date.now();
  for (const clave of [`e:${email}`, `i:${ip}`]) {
    const lista = (pedidos.get(clave) ?? []).filter((t) => ahora - t < 60 * 60_000);
    if (lista.length >= (clave.startsWith("e:") ? 5 : 20)) return null;
    lista.push(ahora);
    pedidos.set(clave, lista);
  }
  const codigo = String(randomInt(0, 1_000_000)).padStart(6, "0");
  pendientes.set(email, { hash: hashCodigo(email, codigo), vence: ahora + 15 * 60_000, intentos: 0 });
  return codigo;
}

export type ResultadoCodigo = "ok" | "incorrecto" | "vencido" | "bloqueado";

export function verificarCodigo(email: string, codigo: string): ResultadoCodigo {
  const p = pendientes.get(email);
  if (!p || p.vence < Date.now()) return "vencido";
  if (p.intentos >= 5) return "bloqueado";
  p.intentos++;
  if (!igual(p.hash, hashCodigo(email, codigo.replace(/\D/g, "")))) return p.intentos >= 5 ? "bloqueado" : "incorrecto";
  pendientes.delete(email);
  return "ok";
}

/* ───────────── Links de baja de mails ───────────── */

export const tokenBaja = (id: string) => `${id}.${firmar(`baja:${id}`)}`;

export function idDesdeTokenBaja(token: string): string | null {
  const [id, firma] = token.split(".");
  if (!id || !firma) return null;
  return igual(firma, firmar(`baja:${id}`)) ? id : null;
}
