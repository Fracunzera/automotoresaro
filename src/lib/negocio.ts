/**
 * Lectura y guardado de los datos privados del negocio. Solo servidor.
 */
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";
import { AJUSTES_INICIALES, completarNegocio, type Ajustes, type Financiacion, type MotivoRetiro, type NegocioAuto } from "./negocio-tipos";

interface DatosNegocio {
  ajustes: Ajustes;
  autos: Record<string, NegocioAuto>;
}

const TAG = "negocio";

export async function leerNegocio(): Promise<DatosNegocio> {
  const d = await leerPrivado<DatosNegocio>();
  return {
    ajustes: {
      ...AJUSTES_INICIALES,
      ...d?.ajustes,
      financiacion: { ...AJUSTES_INICIALES.financiacion, ...d?.ajustes?.financiacion },
      consignacion: { ...AJUSTES_INICIALES.consignacion, ...d?.ajustes?.consignacion },
      agenda: { ...AJUSTES_INICIALES.agenda, ...d?.ajustes?.agenda },
    },
    autos: d?.autos ?? {},
  };
}

export async function getNegocioAuto(id: string): Promise<NegocioAuto | undefined> {
  return (await leerNegocio()).autos[id];
}

/** Datos de financiación para la página pública (no incluye nada privado). */
export const getFinanciacion = unstable_cache(
  async (): Promise<Financiacion> => {
    const { financiacion } = (await leerNegocio()).ajustes;
    return { tna: financiacion.tna / 100, anticipoMinimo: financiacion.anticipoMinimo / 100, plazos: financiacion.plazos };
  },
  ["financiacion"],
  { tags: [TAG] },
);

async function guardar(d: DatosNegocio) {
  await guardarPrivado(d);
  revalidateTag(TAG);
  revalidatePath("/", "layout");
}

export function guardarNegocioAuto(id: string, n: NegocioAuto) {
  return conCandado("negocio", async () => {
    const d = await leerNegocio();
    d.autos[id] = { ...d.autos[id], ...n };
    await guardar(d);
  });
}

export function registrarVenta(id: string, precioVenta: number | null, vendidoPor?: string) {
  return conCandado("negocio", async () => {
    const d = await leerNegocio();
    const actual = d.autos[id];
    if (precioVenta === null) {
      if (!actual?.fechaVenta) return;
      delete actual.precioVenta;
      delete actual.fechaVenta;
      delete actual.vendidoPor;
      delete actual.pagoDueno;
    } else {
      d.autos[id] = {
        ...completarNegocio(actual, d.ajustes),
        precioVenta,
        fechaVenta: new Date().toISOString(),
        vendidoPor,
      };
    }
    await guardar(d);
  });
}

/** Registra que se le pagó al dueño (o lo borra, con null). */
export function registrarPagoDueno(id: string, monto: number | null) {
  return conCandado("negocio", async () => {
    const d = await leerNegocio();
    const actual = d.autos[id];
    if (!actual) throw new Error("No encontramos los datos de ese auto.");
    if (monto === null) delete actual.pagoDueno;
    else actual.pagoDueno = { monto, fecha: new Date().toISOString() };
    await guardar(d);
  });
}

/** Registra (o borra, con null) que el dueño se llevó el auto y cuánto se le cobró. */
export function registrarRetiro(id: string, retiro: { motivo: MotivoRetiro; cobrado: number } | null) {
  return conCandado("negocio", async () => {
    const d = await leerNegocio();
    const actual = d.autos[id];
    if (retiro === null) {
      if (!actual?.retiro) return;
      delete actual.retiro;
    } else {
      d.autos[id] = { ...completarNegocio(actual, d.ajustes), retiro: { ...retiro, fecha: new Date().toISOString() } };
    }
    await guardar(d);
  });
}

export function borrarNegocioAuto(id: string) {
  return conCandado("negocio", async () => {
    const d = await leerNegocio();
    if (!(id in d.autos)) return;
    delete d.autos[id];
    await guardar(d);
  });
}

export function guardarAjustes(a: Ajustes) {
  return conCandado("negocio", async () => {
    const d = await leerNegocio();
    d.ajustes = a;
    await guardar(d);
  });
}
