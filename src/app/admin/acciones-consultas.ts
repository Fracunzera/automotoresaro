"use server";

import { actualizarSeguimiento, borrarConsulta, ESTADOS_CONSULTA, ESTADO_CONSULTA_TEXTO, type EstadoConsulta } from "@/lib/consultas";
import { requerirUsuario } from "@/lib/usuarios";

type Resultado = { ok: true; mensaje: string } | { ok: false; error: string };

function msgError(e: unknown) {
  const m = e instanceof Error ? e.message : "";
  if (/^(Tu sesión|No tenés permiso|No encontramos)/.test(m)) return m;
  console.error(e);
  return "No se pudo guardar. Probá de nuevo.";
}

export async function actualizarConsultaAccion(id: string, d: { estado: EstadoConsulta; oferta: number; notas: string }): Promise<Resultado> {
  try {
    const u = await requerirUsuario();
    if (!ESTADOS_CONSULTA.includes(d.estado)) return { ok: false, error: "Elegí en qué quedó." };
    const oferta = Number.isFinite(d.oferta) && d.oferta > 0 ? Math.round(Math.min(d.oferta, 1e12)) : 0;
    const notas = typeof d.notas === "string" ? d.notas.trim().slice(0, 2000) : "";
    const c = await actualizarSeguimiento(id, { estado: d.estado, oferta, notas }, u.nombre);
    return { ok: true, mensaje: `Listo: ${c.nombre} · ${c.marca} ${c.modelo} quedó como “${ESTADO_CONSULTA_TEXTO[c.estado]}”.` };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

export async function borrarConsultaAccion(id: string): Promise<Resultado> {
  try {
    await requerirUsuario("admin");
    await borrarConsulta(id);
    return { ok: true, mensaje: "Se borró la consulta." };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}
