import Link from "next/link";
import { site } from "@/config/site";
import { autos } from "@/data/autos";
import { formatPrecio } from "@/lib/utils";
import { CarCard } from "@/components/CarCard";
import { Icon } from "@/components/Icon";

const tipos = ["SUV", "Pick-up", "Sedán", "Hatchback", "Utilitario"] as const;

const pasos = [
  { n: "1", titulo: "Elegí tu auto", texto: "Mirá fotos, informe de revisión y simulá la cuota desde tu casa." },
  { n: "2", titulo: "Coordiná una visita", texto: "Escribinos por WhatsApp, vení a verlo y hacé la prueba de manejo." },
  { n: "3", titulo: "Llevátelo", texto: "Entregás tu usado, financiás el resto y nosotros nos encargamos de los papeles." },
];

export default function Home() {
  const destacados = autos.filter((a) => a.destacado && !a.reservado).slice(0, 4);
  const marcas = Array.from(new Set(autos.map((a) => a.marca))).sort();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-marca-950 text-white">
        <div className="absolute -right-40 -top-40 size-[520px] rounded-full bg-marca-600/40 blur-3xl" aria-hidden />
        <div className="absolute -bottom-48 -left-24 size-[420px] rounded-full bg-acento-500/20 blur-3xl" aria-hidden />
        <div className="contenedor relative grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-acento-400">
              <Icon name="shield" className="size-4" /> Autos usados revisados y con papeles al día
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Comprá y vendé tu auto <span className="text-acento-400">sin vueltas</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">{site.eslogan}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/autos" className="btn-acento">Ver autos disponibles <Icon name="arrow" className="size-4" /></Link>
              <Link href="/vender" className="btn border border-white/30 text-white hover:bg-white/10">Cotizar mi auto</Link>
            </div>
          </div>

          {/* Buscador */}
          <form action="/autos" className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
            <h2 className="text-lg font-bold">¿Qué auto estás buscando?</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="etiqueta" htmlFor="q">Modelo</label>
                <input id="q" name="q" className="campo" placeholder="Ej: Corolla, Amarok, 208…" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="marca">Marca</label>
                <select id="marca" name="marca" className="campo" defaultValue="">
                  <option value="">Todas</option>
                  {marcas.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="etiqueta" htmlFor="precioMax">Precio hasta</label>
                <select id="precioMax" name="precioMax" className="campo" defaultValue="">
                  <option value="">Sin límite</option>
                  {[15000000, 20000000, 25000000, 30000000, 40000000].map((n) => (
                    <option key={n} value={n}>{formatPrecio(n)}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primario mt-6 w-full">
              <Icon name="search" className="size-4" /> Buscar
            </button>
            <p className="mt-4 text-center text-sm text-slate-500">
              {autos.filter((a) => !a.reservado).length} autos disponibles hoy
            </p>
          </form>
        </div>
      </section>

      {/* TIPOS */}
      <section className="contenedor -mt-px py-10">
        <div className="flex flex-wrap justify-center gap-3">
          {tipos.map((t) => (
            <Link
              key={t}
              href={`/autos?carroceria=${encodeURIComponent(t)}`}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-marca-500 hover:text-marca-600"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="contenedor py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Autos destacados</h2>
            <p className="mt-1 text-slate-500">Seleccionados y revisados por nuestro equipo.</p>
          </div>
          <Link href="/autos" className="hidden text-sm font-semibold text-marca-600 hover:underline sm:block">
            Ver todos →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((a) => <CarCard key={a.slug} auto={a} />)}
        </div>
        <Link href="/autos" className="btn-secundario mt-6 w-full sm:hidden">Ver todos los autos</Link>
      </section>

      {/* BENEFICIOS */}
      <section className="contenedor py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">¿Por qué comprar con nosotros?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.beneficios.map((b) => (
            <div key={b.titulo} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid size-12 place-items-center rounded-xl bg-marca-50 text-marca-600">
                <Icon name={b.icono} className="size-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{b.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-white py-16">
        <div className="contenedor">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Tu próximo auto en 3 pasos</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {pasos.map((p) => (
              <div key={p.n} className="text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-acento-500 text-xl font-extrabold text-marca-950">{p.n}</div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{p.titulo}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-600">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VENDER CTA */}
      <section className="contenedor py-16">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-marca-600 to-marca-900 p-8 text-white sm:p-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">¿Querés vender o cambiar tu auto?</h2>
            <p className="mt-3 max-w-xl text-marca-100">
              Te lo cotizamos en el día. Te pagamos en el acto o lo tomamos como parte de pago de tu próximo auto.
            </p>
          </div>
          <div className="lg:text-right">
            <Link href="/vender" className="btn-acento">Cotizar mi auto gratis <Icon name="arrow" className="size-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
