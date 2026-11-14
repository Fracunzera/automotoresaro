"use server";

import { randomUUID } from "node:crypto";
import { getPublicos } from "@/lib/autos";
import { getProductosPublicos } from "@/lib/productos";
import { esTienda } from "@/lib/rubro";
import { getAgencia } from "@/lib/agencia";
import { guardarPrivado, leerPrivado } from "@/lib/almacen";
import { conCandado } from "@/lib/candado";
import { borrarCliente, emailValido, guardarClienteAgencia, leerClientes, normalizarEmail } from "@/lib/clientes";
import { enviarMail, itemDeAuto, mailNovedades, urlSitio, type ItemMail } from "@/lib/mail";
import { requerirUsuario } from "@/lib/usuarios";
import { tokenBaja } from "@/lib/sesion-cliente";

type Resultado = { ok: true; mensaje: string; id?: string } | { ok: false; error: string };

const verificarSesion = (rol?: "admin") => requerirUsuario(rol);

const msgError = (e: unknown) => {
  const m = e instanceof Error ? e.message : "";
  if (m.startsWith("Tu sesión") || m.startsWith("Ya hay") || m.startsWith("No encontramos") || m.startsWith("No tenés permiso")) return m;
  console.error(e);
  return "No se pudo guardar. Probá de nuevo.";
};

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/* ───────────── Clientes ───────────── */

export async function guardarClienteAccion(id: string | null, d: Record<string, unknown>): Promise<Resultado> {
  try {
    await verificarSesion();
    const email = normalizarEmail(texto(d.email, 120));
    if (!emailValido(email)) return { ok: false, error: "Revisá el email." };
    const nombre = texto(d.nombre, 80);
    if (!nombre) return { ok: false, error: "Escribí el nombre." };
    const c = await guardarClienteAgencia(id, {
      email, nombre,
      telefono: texto(d.telefono, 40),
      ciudad: texto(d.ciudad, 60),
      notas: texto(d.notas, 2000),
      aceptaMails: d.aceptaMails === true,
    });
    return { ok: true, id: c.id, mensaje: `Listo, se guardó a ${c.nombre}.` };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

export async function borrarClienteAccion(id: string): Promise<Resultado> {
  try {
    await verificarSesion("admin");
    await borrarCliente(id);
    return { ok: true, mensaje: "Se borró el cliente." };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

/* ───────────── Mails ───────────── */

export type Envio = {
  id: string;
  fecha: string;
  asunto: string;
  destinatarios: number;
  enviados: number;
  fallidos: number;
  estado: "enviando" | "terminado";
};

export async function leerEnvios(): Promise<Envio[]> {
  await verificarSesion("admin");
  return (await leerPrivado<Envio[]>("mails")) ?? [];
}

function actualizarEnvio(id: string, cambios: Partial<Envio>, nuevo?: Envio) {
  return conCandado("mails", async () => {
    let lista = await leerEnvios();
    if (nuevo) lista = [nuevo, ...lista].slice(0, 50);
    lista = lista.map((e) => (e.id === id ? { ...e, ...cambios } : e));
    await guardarPrivado(lista, "mails");
  });
}

/**
 * destino:
 * - "prueba": se manda solo a `emailPrueba` (para ver cómo queda)
 * - "uno":    a un cliente (clienteId)
 * - "todos":  a todos los que aceptaron recibir mails
 */
export async function enviarMailAccion(d: {
  destino: "prueba" | "uno" | "todos";
  clienteId?: string;
  emailPrueba?: string;
  asunto: string;
  mensaje: string;
  autos: string[];
}): Promise<Resultado> {
  try {
    await verificarSesion("admin");
    const asunto = texto(d.asunto, 150);
    const mensaje = texto(d.mensaje, 5000);
    if (!asunto) return { ok: false, error: "Escribí el asunto (el título del mail)." };
    if (!mensaje) return { ok: false, error: "Escribí el mensaje." };
    const ag = await getAgencia();
    const ids = (Array.isArray(d.autos) ? d.autos : []).slice(0, 6);
    let items: ItemMail[];
    if (esTienda) {
      const productos = await getProductosPublicos();
      items = ids.map((id) => productos.find((p) => p.id === id)).filter((p) => !!p).map((p) => ({
        titulo: p.nombre, detalle: p.categoria, precio: p.precio, foto: p.fotos[0] ?? "", ruta: `/productos/${p.slug}`, boton: "Comprar",
      }));
    } else {
      const publicos = await getPublicos();
      items = ids.map((id) => publicos.find((a) => a.id === id)).filter((a) => !!a).map(itemDeAuto);
    }

    if (d.destino === "prueba") {
      const email = normalizarEmail(texto(d.emailPrueba, 120));
      if (!emailValido(email)) return { ok: false, error: "Escribí un email válido para la prueba." };
      const m = mailNovedades(ag, { nombre: "", asunto: `[Prueba] ${asunto}`, mensaje, items });
      await enviarMail({ para: email, asunto: m.asunto, html: m.html, texto: m.texto, nombreAgencia: ag.nombre });
      return { ok: true, mensaje: `Se mandó la prueba a ${email}. Revisá tu casilla.` };
    }

    const clientes = await leerClientes();
    const destinatarios =
      d.destino === "uno" ? clientes.filter((c) => c.id === d.clienteId) : clientes.filter((c) => c.aceptaMails);
    if (destinatarios.length === 0) {
      return { ok: false, error: d.destino === "uno" ? "No encontramos ese cliente." : "Todavía no hay clientes que acepten recibir mails." };
    }

    const envio: Envio = {
      id: randomUUID(), fecha: new Date().toISOString(), asunto,
      destinatarios: destinatarios.length, enviados: 0, fallidos: 0, estado: "enviando",
    };
    await actualizarEnvio(envio.id, {}, envio);

    // Se envía de a uno, en segundo plano, para no hacer esperar al panel.
    void (async () => {
      let enviados = 0;
      let fallidos = 0;
      for (const c of destinatarios) {
        try {
          const linkBaja = c.aceptaMails ? `${urlSitio()}/baja?t=${tokenBaja(c.id)}` : undefined;
          const m = mailNovedades(ag, { nombre: c.nombre, asunto, mensaje, items, linkBaja });
          await enviarMail({ para: c.email, asunto: m.asunto, html: m.html, texto: m.texto, linkBaja, nombreAgencia: ag.nombre });
          enviados++;
        } catch (e) {
          console.error("Falló el envío a", c.email, e);
          fallidos++;
        }
        if ((enviados + fallidos) % 10 === 0) await actualizarEnvio(envio.id, { enviados, fallidos });
        await new Promise((r) => setTimeout(r, 300));
      }
      await actualizarEnvio(envio.id, { enviados, fallidos, estado: "terminado" });
    })();

    return {
      ok: true,
      mensaje: destinatarios.length === 1 ? `Se está mandando el mail a ${destinatarios[0].nombre || destinatarios[0].email}.` : `Se está mandando el mail a ${destinatarios.length} clientes. Abajo vas a ver cómo avanza.`,
    };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}
