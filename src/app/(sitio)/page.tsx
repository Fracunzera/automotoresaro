import Link from "next/link";
import { getAgencia } from "@/lib/agencia";
import { linkMapa, telLink } from "@/lib/agencia-tipos";
import { getPublicos } from "@/lib/autos";
import { getFinanciacion } from "@/lib/negocio";
import type { Carroceria } from "@/lib/tipos";
import { CarCard } from "@/components/CarCard";
import { TipoIcono } from "@/components/CarImage";
import { HeroBuscador } from "@/components/HeroBuscador";
import { Icon } from "@/components/Icon";

const tipos: Carroceria[] = ["SUV", "Pick-up", "Sedán", "Hatchback", "Utilitario"];

export default async function Home() {
  const [autos, fin, ag] = await Promise.all([getPublicos(), getFinanciacion(), getAgencia()]);
  const disponibles = autos.filter((a) => a.estado === "publicado");
  const recientes = [...disponibles].sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado)).slice(0, 8);
  const marcas = Array.from(new Set(autos.map((a) => a.marca))).sort();
  const porMarca = marcas.map((m) => [m, autos.filter((a) => a.marca === m).length] as const);

  return (
    <>
      {/* PORTADA */}
      <section
        className="relative bg-tinta bg-cover bg-center text-white"
        style={ag.marca.portadaFoto ? { backgroundImage: `url(${ag.marca.portadaFoto})` } : undefined}
      >
        {ag.marca.portadaFoto && <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" aria-hidden />}
        <div className="contenedor relative pb-14 pt-14 sm:pb-20 sm:pt-20">
          <p className="sobretitulo">{ag.nombre} · {ag.ciudad}, {ag.provincia}</p>
          <h1 className="titulo mt-3 max-w-3xl text-[44px] uppercase text-white sm:text-[68px]">
            {ag.marca.portadaTitulo}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-300">
            {disponibles.length} autos disponibles. {ag.marca.eslogan}
          </p>
          <div className="mt-8">
            <HeroBuscador marcas={marcas} />
          </div>
        </div>
      </section>

      {/* BANNERS */}
      <section className="contenedor mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/vender" className="group flex min-h-40 flex-col justify-between rounded-lg bg-rojo p-6 text-white">
          <p className="titulo text-[30px] text-white">Vendé tu auto en el día</p>
          <span className="inline-flex items-center gap-2 text-[15px] font-semibold">
            Pedí tu cotización <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
        <Link href="/financiacion" className="group flex min-h-40 flex-col justify-between rounded-lg bg-tinta p-6 text-white">
          <p className="titulo text-[30px] text-white">Hasta {Math.max(...fin.plazos)} cuotas fijas</p>
          <span className="inline-flex items-center gap-2 text-[15px] font-semibold">
            Simulá tu cuota <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
        <Link href="/vender?modo=cambio" className="group flex min-h-40 flex-col justify-between rounded-lg bg-papel p-6">
          <p className="titulo text-[30px]">Entregá tu usado como parte de pago</p>
          <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-tinta">
            Cotizá tu usado <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      {/* POR TIPO */}
      <section className="contenedor mt-16">
        <h2 className="titulo text-[32px]">Buscá por tipo</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {tipos.map((t) => {
            const n = autos.filter((a) => a.carroceria === t).length;
            return (
              <Link
                key={t}
                href={`/autos?carroceria=${encodeURIComponent(t)}`}
                className="group flex flex-col items-center rounded-lg border border-linea px-4 pb-4 pt-5 transition-colors hover:border-tinta"
              >
                <TipoIcono tipo={t} className="h-11 text-stone-500 transition-colors group-hover:text-rojo" />
                <span className="mt-3 font-semibold">{t}</span>
                <span className="text-[13px] text-stone-500">{n} {n === 1 ? "auto" : "autos"}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* STOCK */}
      <section className="contenedor mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="titulo text-[32px]">Autos disponibles</h2>
          <Link href="/autos" className="text-[15px] font-semibold text-rojo hover:underline">Ver los {autos.length} autos</Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recientes.map((a) => <CarCard key={a.slug} auto={a} fin={fin} />)}
        </div>
      </section>

      {/* POR MARCA */}
      <section className="contenedor mt-16">
        <h2 className="titulo text-[32px]">Buscá por marca</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {porMarca.map(([m, n]) => (
            <Link
              key={m}
              href={`/autos?marca=${encodeURIComponent(m)}`}
              className="rounded-md border border-linea px-4 py-2.5 text-[15px] font-semibold transition-colors hover:border-tinta"
            >
              {m} <span className="ml-1 font-normal text-stone-400">{n}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* VENDER */}
      <section className="contenedor mt-20">
        <div className="grid overflow-hidden rounded-lg bg-tinta text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <p className="sobretitulo">Vender o permutar</p>
            <h2 className="titulo mt-3 text-[40px] text-white sm:text-[48px]">Te compramos el auto. Así de simple.</h2>
            <p className="mt-4 max-w-md text-stone-300">
              Sin publicar, sin atender llamados y sin recibir desconocidos en tu casa.
            </p>
            <Link href="/vender" className="btn-rojo mt-8">Cotizar mi auto</Link>
          </div>
          <ol className="grid border-t border-white/10 lg:border-l lg:border-t-0">
            {[
              ["Contanos de tu auto", "Marca, modelo, año y kilómetros. Si tenés fotos, mejor."],
              ["Recibí una oferta", "Te respondemos por WhatsApp con un valor estimado."],
              ["Revisión y pago", "Lo vemos en la agencia, confirmamos el precio y cobrás o lo usás como parte de pago."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-5 border-b border-white/10 px-8 py-6 last:border-0 sm:px-12">
                <span className="font-display text-4xl font-extrabold leading-none text-rojo">0{i + 1}</span>
                <div>
                  <p className="text-lg font-semibold">{t}</p>
                  <p className="mt-1 text-[15px] text-stone-400">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* COMPROMISOS */}
      <section className="contenedor mt-20">
        <h2 className="titulo text-[32px]">Cómo trabajamos</h2>
        <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {ag.marca.beneficios.map((b) => (
            <div key={b.titulo} className="border-t-[3px] border-tinta pt-4">
              <h3 className="text-lg font-semibold">{b.titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-stone-600">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VISITANOS */}
      <section className="contenedor mt-20">
        <div className="flex flex-col gap-6 rounded-lg bg-papel p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="titulo text-[32px]">Vení a verlos</h2>
            <p className="mt-2 text-stone-700">
              {ag.direccion}, {ag.ciudad} · {ag.horarios}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={linkMapa(ag)} target="_blank" rel="noopener noreferrer" className="btn-tinta">
              <Icon name="pin" className="size-4" /> Cómo llegar
            </a>
            <a href={telLink(ag.telefono)} className="btn-borde">
              <Icon name="phone" className="size-4" /> Llamar
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
