import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCliente } from "@/lib/clientes";
import { getProductosPublicos } from "@/lib/productos";
import { esTienda } from "@/lib/rubro";
import { idClienteActual } from "@/lib/sesion-cliente";
import { getConfigTienda, mpDisponible } from "@/lib/tienda";
import { Checkout } from "@/components/tienda/Checkout";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function FinalizarPage() {
  if (!esTienda) notFound();
  const [productos, config, idCliente] = await Promise.all([getProductosPublicos(), getConfigTienda(), idClienteActual()]);
  const c = idCliente ? await getCliente(idCliente) : undefined;
  return (
    <div className="contenedor pt-8">
      <h1 className="titulo text-[36px] sm:text-[44px]">Finalizar compra</h1>
      <Checkout
        productos={productos}
        config={config}
        mp={mpDisponible(config)}
        datosCliente={c ? { nombre: c.nombre, telefono: c.telefono, email: c.email } : null}
      />
    </div>
  );
}
