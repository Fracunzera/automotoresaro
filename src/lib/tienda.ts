/** Configuración de la tienda (envíos y formas de pago). Solo servidor. */
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { guardarPrivado, leerPrivado } from "./almacen";
import { conCandado } from "./candado";
import { CONFIG_TIENDA_INICIAL, type ConfigTienda } from "./productos-tipos";

const TAG = "tienda";

function completar(d: Partial<ConfigTienda> | null | undefined): ConfigTienda {
  const i = CONFIG_TIENDA_INICIAL;
  return {
    ...i,
    ...d,
    retiro: { ...i.retiro, ...d?.retiro },
    domicilio: { ...i.domicilio, ...d?.domicilio },
    pagos: { ...i.pagos, ...d?.pagos, transferencia: { ...i.pagos.transferencia, ...d?.pagos?.transferencia } },
  };
}

const leerCacheado = unstable_cache(async () => (await leerPrivado<Partial<ConfigTienda>>("tienda")) ?? null, ["config-tienda"], { tags: [TAG] });

export const getConfigTienda = async (): Promise<ConfigTienda> => completar(await leerCacheado());

/** Mercado Pago está disponible si hay token cargado en el servidor y está activado en el panel. */
export const mpDisponible = (c: ConfigTienda) => c.pagos.mercadoPago && !!process.env.MP_ACCESS_TOKEN;

export function guardarConfigTienda(c: ConfigTienda) {
  return conCandado("tienda", async () => {
    await guardarPrivado(c, "tienda");
    revalidateTag(TAG);
    revalidatePath("/", "layout");
  });
}
