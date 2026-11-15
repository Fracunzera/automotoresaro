"use server";

import { headers } from "next/headers";
import { getAgencia } from "@/lib/agencia";
import { getPublicos } from "@/lib/autos";
import { emailValido, normalizarEmail } from "@/lib/clientes";
import { enviarMail, mailConfigurado, urlSitio } from "@/lib/mail";
import { leerNegocio } from "@/lib/negocio";
import { idClienteActual } from "@/lib/sesion-cliente";
import { reservarTurno } from "@/lib/turnos";

type R = { ok: true } | { ok: false; error: string; ocupado?: boolean };

const intentos = new Map<string, number[]>();
const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export async function fechaLegible(fecha: string) {
  const [a, m, d] = fecha.split("-").map(Number);
  const f = new Date(a, m - 1, d);
  return `${DIAS[f.getDay()]} ${d} de ${MESES[m - 1]}`;
}

/** Reserva una visita para ver y probar un auto. */
export async function reservarVisita(d: { autoId: string; fecha: string; hora: string; nombre: string; telefono: string; email: string; comentario: string }): Promise<R> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ahora = Date.now();
  const previos = (intentos.get(ip) ?? []).filter((t) => ahora - t < 60 * 60_000);
  if (previos.length >= 5) return { ok: false, error: "Ya reservaste varias visitas. Si necesitás cambiar algo, escribinos por WhatsApp." };

  const nombre = texto(d.nombre, 80);
  const telefono = texto(d.telefono, 40);
  const email = normalizarEmail(texto(d.email, 120));
  if (!nombre) return { ok: false, error: "Escribí tu nombre." };
  if (telefono.replace(/\D/g, "").length < 8) return { ok: false, error: "Escribí un teléfono para confirmarte la visita." };
  if (email && !emailValido(email)) return { ok: false, error: "Revisá el email." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d.fecha)) || !/^\d{2}:\d{2}$/.test(String(d.hora))) return { ok: false, error: "Elegí el día y el horario." };

  const [{ ajustes }, autos, ag] = await Promise.all([leerNegocio(), getPublicos(), getAgencia()]);
  const auto = autos.find((a) => a.id === d.autoId && a.estado === "publicado");
  if (!auto) return { ok: false, error: "Este auto ya no está disponible para visitas." };
  if (!ajustes.agenda.activa) return { ok: false, error: "Por ahora coordinamos las visitas por WhatsApp." };

  const titulo = `${auto.marca} ${auto.modelo} ${auto.anio}`;
  const t = await reservarTurno(ajustes.agenda, {
    autoId: auto.id, autoTitulo: titulo, fecha: d.fecha, hora: d.hora, nombre, telefono, email,
    comentario: texto(d.comentario, 500), clienteId: (await idClienteActual()) ?? undefined,
  });
  if (!t) return { ok: false, error: "Ese horario se acaba de ocupar. Elegí otro.", ocupado: true };
  previos.push(ahora);
  intentos.set(ip, previos);

  if (mailConfigurado()) {
    const cuando = `${await fechaLegible(t.fecha)} a las ${t.hora}`;
    const avisos: Promise<unknown>[] = [];
    if (process.env.ADMIN_EMAIL) {
      const ls = [`Nueva visita: ${titulo}`, `${cuando}`, `${nombre} · ${telefono}${email ? ` · ${email}` : ""}`, t.comentario, `Agenda: ${urlSitio()}/admin/agenda`].filter(Boolean);
      avisos.push(enviarMail({ para: process.env.ADMIN_EMAIL, asunto: `Visita ${cuando}: ${titulo}`, texto: ls.join("\n"), html: ls.map((l) => `<p>${l.replace(/</g, "&lt;")}</p>`).join(""), nombreAgencia: ag.nombre }));
    }
    if (email) {
      const ls = [`¡Hola ${nombre.split(" ")[0]}! Reservaste una visita para ver el ${titulo}.`, `Te esperamos el ${cuando} en ${ag.direccion}, ${ag.ciudad}.`, "Si no podés venir, avisanos por WhatsApp así liberamos el horario."];
      avisos.push(enviarMail({ para: email, asunto: `Tu visita: ${titulo}, ${cuando}`, texto: ls.join("\n"), html: ls.map((l) => `<p>${l.replace(/</g, "&lt;")}</p>`).join(""), nombreAgencia: ag.nombre }));
    }
    Promise.all(avisos).catch((e) => console.error("No se pudo avisar la visita por mail", e));
  }
  return { ok: true };
}
