"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { actualizarAuto, borrarAuto, borrarEjemplos, cambiarEstado, crearAuto } from "@/lib/autos";
import { usaNube } from "@/lib/almacen";
import { borrarNegocioAuto, guardarAjustes, guardarNegocioAuto, registrarVenta } from "@/lib/negocio";
import type { Ajustes, ModoComision, NegocioAuto } from "@/lib/negocio-tipos";
import { COOKIE_SESION, DURACION_SESION_SEG, crearToken, iguales, passwordConfigurada, tokenValido } from "@/lib/sesion";
import {
  CARROCERIAS, COMBUSTIBLES, ESTADOS, ESTADO_TEXTO, TRANSMISIONES,
  type DatosAuto, type Estado,
} from "@/lib/tipos";

export type Resultado = { ok: true; mensaje: string; id?: string } | { ok: false; error: string };

/* ───────────── Ingreso ───────────── */

const intentos = new Map<string, { n: number; desde: number }>();

export async function ingresar(_prev: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  if (!passwordConfigurada()) return { error: "Falta configurar la contraseña del panel (ADMIN_PASSWORD)." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const reg = intentos.get(ip);
  if (reg && reg.n >= 8 && Date.now() - reg.desde < 15 * 60_000) {
    return { error: "Demasiados intentos. Esperá 15 minutos y probá de nuevo." };
  }

  const pass = String(form.get("password") ?? "");
  if (!iguales(pass, process.env.ADMIN_PASSWORD!)) {
    const actual = reg && Date.now() - reg.desde < 15 * 60_000 ? reg : { n: 0, desde: Date.now() };
    intentos.set(ip, { n: actual.n + 1, desde: actual.desde });
    await new Promise((r) => setTimeout(r, 800));
    return { error: "La contraseña no es correcta. Revisá mayúsculas y minúsculas." };
  }

  intentos.delete(ip);
  (await cookies()).set(COOKIE_SESION, await crearToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_SEG,
  });
  redirect("/admin");
}

export async function salir() {
  (await cookies()).delete(COOKIE_SESION);
  redirect("/admin/ingresar");
}

async function verificarSesion() {
  if (!(await tokenValido((await cookies()).get(COOKIE_SESION)?.value))) {
    throw new Error("Tu sesión se cerró. Volvé a ingresar con la contraseña.");
  }
}

/** Traduce errores técnicos a algo entendible. */
function errorAmigable(e: unknown): string {
  if (process.env.VERCEL && !usaNube()) {
    return "Falta activar el almacenamiento (Vercel Blob) en la cuenta de Vercel. Avisale a quien armó la página.";
  }
  const msg = e instanceof Error ? e.message : "";
  if (msg.startsWith("Tu sesión") || msg.startsWith("No encontramos")) return msg;
  console.error(e);
  return "No se pudo guardar. Revisá tu conexión a internet y probá de nuevo.";
}

/* ───────────── Validación ───────────── */

const texto = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const entero = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : NaN);
const de = <T extends readonly string[]>(lista: T, v: unknown): T[number] | null =>
  lista.includes(v as string) ? (v as T[number]) : null;

function validar(d: Record<string, unknown>): DatosAuto | string {
  const anioMax = new Date().getFullYear() + 1;
  const marca = texto(d.marca, 40);
  const modelo = texto(d.modelo, 60);
  const anio = entero(d.anio);
  const km = entero(d.km);
  const precio = entero(d.precio);
  const combustible = de(COMBUSTIBLES, d.combustible);
  const transmision = de(TRANSMISIONES, d.transmision);
  const carroceria = de(CARROCERIAS, d.carroceria);
  const color = texto(d.color, 40);
  const colorHex = /^#[0-9a-fA-F]{6}$/.test(String(d.colorHex)) ? String(d.colorHex) : "#9ca3af";

  if (!marca) return "Falta la marca.";
  if (!modelo) return "Falta el modelo.";
  if (!(anio >= 1950 && anio <= anioMax)) return "Revisá el año.";
  if (!(km >= 0 && km <= 2_000_000)) return "Revisá los kilómetros.";
  if (!(precio > 0)) return "Falta el precio.";
  if (!combustible) return "Elegí el combustible.";
  if (!transmision) return "Elegí la transmisión.";
  if (!carroceria) return "Elegí el tipo de auto.";
  if (!color) return "Elegí el color.";

  const fotos = (Array.isArray(d.fotos) ? d.fotos : [])
    .filter((f): f is string => typeof f === "string" && (f.startsWith("/api/fotos/") || f.startsWith("https://") || f.startsWith("/autos/")))
    .slice(0, 30);
  const equipamiento = (Array.isArray(d.equipamiento) ? d.equipamiento : [])
    .map((x) => texto(x, 60))
    .filter(Boolean)
    .slice(0, 40);
  const puertas = entero(d.puertas);

  return {
    marca, modelo, version: texto(d.version, 80), anio, km, precio,
    combustible, transmision, carroceria, color, colorHex,
    puertas: puertas >= 2 && puertas <= 5 ? puertas : 4,
    motor: texto(d.motor, 60),
    fotos, equipamiento,
    descripcion: texto(d.descripcion, 2000),
    unicoDueno: d.unicoDueno === true,
    serviceOficial: d.serviceOficial === true,
    destacado: d.destacado === true,
  };
}

