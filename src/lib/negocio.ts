/**
 * Lectura y guardado de los datos privados del negocio. Solo servidor.
 */
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { guardarPrivado, leerPrivado } from "./almacen";
import { AJUSTES_INICIALES, type Ajustes, type Financiacion, type NegocioAuto } from "./negocio-tipos";

interface DatosNegocio {
  ajustes: Ajustes;
  autos: Record<string, NegocioAuto>;
}

const TAG = "negocio";

export async function leerNegocio(): Promise<DatosNegocio> {
  const d = await leerPrivado<DatosNegocio>();
  return {
    ajustes: { ...AJUSTES_INICIALES, ...d?.ajustes, financiacion: { ...AJUSTES_INICIALES.financiacion, ...d?.ajustes?.financiacion } },
    autos: d?.autos ?? {},
  };
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

export async function guardarNegocioAuto(id: string, n: NegocioAuto) {
  const d = await leerNegocio();
  d.autos[id] = { ...d.autos[id], ...n };
  await guardar(d);
}

export async function registrarVenta(id: string, precioVenta: number | null) {
  const d = await leerNegocio();
  const actual = d.autos[id];
  if (precioVenta === null) {
    if (!actual?.fechaVenta) return;
    delete actual.precioVenta;
    delete actual.fechaVenta;
  } else {
    d.autos[id] = {
      ...(actual ?? { tipo: "propio", costo: 0, gastos: 0, duenoNombre: "", duenoTelefono: "", comisionModo: d.ajustes.comisionModo, comisionValor: d.ajustes.comisionValor, notas: "" }),
      precioVenta,
      fechaVenta: new Date().toISOString(),
    };
  }
  await guardar(d);
}

export async function borrarNegocioAuto(id: string) {
  const d = await leerNegocio();
  if (!(id in d.autos)) return;
  delete d.autos[id];
  await guardar(d);
}

export async function guardarAjustes(a: Ajustes) {
  const d = await leerNegocio();
  d.ajustes = a;
  await guardar(d);
}
