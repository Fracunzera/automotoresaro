"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { actualizarAuto, borrarAuto, borrarEjemplos, cambiarEstado, crearAuto } from "@/lib/autos";
import { usaNube } from "@/lib/almacen";
import { borrarNegocioAuto, guardarAjustes, guardarNegocioAuto, registrarPagoDueno, registrarRetiro, registrarVenta } from "@/lib/negocio";
import { PAPELES, type Ajustes, type ModoComision, type MotivoRetiro, type NegocioAuto } from "@/lib/negocio-tipos";
import { emailValido, normalizarEmail, registrarCompra } from "@/lib/clientes";
import { marcarPublicada } from "@/lib/consultas";
import { COOKIE_SESION, DURACION_SESION_SEG, crearToken, passwordConfigurada } from "@/lib/sesion";
import { autenticar, requerirUsuario, type Usuario } from "@/lib/usuarios";
import { getNegocioAuto } from "@/lib/negocio";
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

  const usuario = String(form.get("usuario") ?? "");
  const pass = String(form.get("password") ?? "");
  const ok = await autenticar(usuario, pass);
  if (!ok) {
    const actual = reg && Date.now() - reg.desde < 15 * 60_000 ? reg : { n: 0, desde: Date.now() };
    intentos.set(ip, { n: actual.n + 1, desde: actual.desde });
    await new Promise((r) => setTimeout(r, 800));
    return { error: "El usuario o la contraseña no son correctos. Revisá mayúsculas y minúsculas." };
  }

  intentos.delete(ip);
  (await cookies()).set(COOKIE_SESION, await crearToken(ok.usuario.id, ok.version), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_SEG,
  });
  const volver = String(form.get("volver") ?? "");
  redirect(volver.startsWith("/admin") ? volver : "/admin");
}

export async function salir() {
  (await cookies()).delete(COOKIE_SESION);
  redirect("/ingresar?agencia=1");
}

/** Exige sesión; con "admin" exige además rol de administrador. */
const verificarSesion = (rol?: "admin"): Promise<Usuario> => requerirUsuario(rol);

/** Traduce errores técnicos a algo entendible. */
function errorAmigable(e: unknown): string {
  if (process.env.VERCEL && !usaNube()) {
    return "Falta activar el almacenamiento (Vercel Blob) en la cuenta de Vercel. Avisale a quien armó la página.";
  }
  const msg = e instanceof Error ? e.message : "";
  if (msg.startsWith("Tu sesión") || msg.startsWith("No encontramos") || msg.startsWith("No tenés permiso")) return msg;
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
    dominio: texto(d.dominio, 12).toUpperCase(),
    duenoDni: texto(d.duenoDni, 20),
    duenoDomicilio: texto(d.duenoDomicilio, 150),
    fechaIngreso: /^\d{4}-\d{2}-\d{2}$/.test(String(d.fechaIngreso)) ? String(d.fechaIngreso) : "",
    plazoDias: Math.min(Math.max(entero(d.plazoDias) || 0, 0), 730),
    exclusividad: d.exclusividad === true,
    cargoRetiro: pesos(d.cargoRetiro),
    papeles: (Array.isArray(d.papeles) ? d.papeles : []).filter((p): p is string => (PAPELES as readonly string[]).includes(p as string)),
  };
}

/** Al editar un auto no se pierden los datos de venta o retiro ya registrados. */
const conservarVenta = (n: NegocioAuto | undefined) =>
  n ? { precioVenta: n.precioVenta, fechaVenta: n.fechaVenta, vendidoPor: n.vendidoPor, retiro: n.retiro, pagoDueno: n.pagoDueno } : {};

/* ───────────── Autos ───────────── */

