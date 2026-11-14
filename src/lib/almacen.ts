/**
 * Dónde se guardan los autos y las fotos.
 *
 * - Si existe la variable BLOB_READ_WRITE_TOKEN (Vercel Blob), se guarda en la nube.
 * - Si no, se guarda en la carpeta `data/` del proyecto (sirve para probar en la compu
 *   o para un servidor propio).
 *
 * Cada vez que se guarda la lista se crea una versión nueva y se conservan las últimas
 * COPIAS_A_GUARDAR como respaldo.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, list, put } from "@vercel/blob";
import type { Auto } from "./tipos";

const COPIAS_A_GUARDAR = 30;

export const usaNube = () => !!process.env.BLOB_READ_WRITE_TOKEN;

const carpetaDatos = () => process.env.DATA_DIR || path.join(process.cwd(), "data");

export const TIPOS_FOTO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/* ───────────── Lista de autos ───────────── */

/** Devuelve la lista guardada, o null si todavía no se guardó nunca. */
export async function leerLista(): Promise<Auto[] | null> {
  if (usaNube()) {
    const { blobs } = await list({ prefix: "datos/autos-", limit: 1000 });
    if (blobs.length === 0) return null;
    const ultima = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
    // Cada versión tiene una URL única, así que nunca se lee una copia vieja del caché.
    const res = await fetch(ultima.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`No se pudo leer la lista de autos (${res.status})`);
    return (await res.json()) as Auto[];
  }

  try {
    return JSON.parse(await readFile(path.join(carpetaDatos(), "autos.json"), "utf8")) as Auto[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

export async function guardarLista(autos: Auto[]): Promise<void> {
  const json = JSON.stringify(autos, null, 2);

  if (usaNube()) {
    await put(`datos/autos-${Date.now()}.json`, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    });
    // Borrar versiones viejas, conservando las últimas como respaldo
    const { blobs } = await list({ prefix: "datos/autos-", limit: 1000 });
    const viejas = blobs
      .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
      .slice(COPIAS_A_GUARDAR)
      .map((b) => b.url);
    if (viejas.length) await del(viejas);
    return;
  }

  const dir = carpetaDatos();
  const respaldos = path.join(dir, "respaldos");
  await mkdir(respaldos, { recursive: true });
  // Escritura atómica: primero a un archivo temporal y después se renombra
  const tmp = path.join(dir, `autos.${randomUUID()}.tmp`);
  await writeFile(tmp, json);
  await rename(tmp, path.join(dir, "autos.json"));
  await writeFile(path.join(respaldos, `autos-${Date.now()}.json`), json);
  const archivos = (await readdir(respaldos)).filter((f) => f.startsWith("autos-")).sort().reverse();
  await Promise.all(archivos.slice(COPIAS_A_GUARDAR).map((f) => unlink(path.join(respaldos, f))));
}

/* ───────────── Datos privados del negocio ───────────── */

/*
 * En la nube los archivos tienen una dirección pública (aunque imposible de adivinar),
 * así que los datos privados se guardan CIFRADOS. La clave sale del token del almacenamiento,
 * que solo conoce el servidor: no hay que configurar nada extra.
 */
const claveCifrado = () => createHash("sha256").update(`aro-negocio:${process.env.BLOB_READ_WRITE_TOKEN}`).digest();

function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", claveCifrado(), iv);
  const datos = Buffer.concat([c.update(texto, "utf8"), c.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString("base64"), tag: c.getAuthTag().toString("base64"), datos: datos.toString("base64") });
}

function descifrar(json: string): string {
  const { iv, tag, datos } = JSON.parse(json) as { iv: string; tag: string; datos: string };
  const d = createDecipheriv("aes-256-gcm", claveCifrado(), Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(datos, "base64")), d.final()]).toString("utf8");
}

/** Lee un archivo privado ("negocio", "clientes", "mails"...). */
export async function leerPrivado<T>(nombre = "negocio"): Promise<T | null> {
  if (usaNube()) {
    const { blobs } = await list({ prefix: `privado/${nombre}-`, limit: 1000 });
    if (blobs.length === 0) return null;
    const ultima = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
    const res = await fetch(ultima.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`No se pudieron leer los datos privados (${res.status})`);
    return JSON.parse(descifrar(await res.text())) as T;
  }
  try {
    return JSON.parse(await readFile(path.join(carpetaDatos(), `${nombre}.json`), "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

export async function guardarPrivado(datos: unknown, nombre = "negocio"): Promise<void> {
  const json = JSON.stringify(datos, null, 2);
  if (usaNube()) {
    await put(`privado/${nombre}-${Date.now()}.json`, cifrar(json), {
      access: "public",
      contentType: "application/octet-stream",
      addRandomSuffix: true,
    });
    const { blobs } = await list({ prefix: `privado/${nombre}-`, limit: 1000 });
    const viejas = blobs
      .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
      .slice(COPIAS_A_GUARDAR)
      .map((b) => b.url);
    if (viejas.length) await del(viejas);
    return;
  }
  const dir = carpetaDatos();
  const respaldos = path.join(dir, "respaldos");
  await mkdir(respaldos, { recursive: true });
  const tmp = path.join(dir, `${nombre}.${randomUUID()}.tmp`);
  await writeFile(tmp, json);
  await rename(tmp, path.join(dir, `${nombre}.json`));
  await writeFile(path.join(respaldos, `${nombre}-${Date.now()}.json`), json);
  const archivos = (await readdir(respaldos)).filter((f) => f.startsWith(`${nombre}-`)).sort().reverse();
  await Promise.all(archivos.slice(COPIAS_A_GUARDAR).map((f) => unlink(path.join(respaldos, f))));
}

/* ───────────── Fotos ───────────── */

/** Guarda una foto y devuelve la URL para mostrarla. */
export async function guardarFoto(datos: ArrayBuffer, tipo: string): Promise<string> {
  const ext = TIPOS_FOTO[tipo];
  if (!ext) throw new Error("Formato de foto no permitido");
  const nombre = `${randomUUID()}.${ext}`;

  if (usaNube()) {
    const { url } = await put(`fotos/${nombre}`, Buffer.from(datos), { access: "public", contentType: tipo });
    return url;
  }

  const dir = path.join(carpetaDatos(), "fotos");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, nombre), Buffer.from(datos));
  return `/api/fotos/${nombre}`;
}

/** Borra fotos que ya no usa ningún auto. No falla si alguna no existe. */
export async function borrarFotos(urls: string[]): Promise<void> {
  const propias = urls.filter((u) => u.startsWith("/api/fotos/") || u.includes(".blob.vercel-storage.com/"));
  if (!propias.length) return;
  try {
    if (usaNube()) {
      const nube = propias.filter((u) => u.startsWith("https://"));
      if (nube.length) await del(nube);
      return;
    }
    await Promise.all(
      propias
        .filter((u) => u.startsWith("/api/fotos/"))
        .map((u) => unlink(path.join(carpetaDatos(), "fotos", path.basename(u))).catch(() => {})),
    );
  } catch (e) {
    console.error("No se pudieron borrar algunas fotos", e);
  }
}

/** Lee una foto guardada en la carpeta local (solo modo local). */
export async function leerFotoLocal(nombre: string): Promise<{ datos: Buffer; tipo: string } | null> {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(nombre)) return null;
  try {
    const datos = await readFile(path.join(carpetaDatos(), "fotos", nombre));
    const ext = nombre.split(".").pop()!;
    const tipo = Object.entries(TIPOS_FOTO).find(([, e]) => e === ext)![0];
    return { datos, tipo };
  } catch {
    return null;
  }
}
