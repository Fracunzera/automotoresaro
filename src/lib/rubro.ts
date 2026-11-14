/**
 * Rubro de esta instalación. Se define al instalar, con la variable NEXT_PUBLIC_RUBRO:
 * - "autos":  agencia de autos (catálogo, consignación, financiación, "Vendé tu auto").
 * - "tienda": tienda online (productos, carrito, pedidos, envíos y pagos).
 * Se lee al compilar: cambiarlo requiere volver a compilar (npm run build).
 */
export type Rubro = "autos" | "tienda";
export const RUBRO: Rubro = process.env.NEXT_PUBLIC_RUBRO === "tienda" ? "tienda" : "autos";
export const esTienda = RUBRO === "tienda";
