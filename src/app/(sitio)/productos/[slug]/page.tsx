import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgencia } from "@/lib/agencia";
import { getProductoPorSlug, getProductosPublicos } from "@/lib/productos";
import { getConfigTienda } from "@/lib/tienda";
import { esTienda } from "@/lib/rubro";
import { formatNumero, formatPrecio } from "@/lib/utils";
import { AgregarAlCarrito } from "@/components/tienda/AgregarAlCarrito";
import { GaleriaProducto } from "@/components/tienda/GaleriaProducto";
import { Pesos, ProductoCard } from "@/components/tienda/ProductoCard";
import { Icon } from "@/components/Icon";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = esTienda ? await getProductoPorSlug((await params).slug) : undefined;
  if (!p) return {};
  return { title: p.nombre, description: `${p.nombre} a ${formatPrecio(p.precio)}. ${p.descripcion}`.slice(0, 300) };
}

export default async function ProductoPage({ params }: { params: Params }) {
  if (!esTienda) notFound();
  const p = await getProductoPorSlug((await params).slug);
  if (!p) notFound();
  const [todos, config, ag] = await Promise.all([getProductosPublicos(), getConfigTienda(), getAgencia()]);
  const relacionados = todos.filter((x) => x.id !== p.id && x.categoria === p.categoria).slice(0, 4);
  const descuento = p.precioAnterior > p.precio ? Math.round((1 - p.precio / p.precioAnterior) * 100) : 0;

  return (
    <div className="contenedor pt-6">
      <nav className="mb-4 flex flex-wrap gap-1.5 text-sm text-stone-500" aria-label="Migas de pan">
        <Link href="/productos" className="hover:text-tinta">Productos</Link>
        <span aria-hidden>›</span>
        <Link href={`/productos?categoria=${encodeURIComponent(p.categoria)}`} className="hover:text-tinta">{p.categoria}</Link>
      </nav>
      <div className="grid gap-8 lg:grid-cols-2">
        <GaleriaProducto p={p} />
        <div>
          <h1 className="text-[28px] font-semibold leading-tight">{p.nombre}</h1>
          <div className="mt-3">
            {descuento > 0 && (
              <p className="text-stone-500">
                <span className="line-through">$ {formatNumero(p.precioAnterior)}</span>{" "}
                <span className="rounded-sm bg-rojo px-1.5 py-0.5 text-sm font-bold text-white">{descuento}% OFF</span>
              </p>
            )}
            <Pesos valor={p.precio} className="text-[44px] leading-none" />
          </div>
          <div className="mt-6"><AgregarAlCarrito p={p} /></div>

          <ul className="mt-6 space-y-2 border-t border-linea pt-5 text-[15px] text-stone-700">
            {config.domicilio.activo && (
              <li className="flex gap-2">
                <Icon name="pin" className="size-5 shrink-0 text-stone-400" />
                <span>
                  Envío a domicilio{config.domicilio.gratisDesde > 0 ? `: gratis en compras desde ${formatPrecio(config.domicilio.gratisDesde)}` : config.domicilio.costo > 0 ? `: ${formatPrecio(config.domicilio.costo)}` : " gratis"}
                </span>
              </li>
            )}
            {config.retiro.activo && (
              <li className="flex gap-2"><Icon name="clock" className="size-5 shrink-0 text-stone-400" /> Retiro sin cargo en {ag.direccion}, {ag.ciudad}</li>
            )}
          </ul>

          {p.descripcion && (
            <section className="mt-8">
              <h2 className="titulo text-[24px]">Descripción</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-stone-700">{p.descripcion}</p>
            </section>
          )}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="titulo text-[30px]">También te puede gustar</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {relacionados.map((x) => <ProductoCard key={x.id} p={x} />)}
          </div>
        </section>
      )}
    </div>
  );
}
