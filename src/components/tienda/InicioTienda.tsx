import Link from "next/link";
import { getAgencia } from "@/lib/agencia";
import { linkMapa, telLink } from "@/lib/agencia-tipos";
import { getProductosPublicos } from "@/lib/productos";
import { getConfigTienda } from "@/lib/tienda";
import { hayStock } from "@/lib/productos-tipos";
import { formatPrecio } from "@/lib/utils";
import { Icon } from "../Icon";
import { ProductoCard } from "./ProductoCard";

/** Portada de una tienda online. */
export async function InicioTienda() {
  const [productos, ag, config] = await Promise.all([getProductosPublicos(), getAgencia(), getConfigTienda()]);
  const conStock = productos.filter((p) => hayStock(p));
  const destacados = [...conStock].sort((a, b) => Number(b.destacado) - Number(a.destacado)).slice(0, 8);
  const ofertas = conStock.filter((p) => p.precioAnterior > p.precio).slice(0, 4);
  const categorias = Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));

  return (
    <>
      <section className="relative bg-tinta bg-cover bg-center text-white" style={ag.marca.portadaFoto ? { backgroundImage: `url(${ag.marca.portadaFoto})` } : undefined}>
        {ag.marca.portadaFoto && <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" aria-hidden />}
        <div className="contenedor relative pb-14 pt-14 sm:pb-20 sm:pt-20">
          <p className="sobretitulo">{ag.nombre} · {ag.ciudad}</p>
          <h1 className="titulo mt-3 max-w-3xl text-[44px] uppercase text-white sm:text-[68px]">{ag.marca.portadaTitulo}</h1>
          <p className="mt-4 max-w-xl text-lg text-stone-300">{ag.marca.eslogan}</p>
          <form action="/productos" className="mt-8 flex max-w-xl gap-2">
            <input name="q" className="campo h-12! text-base!" placeholder="¿Qué estás buscando?" aria-label="Buscar productos" />
            <button className="btn-rojo h-12!"><Icon name="search" className="size-4" /> Buscar</button>
          </form>
        </div>
      </section>

      {(config.domicilio.activo || config.pagos.mercadoPago) && (
        <div className="border-b border-linea bg-papel">
          <div className="contenedor flex flex-wrap justify-center gap-x-8 gap-y-1 py-3 text-[15px] font-semibold">
            {config.domicilio.activo && (
              <span>{config.domicilio.gratisDesde > 0 ? `Envío gratis desde ${formatPrecio(config.domicilio.gratisDesde)}` : "Envíos a domicilio"}</span>
            )}
            {config.retiro.activo && <span>Retiro gratis en el local</span>}
            {config.pagos.mercadoPago && process.env.MP_ACCESS_TOKEN && <span>Pagá con Mercado Pago</span>}
          </div>
        </div>
      )}

      {categorias.length > 1 && (
        <section className="contenedor mt-12">
          <h2 className="titulo text-[32px]">Categorías</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {categorias.map((c) => (
              <Link key={c} href={`/productos?categoria=${encodeURIComponent(c)}`} className="rounded-md border border-linea px-5 py-3 text-[15px] font-semibold transition-colors hover:border-tinta">
                {c}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="contenedor mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="titulo text-[32px]">Destacados</h2>
          <Link href="/productos" className="text-[15px] font-semibold text-rojo hover:underline">Ver todos</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {destacados.map((p) => <ProductoCard key={p.id} p={p} />)}
        </div>
        {destacados.length === 0 && <p className="mt-4 text-stone-600">Pronto vas a encontrar nuestros productos acá.</p>}
      </section>

      {ofertas.length > 0 && (
        <section className="contenedor mt-14">
          <h2 className="titulo text-[32px]">Ofertas</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {ofertas.map((p) => <ProductoCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      <section className="contenedor mt-20">
        <h2 className="titulo text-[32px]">Por qué comprarnos</h2>
        <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {ag.marca.beneficios.map((b) => (
            <div key={b.titulo} className="border-t-[3px] border-tinta pt-4">
              <h3 className="text-lg font-semibold">{b.titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-stone-600">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contenedor mt-20">
        <div className="flex flex-col gap-6 rounded-lg bg-papel p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="titulo text-[32px]">Visitanos</h2>
            <p className="mt-2 text-stone-700">{ag.direccion}, {ag.ciudad} · {ag.horarios}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={linkMapa(ag)} target="_blank" rel="noopener noreferrer" className="btn-tinta"><Icon name="pin" className="size-4" /> Cómo llegar</a>
            <a href={telLink(ag.telefono)} className="btn-borde"><Icon name="phone" className="size-4" /> Llamar</a>
          </div>
        </div>
      </section>
    </>
  );
}
