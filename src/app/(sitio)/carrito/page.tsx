import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductosPublicos } from "@/lib/productos";
import { getConfigTienda } from "@/lib/tienda";
import { esTienda } from "@/lib/rubro";
import { Carrito } from "@/components/tienda/Carrito";

export const metadata: Metadata = { title: "Carrito", robots: { index: false } };

export default async function CarritoPage() {
  if (!esTienda) notFound();
  const [productos, config] = await Promise.all([getProductosPublicos(), getConfigTienda()]);
  return (
    <div className="contenedor pt-8">
      <h1 className="titulo text-[36px] sm:text-[44px]">Tu carrito</h1>
      <Carrito productos={productos} config={config} />
    </div>
  );
}
