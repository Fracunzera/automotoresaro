"use server";

import { headers } from "next/headers";
import { getAgencia } from "@/lib/agencia";
import { crearConsulta } from "@/lib/consultas";
import { emailValido, normalizarEmail } from "@/lib/clientes";
import { enviarMail, mailConfigurado, urlSitio } from "@/lib/mail";
import { marcaConocida } from "@/lib/tipos";

type R = { ok: true } | { ok: false; error: string };

// Límite simple contra envíos masivos (por IP, en memoria)
const envios = new Map<string, number[]>();

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Guarda una consulta de "Vendé tu auto" y le avisa a la agencia por mail. */
export async function enviarConsultaVenta(d: Record<string, unknown>): Promise<R> {
  // Campo trampa: las personas no lo ven; los robots lo completan
  if (texto(d.sitio, 100)) return { ok: true };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ahora = Date.now();
  const previos = (envios.get(ip) ?? []).filter((t) => ahora - t < 60 * 60_000);
  if (previos.length >= 6) return { ok: false, error: "Ya recibimos varias consultas tuyas. Si necesitás algo más, escribinos por WhatsApp." };

  const anio = Number(d.anio);
  const km = Number(String(d.km ?? "").replace(/\D/g, ""));
  const email = normalizarEmail(texto(d.email, 120));
  const datos = {
    modo: d.modo === "cambio" ? ("cambio" as const) : ("venta" as const),
    marca: marcaConocida(texto(d.marca, 40)),
    modelo: texto(d.modelo, 60),
    version: texto(d.version, 80),
    anio: Number.isInteger(anio) ? anio : 0,
    km: Number.isFinite(km) ? Math.min(km, 2_000_000) : 0,
    combustible: texto(d.combustible, 20),
    transmision: texto(d.transmision, 20),
    condicion: texto(d.estado, 40),
    choques: texto(d.choques, 20),
    comentarios: texto(d.comentarios, 1500),
    nombre: texto(d.nombre, 80),
    telefono: texto(d.telefono, 40),
    email: emailValido(email) ? email : "",
    zona: texto(d.zona, 80),
  };
  if (!datos.marca || !datos.modelo) return { ok: false, error: "Falta la marca o el modelo." };
  if (!datos.nombre) return { ok: false, error: "Escribí tu nombre." };
  if (datos.telefono.replace(/\D/g, "").length < 8) return { ok: false, error: "Escribí un teléfono para que te podamos llamar." };
  if (email && !datos.email) return { ok: false, error: "Revisá el email." };

  previos.push(ahora);
  envios.set(ip, previos);
  const c = await crearConsulta(datos);

  // Aviso por mail a la agencia (si está configurado). No frena la respuesta si falla.
  const destino = process.env.ADMIN_EMAIL;
  if (destino && mailConfigurado()) {
    const ag = await getAgencia();
    const titulo = `${c.marca} ${c.modelo} ${c.anio || ""}`.trim();
    const lineas = [
      `${c.modo === "cambio" ? "Quiere entregarlo como parte de pago" : "Quiere venderlo"}: ${titulo}${c.km ? `, ${c.km.toLocaleString("es-AR")} km` : ""}.`,
      `Estado: ${c.condicion || "-"} · Choques: ${c.choques || "-"}`,
      `Contacto: ${c.nombre} · ${c.telefono}${c.email ? ` · ${c.email}` : ""}${c.zona ? ` · ${c.zona}` : ""}`,
      c.comentarios ? `Comentarios: ${c.comentarios}` : "",
      `Verla en el panel: ${urlSitio()}/admin/consultas`,
    ].filter(Boolean);
    enviarMail({
      para: destino,
      asunto: `Nueva consulta para vender: ${titulo}`,
      texto: lineas.join("\n"),
      html: `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5">${lineas.map((l) => `<p style="margin:0 0 8px">${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`).join("")}</div>`,
      nombreAgencia: ag.nombre,
    }).catch((e) => console.error("No se pudo avisar la consulta por mail", e));
  }
  return { ok: true };
}
