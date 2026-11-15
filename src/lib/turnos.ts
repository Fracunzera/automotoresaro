/**
 * Agenda de visitas: turnos que reservan los compradores para ver y probar un auto.
 * Datos privados (nombre y teléfono). Solo servidor.
 */
import { randomUUID } from "node:crypto";
import { guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";
import type { ConfigAgenda } from "./negocio-tipos";

export const ESTADOS_TURNO = ["pendiente", "confirmado", "realizado", "noVino", "cancelado"] as const;
export type EstadoTurno = (typeof ESTADOS_TURNO)[number];

export interface Turno {
  id: string;
  autoId: string;
  autoTitulo: string;
  /** AAAA-MM-DD */
  fecha: string;
  /** HH:MM */
  hora: string;
  nombre: string;
  telefono: string;
  email: string;
  comentario: string;
  estado: EstadoTurno;
  /** Vendedor que lo atiende. */
  vendedor: string;
  clienteId?: string;
  creado: string;
  actualizado: string;
}

const ARCHIVO = "turnos";

export async function leerTurnos(): Promise<Turno[]> {
  return (await leerPrivado<Turno[]>(ARCHIVO)) ?? [];
}

function modificar<T>(fn: (lista: Turno[]) => T): Promise<T> {
  return conCandado(ARCHIVO, async () => {
    const lista = await leerTurnos();
    const r = fn(lista);
    // Se guardan los últimos 2000
    await guardarPrivado(lista.slice(-2000), ARCHIVO);
    return r;
  });
}

/* ───────────── Horarios ───────────── */

const dosDig = (n: number) => String(n).padStart(2, "0");
export const fechaISO = (d: Date) => `${d.getFullYear()}-${dosDig(d.getMonth() + 1)}-${dosDig(d.getDate())}`;
const aMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return a * 60 + (b || 0);
};
const aHora = (m: number) => `${dosDig(Math.floor(m / 60))}:${dosDig(m % 60)}`;

const ocupa = (t: Turno) => t.estado === "pendiente" || t.estado === "confirmado";

/** Días con sus horarios libres para un auto (según la agenda y lo ya reservado). */
export function horariosLibres(c: ConfigAgenda, turnos: Turno[], autoId: string, ahora = new Date()) {
  const limite = new Date(ahora.getTime() + c.anticipacionHoras * 3_600_000);
  const dias: { fecha: string; horas: string[] }[] = [];
  for (let i = 0; i <= c.diasAdelante; i++) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i);
    const rangos = c.horarios.filter((h) => h.dia === d.getDay());
    if (!rangos.length) continue;
    const fecha = fechaISO(d);
    const delDia = turnos.filter((t) => t.fecha === fecha && ocupa(t));
    const horas: string[] = [];
    for (const r of rangos) {
      for (let m = aMin(r.desde); m + c.duracion <= aMin(r.hasta); m += c.duracion) {
        const hora = aHora(m);
        const inicio = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(m / 60), m % 60);
        if (inicio < limite) continue;
        const enEseHorario = delDia.filter((t) => t.hora === hora);
        if (enEseHorario.length >= c.simultaneas || enEseHorario.some((t) => t.autoId === autoId)) continue;
        horas.push(hora);
      }
    }
    if (horas.length) dias.push({ fecha, horas: Array.from(new Set(horas)).sort() });
  }
  return dias;
}

export type NuevoTurno = Omit<Turno, "id" | "estado" | "vendedor" | "creado" | "actualizado">;

/** Reserva el turno si el horario sigue libre (se verifica de a una reserva por vez). */
export function reservarTurno(c: ConfigAgenda, d: NuevoTurno): Promise<Turno | null> {
  return modificar((lista) => {
    const libre = horariosLibres(c, lista, d.autoId).some((x) => x.fecha === d.fecha && x.horas.includes(d.hora));
    if (!libre) return null;
    const ahora = new Date().toISOString();
    const t: Turno = { ...d, id: randomUUID(), estado: "pendiente", vendedor: "", creado: ahora, actualizado: ahora };
    lista.push(t);
    return t;
  });
}

export function actualizarTurno(id: string, cambios: { estado?: EstadoTurno; vendedor?: string }): Promise<Turno> {
  return modificar((lista) => {
    const t = lista.find((x) => x.id === id);
    if (!t) throw new Error("No encontramos ese turno.");
    Object.assign(t, cambios, { actualizado: new Date().toISOString() });
    return { ...t };
  });
}

/** Turnos sin confirmar de hoy en adelante (para el número del menú). */
export async function contarTurnosPendientes() {
  const hoy = fechaISO(new Date());
  return (await leerTurnos()).filter((t) => t.estado === "pendiente" && t.fecha >= hoy).length;
}
