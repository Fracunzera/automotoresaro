/** Lectura y guardado de los datos de la agencia. Solo servidor. */
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";
import { AGENCIA_INICIAL, MARCA_INICIAL, type Agencia } from "./agencia-tipos";

const TAG = "agencia";

/** Completa con los valores por defecto los campos que falten (por ejemplo, de versiones anteriores). */
function completar(d: Partial<Agencia> | null | undefined): Agencia {
  return {
    ...AGENCIA_INICIAL,
    ...d,
    legal: { ...AGENCIA_INICIAL.legal, ...d?.legal },
    marca: { ...MARCA_INICIAL, ...d?.marca, beneficios: d?.marca?.beneficios ?? MARCA_INICIAL.beneficios },
  };
}

const leerCacheado = unstable_cache(async () => (await leerPrivado<Partial<Agencia>>("agencia")) ?? null, ["agencia"], { tags: [TAG] });

// Se completa DESPUÉS de la caché: así un cambio de formato en una actualización nunca rompe la página
export const getAgencia = async (): Promise<Agencia> => completar(await leerCacheado());

export function guardarAgencia(a: Agencia) {
  return conCandado("agencia", async () => {
    await guardarPrivado(a, "agencia");
    revalidateTag(TAG);
    revalidatePath("/", "layout");
  });
}