export async function guardarAuto(
  id: string | null,
  datos: Record<string, unknown>,
  negocio: Record<string, unknown>,
  publicar: boolean,
  consultaId?: string,
): Promise<Resultado> {
  try {
    const u = await verificarSesion();
    const v = validar(datos);
    if (typeof v === "string") return { ok: false, error: v };
    // Los vendedores no ven ni cambian los datos del negocio
    const n = u.rol === "admin" ? validarNegocio(negocio) : null;
    const titulo = `${v.marca} ${v.modelo} ${v.anio}`;
    if (id) {
      const auto = await actualizarAuto(id, v);
      if (n) await guardarNegocioAuto(auto.id, { ...n, ...conservarVenta(await getNegocioAuto(auto.id)) });
      return { ok: true, id: auto.id, mensaje: `Listo, se guardaron los cambios del ${titulo}.` };
    }
    const auto = await crearAuto(v, publicar ? "publicado" : "oculto");
    if (n) await guardarNegocioAuto(auto.id, n);
    // Si viene de "Vendé tu auto", la solicitud queda como publicada y vinculada al auto
    if (typeof consultaId === "string" && consultaId) await marcarPublicada(consultaId, auto.id, u.nombre);
    return {
      ok: true,
      id: auto.id,
      mensaje: publicar ? `Listo, el ${titulo} ya está publicado en la página.` : `Listo, el ${titulo} quedó guardado sin publicar.`,
    };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}

export type Comprador = { nombre: string; email: string; telefono: string; aceptaMails: boolean };

export async function cambiarEstadoAuto(id: string, estado: Estado, precioVenta?: number, comprador?: Comprador): Promise<Resultado> {
  try {
    const u = await verificarSesion(estado === "retirado" ? "admin" : undefined);
    if (!ESTADOS.includes(estado)) return { ok: false, error: "Estado no válido." };
    if (estado === "vendido" && !(entero(precioVenta) > 0)) return { ok: false, error: "Escribí a cuánto lo vendiste." };
    const emailComprador = comprador ? normalizarEmail(texto(comprador.email, 120)) : "";
    if (emailComprador && !emailValido(emailComprador)) return { ok: false, error: "Revisá el email del comprador." };
    const auto = await cambiarEstado(id, estado);
    await registrarVenta(id, estado === "vendido" ? entero(precioVenta) : null, u.nombre);
    if (estado !== "retirado") await registrarRetiro(id, null);
    if (estado === "vendido" && comprador && emailComprador) {
      await registrarCompra(
        emailComprador,
        { nombre: texto(comprador.nombre, 80), telefono: texto(comprador.telefono, 40), ciudad: "", aceptaMails: comprador.aceptaMails === true },
        { autoId: id, titulo: `${auto.marca} ${auto.modelo} ${auto.anio}`, fecha: new Date().toISOString() },
      );
    }
    const t = `${auto.marca} ${auto.modelo} ${auto.anio}`;
    const mensajes: Record<Estado, string> = {
      publicado: `Listo, el ${t} está a la venta en la página.`,
      reservado: `Listo, el ${t} figura como reservado.`,
      vendido: `¡Felicitaciones! El ${t} quedó como vendido y ya no aparece en la página.`,
      oculto: `Listo, el ${t} quedó oculto. No aparece en la página.`,
      retirado: `Listo, el ${t} figura como retirado por el dueño.`,
    };
    return { ok: true, mensaje: mensajes[estado] ?? ESTADO_TEXTO[estado] };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}

const MOTIVOS: readonly MotivoRetiro[] = ["antes", "vendioAfuera", "vencio"];

/** El dueño de un auto en consignación se lo llevó (lo retiró o lo vendió por su cuenta). */
export async function retirarAuto(id: string, motivo: MotivoRetiro, cobrado: number): Promise<Resultado> {
  try {
    await verificarSesion("admin");
    if (!MOTIVOS.includes(motivo)) return { ok: false, error: "Elegí qué pasó con el auto." };
    const monto = pesos(cobrado);
    const auto = await cambiarEstado(id, "retirado");
    await registrarVenta(id, null);
    await registrarRetiro(id, { motivo, cobrado: monto });
    const t = `${auto.marca} ${auto.modelo} ${auto.anio}`;
    return {
      ok: true,
      mensaje: monto > 0 ? `Listo, el ${t} quedó como retirado y se sumaron $ ${monto.toLocaleString("es-AR")} cobrados.` : `Listo, el ${t} quedó como retirado por el dueño.`,
    };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}

/** Consignación: anotar que ya se le transfirió al dueño su parte (o deshacerlo con null). */
export async function pagoDuenoAccion(id: string, monto: number | null): Promise<Resultado> {
  try {
    await verificarSesion("admin");
    const m = monto === null ? null : pesos(monto);
    if (m !== null && !(m > 0)) return { ok: false, error: "Escribí cuánto le pagaste." };
    await registrarPagoDueno(id, m);
    return { ok: true, mensaje: m === null ? "Listo, se quitó el pago al dueño." : `Listo, quedó anotado que le pagaste $ ${m.toLocaleString("es-AR")} al dueño.` };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}

export async function borrarAutoAccion(id: string, titulo: string): Promise<Resultado> {
  try {
    await verificarSesion("admin");
    await borrarAuto(id);
    await borrarNegocioAuto(id);
    return { ok: true, mensaje: `Se borró el ${titulo}.` };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}

export async function borrarEjemplosAccion(): Promise<Resultado> {
  try {
    await verificarSesion("admin");
    const n = await borrarEjemplos();
    return { ok: true, mensaje: `Listo, se borraron ${n} autos de ejemplo.` };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}


/* ───────────── Ajustes ───────────── */

export async function guardarAjustesAccion(a: Record<string, unknown>): Promise<Resultado> {
  try {
    await verificarSesion("admin");
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
    const cons = (a.consignacion ?? {}) as Record<string, unknown>;
    const ag = (a.agenda ?? {}) as Record<string, unknown>;
    const horaOk = (h: unknown) => typeof h === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(h);
    const horarios = (Array.isArray(ag.horarios) ? ag.horarios : [])
      .map((h) => h as Record<string, unknown>)
      .filter((h) => Number.isInteger(h.dia) && Number(h.dia) >= 0 && Number(h.dia) <= 6 && horaOk(h.desde) && horaOk(h.hasta) && String(h.desde) < String(h.hasta))
      .map((h) => ({ dia: Number(h.dia), desde: String(h.desde), hasta: String(h.hasta) }))
      .slice(0, 14);

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
      consignacion: {
        plazoDias: Math.min(Math.max(entero(cons.plazoDias) || 60, 1), 730),
        cargoRetiro: pesos(cons.cargoRetiro),
        exclusividad: cons.exclusividad !== false,
        diasAvisoVencimiento: Math.min(Math.max(entero(cons.diasAvisoVencimiento) || 7, 1), 60),
      },
      agenda: {
        activa: ag.activa !== false,
        horarios,
        duracion: [15, 20, 30, 45, 60].includes(entero(ag.duracion)) ? entero(ag.duracion) : 30,
        simultaneas: Math.min(Math.max(entero(ag.simultaneas) || 1, 1), 20),
        diasAdelante: Math.min(Math.max(entero(ag.diasAdelante) || 14, 1), 60),
        anticipacionHoras: Math.min(Math.max(entero(ag.anticipacionHoras) || 0, 0), 72),
      },
    };
    if (ajustes.agenda.activa && horarios.length === 0) return { ok: false, error: "Marcá al menos un día de atención para la agenda de visitas." };
    await guardarAjustes(ajustes);
    return { ok: true, mensaje: "Listo, se guardaron los ajustes. La página ya usa los valores nuevos." };
  } catch (e) {
    return { ok: false, error: errorAmigable(e) };
  }
}
