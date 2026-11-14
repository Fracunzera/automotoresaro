/** Lectura y guardado de los datos de la agencia. Solo servidor. */
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";
import { AGENCIA_INICIAL, MARCA_INICIAL, type Agencia } from "./agencia-tipos";

const TAG = "agencia";

async function leer(): Promise<Agencia> {
  const d = await leerPrivado<Partial<Agencia>>("agencia");
  return {
    ...AGENCIA_INICIAL,
    ...d,
    legal: { ...AGENCIA_INICIAL.legal, ...d?.legal },
    marca: { ...MARCA_INICIAL, ...d?.marca, beneficios: d?.marca?.beneficios ?? MARCA_INICIAL.beneficios },
  };
}

export const getAgencia = unstable_cache(leer, ["agencia"], { tags: [TAG] });

export function guardarAgencia(a: Agencia) {
  return conCandado("agencia", async () => {
    await guardarPrivado(a, "agencia");
    revalidateTag(TAG);
    revalidatePath("/", "layout");
  });
}
