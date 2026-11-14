"use server";

import { cookies } from "next/headers";
import { guardarAgencia } from "@/lib/agencia";
import { normalizarWhatsapp, type Agencia } from "@/lib/agencia-tipos";
import { COOKIE_SESION, DURACION_SESION_SEG, crearToken } from "@/lib/sesion";
import {
  ROL_TEXTO, borrarEmpleado, cambiarPassword, cambiarPasswordPropia, crearEmpleado, actualizarEmpleado,
  normalizarUsuario, requerirUsuario, validarPassword, type Rol,
} from "@/lib/usuarios";

type Resultado = { ok: true; mensaje: string; id?: string } | { ok: false; error: string };

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const url = (v: unknown) => {
  const t = texto(v, 300);
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

function msgError(e: unknown) {
  const m = e instanceof Error ? e.message : "";
  if (/^(Tu sesión|No tenés permiso|Ese usuario|No encontramos|La contraseña)/.test(m)) return m;
  console.error(e);
  return "No se pudo guardar. Probá de nuevo.";
}

/* ───────────── Datos de la agencia ───────────── */

export async function guardarAgenciaAccion(d: Record<string, unknown>): Promise<Resultado> {
  try {
    await requerirUsuario("admin");
    const legal = (d.legal ?? {}) as Record<string, unknown>;
    const a: Agencia = {
      nombre: texto(d.nombre, 60),
      whatsapp: normalizarWhatsapp(texto(d.whatsapp, 30)),
      telefono: texto(d.telefono, 40),
      email: texto(d.email, 120),
      direccion: texto(d.direccion, 120),
      ciudad: texto(d.ciudad, 60),
      provincia: texto(d.provincia, 60),
      mapa: url(d.mapa),
      horarios: texto(d.horarios, 160),
      instagram: url(d.instagram),
      facebook: url(d.facebook),
      traslado: texto(d.traslado, 600),
      legal: { titular: texto(legal.titular, 120), cuit: texto(legal.cuit, 20) },
    };
    if (!a.nombre) return { ok: false, error: "Falta el nombre de la agencia." };
    if (a.whatsapp.length < 10) return { ok: false, error: "Revisá el número de WhatsApp (con código de área)." };
    if (!a.direccion || !a.ciudad) return { ok: false, error: "Falta la dirección o la ciudad." };
    await guardarAgencia(a);
    return { ok: true, mensaje: "Listo, se guardaron los datos. La página ya los muestra." };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

/* ───────────── Empleados ───────────── */

const ROLES: Rol[] = ["admin", "vendedor"];

export async function crearEmpleadoAccion(d: { nombre: string; usuario: string; password: string; rol: Rol }): Promise<Resultado> {
  try {
    await requerirUsuario("admin");
    const nombre = texto(d.nombre, 80);
    const usuario = normalizarUsuario(texto(d.usuario, 40));
    const password = typeof d.password === "string" ? d.password : "";
    if (!nombre) return { ok: false, error: "Escribí el nombre." };
    if (!/^[a-z0-9._-]{3,40}$/.test(usuario)) {
      return { ok: false, error: "El usuario tiene que tener al menos 3 letras o números, sin espacios ni tildes (ej. juan.perez)." };
    }
    const errPass = validarPassword(password);
    if (errPass) return { ok: false, error: errPass };
    if (!ROLES.includes(d.rol)) return { ok: false, error: "Elegí qué puede hacer." };
    const e = await crearEmpleado({ nombre, usuario, password, rol: d.rol });
    return { ok: true, id: e.id, mensaje: `Listo, ${nombre} ya puede entrar con el usuario “${usuario}”.` };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

export async function actualizarEmpleadoAccion(id: string, d: { nombre: string; rol: Rol; activo: boolean }): Promise<Resultado> {
  try {
    await requerirUsuario("admin");
    const nombre = texto(d.nombre, 80);
    if (!nombre) return { ok: false, error: "Escribí el nombre." };
    if (!ROLES.includes(d.rol)) return { ok: false, error: "Elegí qué puede hacer." };
    const e = await actualizarEmpleado(id, { nombre, rol: d.rol, activo: d.activo === true });
    return {
      ok: true,
      mensaje: e.activo ? `Listo, se guardaron los cambios de ${e.nombre} (${ROL_TEXTO[e.rol]}).` : `Listo, ${e.nombre} quedó dado de baja y ya no puede entrar.`,
    };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

export async function nuevaPasswordEmpleadoAccion(id: string, password: string): Promise<Resultado> {
  try {
    await requerirUsuario("admin");
    const err = validarPassword(String(password ?? ""));
    if (err) return { ok: false, error: err };
    await cambiarPassword(id, password);
    return { ok: true, mensaje: "Listo, la contraseña nueva ya funciona. Pasásela al empleado." };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

export async function borrarEmpleadoAccion(id: string): Promise<Resultado> {
  try {
    const u = await requerirUsuario("admin");
    if (u.id === id) return { ok: false, error: "No te podés borrar a vos mismo." };
    await borrarEmpleado(id);
    return { ok: true, mensaje: "Se borró el empleado." };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

/** Cada empleado puede cambiar su propia contraseña (la cuenta principal se cambia en el servidor). */
export async function cambiarMiPasswordAccion(actual: string, nueva: string): Promise<Resultado> {
  try {
    const u = await requerirUsuario();
    if (u.principal) return { ok: false, error: "La contraseña de la cuenta principal se cambia en la configuración del servidor." };
    const err = validarPassword(String(nueva ?? ""));
    if (err) return { ok: false, error: err };
    const version = await cambiarPasswordPropia(u.id, String(actual ?? ""), nueva);
    // Renovar la sesión de este dispositivo (las demás se cierran)
    (await cookies()).set(COOKIE_SESION, await crearToken(u.id, version), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DURACION_SESION_SEG,
    });
    return { ok: true, mensaje: "Listo, cambiaste tu contraseña. Se cerró la sesión en tus otros dispositivos." };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}
