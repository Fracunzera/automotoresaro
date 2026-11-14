"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { actualizarPerfil, emailValido, ingresoCliente, normalizarEmail } from "@/lib/clientes";
import { enviarMail, mailCodigo } from "@/lib/mail";
import { cerrarSesionCliente, generarCodigo, idClienteActual, iniciarSesionCliente, verificarCodigo } from "@/lib/sesion-cliente";

type R = { ok: true; completarPerfil?: boolean } | { ok: false; error: string };

export async function pedirCodigo(emailCrudo: string): Promise<R> {
  const email = normalizarEmail(String(emailCrudo ?? ""));
  if (!emailValido(email)) return { ok: false, error: "Revisá el email, parece que está mal escrito." };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const codigo = generarCodigo(email, ip);
  if (!codigo) return { ok: false, error: "Pediste muchos códigos. Esperá un rato y probá de nuevo." };
  try {
    const m = mailCodigo(codigo);
    await enviarMail({ para: email, asunto: m.asunto, html: m.html, texto: m.texto });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "No pudimos mandar el mail. Probá de nuevo en unos minutos." };
  }
}

export async function confirmarCodigo(emailCrudo: string, codigo: string): Promise<R> {
  const email = normalizarEmail(String(emailCrudo ?? ""));
  const r = verificarCodigo(email, String(codigo ?? ""));
  if (r === "incorrecto") return { ok: false, error: "El código no es correcto. Revisalo y probá de nuevo." };
  if (r === "vencido") return { ok: false, error: "El código venció. Pedí uno nuevo." };
  if (r === "bloqueado") return { ok: false, error: "Demasiados intentos. Pedí un código nuevo." };
  const { cliente } = await ingresoCliente(email);
  await iniciarSesionCliente(cliente.id);
  return { ok: true, completarPerfil: !cliente.nombre };
}

export async function guardarPerfil(d: { nombre: string; telefono: string; ciudad: string; aceptaMails: boolean }): Promise<R> {
  const id = await idClienteActual();
  if (!id) return { ok: false, error: "Tu sesión se cerró. Ingresá de nuevo." };
  const t = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const nombre = t(d.nombre, 80);
  if (!nombre) return { ok: false, error: "Escribí tu nombre." };
  const c = await actualizarPerfil(id, { nombre, telefono: t(d.telefono, 40), ciudad: t(d.ciudad, 60), aceptaMails: d.aceptaMails === true });
  return c ? { ok: true } : { ok: false, error: "No encontramos tu cuenta. Ingresá de nuevo." };
}

export async function salirCliente() {
  await cerrarSesionCliente();
  redirect("/");
}