const MODOS: readonly ModoComision[] = ["porcentaje", "fijo", "neto"];
const pesos = (v: unknown) => {
  const n = entero(v);
  return n >= 0 && n < 1e12 ? n : 0;
};

function validarNegocio(d: Record<string, unknown>): NegocioAuto {
  const modo = de(MODOS, d.comisionModo) ?? "porcentaje";
  const valor = typeof d.comisionValor === "number" && Number.isFinite(d.comisionValor) ? d.comisionValor : 0;
  return {
    tipo: d.tipo === "consignacion" ? "consignacion" : "propio",
    costo: pesos(d.costo),
    gastos: pesos(d.gastos),
    duenoNombre: texto(d.duenoNombre, 80),
    duenoTelefono: texto(d.duenoTelefono, 40),
    comisionModo: modo,
    comisionValor: modo === "porcentaje" ? Math.min(Math.max(valor, 0), 100) : pesos(valor),
    notas: texto(d.notas, 2000),
  };
}

/* ───────────── Autos ───────────── */

export async function guardarAuto(
  id: string | null,
  datos: Record<string, unknown>,
  negocio: Record<string, unknown>,
  publicar: boolean,
): Promise<Resultado> {
  try {
    await verificarSesion();
    const v = validar(datos);
    if (typeof v === "string") return { ok: false, error: v };
    const n = validarNegocio(negocio);
    const titulo = `${v.marca} ${v.modelo} ${v.anio}`;
    if (id) {
      const auto = await actualizarAuto(id, v);
      await guardarNegocioAuto(auto.id, n);
      return { ok: true, id: auto.id, mensaje: `Listo, se guardaron los cambios del ${titulo}.` };
    }
    const auto = await crearAuto(v, publicar ? "publicado" : "oculto");
    await guardarNegocioAuto(auto.id, n);
    return {
      ok: true,
      id: auto.id,
      mensaje: publicar ? `Listo, el ${titulo} ya está publicado en la página.` : `Listo, el ${titulo} quedó guardado sin publicar.`,
    };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}

export async function cambiarEstadoAuto(id: string, estado: Estado, precioVenta?: number): Promise<Resultado> {
  try {
    await verificarSesion();
    if (!ESTADOS.includes(estado)) return { ok: false, error: "Estado no válido." };
    if (estado === "vendido" && !(entero(precioVenta) > 0)) return { ok: false, error: "Escribí a cuánto lo vendiste." };
    const auto = await cambiarEstado(id, estado);
    await registrarVenta(id, estado === "vendido" ? entero(precioVenta) : null);
    const t = `${auto.marca} ${auto.modelo} ${auto.anio}`;
    const mensajes: Record<Estado, string> = {
      publicado: `Listo, el ${t} está a la venta en la página.`,
      reservado: `Listo, el ${t} figura como reservado.`,
      vendido: `¡Felicitaciones! El ${t} quedó como vendido y ya no aparece en la página.`,
      oculto: `Listo, el ${t} quedó oculto. No aparece en la página.`,
    };
    return { ok: true, mensaje: mensajes[estado] ?? ESTADO_TEXTO[estado] };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}

export async function borrarAutoAccion(id: string, titulo: string): Promise<Resultado> {
  try {
    await verificarSesion();
    await borrarAuto(id);
    await borrarNegocioAuto(id);
    return { ok: true, mensaje: `Se borró el ${titulo}.` };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}

export async function borrarEjemplosAccion(): Promise<Resultado> {
  try {
    await verificarSesion();
    const n = await borrarEjemplos();
    return { ok: true, mensaje: `Listo, se borraron ${n} autos de ejemplo.` };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}


/* ───────────── Ajustes ───────────── */

export async function guardarAjustesAccion(a: Record<string, unknown>): Promise<Resultado> {
  try {
    await verificarSesion();
    const fin = (a.financiacion ?? {}) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : NaN);
    const modo = de(MODOS, a.comisionModo);
    const valor = num(a.comisionValor);
    const tna = num(fin.tna);
    const anticipo = num(fin.anticipoMinimo);
    const plazos = (Array.isArray(fin.plazos) ? fin.plazos : [])
      .map(entero)
      .filter((p) => p >= 1 && p <= 120);
    const dias = entero(a.diasAlerta);

    if (!modo) return { ok: false, error: "Elegí cómo cobrás la comisión." };
    if (!(valor >= 0) || (modo === "porcentaje" && valor > 100)) return { ok: false, error: "Revisá el valor de la comisión." };
    if (!(tna >= 0 && tna <= 500)) return { ok: false, error: "Revisá la tasa de financiación." };
    if (!(anticipo >= 0 && anticipo <= 100)) return { ok: false, error: "Revisá el anticipo mínimo." };
    if (plazos.length === 0) return { ok: false, error: "Elegí al menos una cantidad de cuotas." };

    const ajustes: Ajustes = {
      comisionModo: modo,
      comisionValor: modo === "porcentaje" ? valor : Math.round(valor),
      comisionMinima: pesos(a.comisionMinima),
      financiacion: { tna, anticipoMinimo: anticipo, plazos: Array.from(new Set(plazos)).sort((x, y) => x - y) },
      diasAlerta: dias >= 1 && dias <= 365 ? dias : 60,
    };
    await guardarAjustes(ajustes);
    return { ok: true, mensaje: "Listo, se guardaron los ajustes. La página ya usa los valores nuevos." };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}
