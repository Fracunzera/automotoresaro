"use server";

import { ESTADOS_TURNO, actualizarTurno, type EstadoTurno } from "@/lib/turnos";
import { requerirUsuario } from "@/lib/usuarios";

type Resultado = { ok: true; mensaje: string } | { ok: false; error: string };

const TEXTO: Record<EstadoTurno, string> = {
  pendiente: "sin confirmar",
  confirmado: "confirmada",
  realizado: "realizada",
  noVino: "marcada como que no vino",
  cancelado: "cancelada",
};

export async function actualizarTurnoAccion(id: string, d: { estado?: EstadoTurno; vendedor?: string }): Promise<Resultado> {
  try {
    await requerirUsuario();
    if (d.estado && !ESTADOS_TURNO.includes(d.estado)) return { ok: false, error: "Estado no válido." };
    const cambios: { estado?: EstadoTurno; vendedor?: string } = {};
    if (d.estado) cambios.estado = d.estado;
    if (typeof d.vendedor === "string") cambios.vendedor = d.vendedor.trim().slice(0, 80);
    const t = await actualizarTurno(id, cambios);
    return { ok: true, mensaje: d.estado ? `Visita de ${t.nombre} ${TEXTO[t.estado]}.` : `Listo: a ${t.nombre} lo atiende ${t.vendedor || "cualquiera"}.` };
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    if (/^(Tu sesión|No tenés permiso|No encontramos)/.test(m)) return { ok: false, error: m };
    console.error(e);
    return { ok: false, error: "No se pudo guardar. Probá de nuevo." };
  }
}
