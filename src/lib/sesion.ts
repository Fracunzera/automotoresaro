/**
 * Sesión del panel: una cookie firmada que dura 30 días.
 * Funciona tanto en el middleware como en el servidor (usa Web Crypto).
 *
 * Variables de entorno:
 * - ADMIN_PASSWORD: la contraseña para entrar al panel (obligatoria).
 * - ADMIN_SECRET:   clave para firmar la sesión (opcional; si cambia, se cierran todas las sesiones).
 */

export const COOKIE_SESION = "aro_sesion";
export const DURACION_SESION_SEG = 60 * 60 * 24 * 30;

const enc = new TextEncoder();

function secreto(): string | null {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return null;
  return `${process.env.ADMIN_SECRET ?? ""}:${pass}`;
}

async function firmar(texto: string, clave: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(clave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const firma = await crypto.subtle.sign("HMAC", key, enc.encode(texto));
  return Array.from(new Uint8Array(firma), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparación en tiempo constante para no filtrar información por demoras. */
export function iguales(a: string, b: string): boolean {
  const x = enc.encode(a);
  const y = enc.encode(b);
  let dif = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) dif |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return dif === 0;
}

export async function crearToken(): Promise<string> {
  const clave = secreto();
  if (!clave) throw new Error("Falta configurar ADMIN_PASSWORD");
  const vence = Math.floor(Date.now() / 1000) + DURACION_SESION_SEG;
  return `${vence}.${await firmar(String(vence), clave)}`;
}

export async function tokenValido(token: string | undefined): Promise<boolean> {
  const clave = secreto();
  if (!clave || !token) return false;
  const [vence, firma] = token.split(".");
  if (!vence || !firma || Number(vence) < Date.now() / 1000) return false;
  return iguales(firma, await firmar(vence, clave));
}

export const passwordConfigurada = () => !!process.env.ADMIN_PASSWORD;
