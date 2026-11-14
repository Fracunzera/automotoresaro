/**
 * Envío de mails por SMTP (sirve cualquier proveedor: Brevo, Resend, Amazon SES, Gmail Workspace,
 * o un servidor de correo propio). Solo servidor.
 *
 * Variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM y SITE_URL.
 * Sin SMTP_HOST, los mails no se envían: se muestran en la consola del servidor (para probar).
 */
import nodemailer, { type Transporter } from "nodemailer";
import type { Agencia } from "./agencia-tipos";
import type { Auto } from "./tipos";
import { formatKm, formatNumero } from "./utils";

let transporte: Transporter | null = null;

export const mailConfigurado = () => !!process.env.SMTP_HOST;

function getTransporte(): Transporter {
  if (!transporte) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporte;
}

export const urlSitio = () => (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const absoluta = (u: string) => (u.startsWith("http") ? u : `${urlSitio()}${u}`);

const escapar = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function enviarMail(m: { para: string; asunto: string; html: string; texto: string; linkBaja?: string; nombreAgencia?: string }) {
  if (!mailConfigurado()) {
    console.log(`\n[mail no enviado: falta SMTP] Para: ${m.para}\nAsunto: ${m.asunto}\n${m.texto}\n`);
    return;
  }
  await getTransporte().sendMail({
    from: process.env.MAIL_FROM || `${m.nombreAgencia ?? "Agencia"} <no-responder@localhost>`,
    to: m.para,
    subject: m.asunto,
    html: m.html,
    text: m.texto,
    headers: m.linkBaja ? { "List-Unsubscribe": `<${m.linkBaja}>` } : undefined,
  });
}

/* ───────────── Plantillas ───────────── */

function marco(ag: Agencia, contenido: string, pie: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f3f2ef;font-family:Arial,Helvetica,sans-serif;color:#15171a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f2ef;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:#15171a;padding:18px 24px;font-size:22px;font-weight:bold;letter-spacing:-0.5px;color:#ffffff;text-transform:uppercase">
${escapar(ag.nombre.split(" ").slice(0, -1).join(" "))} <span style="color:#d12b1f">${escapar(ag.nombre.split(" ").pop() ?? "")}</span></td></tr>
<tr><td style="padding:28px 24px;font-size:16px;line-height:1.55">${contenido}</td></tr>
<tr><td style="padding:18px 24px;background:#f3f2ef;font-size:12px;line-height:1.5;color:#6b6b6b">${pie}</td></tr>
</table></td></tr></table></body></html>`;
}

const pieBase = (ag: Agencia) =>
  `${escapar(ag.nombre)} · ${escapar(ag.direccion)}, ${escapar(ag.ciudad)}, ${escapar(ag.provincia)} · ${escapar(ag.telefono)}`;

export function mailCodigo(ag: Agencia, codigo: string) {
  const html = marco(
    ag,
    `<p style="margin:0 0 12px">Tu código para entrar a ${escapar(ag.nombre)} es:</p>
<p style="margin:0 0 16px;font-size:36px;font-weight:bold;letter-spacing:8px">${codigo}</p>
<p style="margin:0;color:#6b6b6b">Vence en 15 minutos. Si no lo pediste, ignorá este mail.</p>`,
    pieBase(ag),
  );
  return { asunto: `Tu código de ingreso: ${codigo}`, html, texto: `Tu código para entrar a ${ag.nombre} es ${codigo}. Vence en 15 minutos.` };
}

function tarjetaAuto(a: Auto) {
  const url = `${urlSitio()}/autos/${a.slug}`;
  const foto = a.fotos[0]
    ? `<a href="${url}"><img src="${escapar(absoluta(a.fotos[0]))}" width="552" alt="" style="display:block;width:100%;height:auto;border-radius:6px 6px 0 0"></a>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border:1px solid #e3e1dc;border-radius:6px">
<tr><td>${foto}</td></tr><tr><td style="padding:14px 16px">
<div style="font-size:18px;font-weight:bold">${escapar(`${a.marca} ${a.modelo}`)}</div>
<div style="color:#6b6b6b;font-size:14px">${a.anio} · ${formatKm(a.km)} · ${escapar(a.version)}</div>
<div style="font-size:24px;font-weight:bold;margin:8px 0">$ ${formatNumero(a.precio)}</div>
<a href="${url}" style="display:inline-block;background:#d12b1f;color:#ffffff;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:5px">Ver el auto</a>
</td></tr></table>`;
}

/** Mail de novedades escrito desde el panel. */
export function mailNovedades(ag: Agencia, o: { nombre: string; asunto: string; mensaje: string; autos: Auto[]; linkBaja?: string }) {
  const parrafos = o.mensaje
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${escapar(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const saludo = o.nombre ? `<p style="margin:0 0 14px">Hola ${escapar(o.nombre.split(" ")[0])},</p>` : "";
  const pie = `${pieBase(ag)}${o.linkBaja ? `<br>Recibís este mail porque aceptaste recibir novedades. <a href="${o.linkBaja}" style="color:#6b6b6b">No quiero recibir más mails</a>.` : ""}`;
  const html = marco(ag, `${saludo}${parrafos}${o.autos.map(tarjetaAuto).join("")}`, pie);
  const texto = [
    o.nombre ? `Hola ${o.nombre.split(" ")[0]},` : "",
    o.mensaje,
    ...o.autos.map((a) => `${a.marca} ${a.modelo} ${a.anio} · $ ${formatNumero(a.precio)}: ${urlSitio()}/autos/${a.slug}`),
    o.linkBaja ? `\nPara no recibir más mails: ${o.linkBaja}` : "",
  ].filter(Boolean).join("\n\n");
  return { asunto: o.asunto, html, texto };
}
