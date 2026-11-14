/**
 * Sesión del panel (dueño y empleados): una cookie firmada que dura 30 días.
 * Funciona tanto en el middleware como en el servidor (usa Web Crypto).
 * El token lleva quién es (id) y la "versión" de su sesión: si a un empleado se le cambia
 * la contraseña o se lo da de baja, la versión cambia y sus sesiones abiertas dejan de valer.
 *
 * Variables de entorno:
 * - ADMIN_USER / ADMIN_PASSWORD: la cuenta principal (obligatoria).
 * - SESSION_SECRET: clave para firmar las sesiones (recomendada).
 */

export const COOKIE_SESION = "aro_sesion";
export const DURACION_SESION_SEG = 60 * 60 * 24 * 30;
/** Id de la cuenta principal (la de ADMIN_USER). */
export const ID_PRINCIPAL = "principal";

const enc = new TextEncoder();

function secreto(): string | null {
  if (!process.env.ADMIN_PASSWORD) return null;
  return `panel:${process.env.SESSION_SECRET || `${process.env.ADMIN_SECRET ?? ""}:${process.env.ADMIN_PASSWORD}`}`;
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

export async function crearToken(uid: string, version: number): Promise<string> {
  const clave = secreto();
  if (!clave) throw new Error("Falta configurar ADMIN_PASSWORD");
  const vence = Math.floor(Date.now() / 1000) + DURACION_SESION_SEG;
  const datos = `${uid}.${version}.${vence}`;
  return `${datos}.${await firmar(datos, clave)}`;
}

/** Devuelve quién es y la versión de su sesión, si la firma es válida y no venció. */
export async function leerToken(token: string | undefined): Promise<{ uid: string; version: number } | null> {
  const clave = secreto();
  if (!clave || !token) return null;
  const partes = token.split(".");
  if (partes.length !== 4) return null;
  const [uid, version, vence, firma] = partes;
  if (!uid || Number(vence) < Date.now() / 1000) return null;
  if (!iguales(firma, await firmar(`${uid}.${version}.${vence}`, clave))) return null;
  return { uid, version: Number(version) || 0 };
}

/** Chequeo rápido (middleware): la firma es válida. Si el empleado sigue activo se verifica en el servidor. */
export async function tokenValido(token: string | undefined): Promise<boolean> {
  return (await leerToken(token)) !== null;
}

export const passwordConfigurada = () => !!process.env.ADMIN_PASSWORD;
