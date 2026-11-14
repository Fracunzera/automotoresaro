import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { autos, getAuto, tituloAuto } from "@/data/autos";
import { formatKm, formatPrecio, whatsappLink } from "@/lib/utils";
import { CarCard } from "@/components/CarCard";
import { FinancingCalculator } from "@/components/FinancingCalculator";
import { Gallery } from "@/components/Gallery";
import { Icon, WhatsAppIcon } from "@/components/Icon";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return autos.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const auto = getAuto((await params).slug);
  if (!auto) return {};
  return {
    title: `${tituloAuto(auto)} ${auto.anio}`,
    description: `${auto.marca} ${auto.modelo} ${auto.anio}, ${formatKm(auto.km)}, ${auto.transmision}. ${formatPrecio(auto.precio)}. ${auto.descripcion}`,
  };
}

const inspeccion = [
  { area: "Motor y transmisión", items: ["Sin pérdidas de aceite ni refrigerante", "Arranque y ralentí normales", "Cambios suaves"] },
  { area: "Frenos y suspensión", items: ["Pastillas y discos", "Amortiguadores", "Tren delantero"] },
  { area: "Electricidad", items: ["Batería y alternador", "Luces y tablero", "Aire acondicionado"] },
  { area: "Carrocería e interior", items: ["Pintura y chapa", "Cristales", "Tapizados y comandos"] },
  { area: "Documentación", items: ["Informe de dominio", "Verificación policial", "Libre de deuda de patentes y multas"] },
];

export default async function AutoPage({ params }: { params: Params }) {
  const auto = getAuto((await params).slug);
  if (!auto) notFound();

  const titulo = tituloAuto(auto);
  const similares = autos
    .filter((a) => a.slug !== auto.slug && (a.carroceria === auto.carroceria || a.marca === auto.marca))
    .slice(0, 3);

  const ficha: [string, string, string][] = [
    ["calendar", "Año", String(auto.anio)],
    ["gauge", "Kilómetros", formatKm(auto.km)],
    ["gear", "Transmisión", auto.transmision],
    ["fuel", "Combustible", auto.combustible],
  ];
  const detalles: [string, string][] = [
    ["Marca", auto.marca],
    ["Modelo", auto.modelo],
    ["Versión", auto.version],
    ["Motor", auto.motor],
    ["Carrocería", auto.carroceria],
    ["Puertas", String(auto.puertas)],
    ["Color", auto.color],
    ["Único dueño", auto.unicoDueno ? "Sí" : "No"],
    ["Services oficiales", auto.serviceOficial ? "Sí" : "No informado"],
  ];

  return (
    <div className="contenedor py-8">
      <nav className="mb-5 text-sm text-slate-500" aria-label="Migas de pan">
        <Link href="/autos" className="hover:text-marca-600">Autos</Link> <span aria-hidden>/</span>{" "}
        <Link href={`/autos?marca=${encodeURIComponent(auto.marca)}`} className="hover:text-marca-600">{auto.marca}</Link>{" "}
        <span aria-hidden>/</span> <span className="text-slate-700">{auto.modelo}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Columna principal */}
        <div className="min-w-0 space-y-8">
          <Gallery auto={auto} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ficha.map(([icono, label, valor]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <Icon name={icono} className="size-5 text-marca-600" />
                <p className="mt-2 text-xs text-slate-500">{label}</p>
                <p className="font-semibold text-slate-900">{valor}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Descripción</h2>
            <p className="mt-2 leading-relaxed text-slate-700">{auto.descripcion}</p>
            <h3 className="mt-6 font-semibold text-slate-900">Equipamiento</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {auto.equipamiento.map((e) => (
                <li key={e} className="flex items-center gap-2 text-sm text-slate-700">
                  <Icon name="check" className="size-5 text-green-600" /> {e}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Ficha técnica</h2>
            <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {detalles.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right font-medium text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-green-50 text-green-600">
                <Icon name="shield" className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Informe de revisión</h2>
                <p className="text-sm text-slate-500">Lo que revisamos antes de publicar este auto.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {inspeccion.map((s) => (
                <div key={s.area} className="rounded-xl bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{s.area}</h3>
                  <ul className="mt-2 space-y-1.5">
                    {s.items.map((i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon name="check" className="size-4 text-green-600" /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Columna lateral */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {auto.reservado && (
              <span className="mb-3 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Reservado</span>
            )}
            <h1 className="text-2xl font-bold leading-tight text-slate-900">{auto.marca} {auto.modelo}</h1>
            <p className="text-slate-500">{auto.version} · {auto.anio} · {formatKm(auto.km)}</p>
            <p className="mt-4 text-3xl font-extrabold text-slate-900">{formatPrecio(auto.precio)}</p>
            <p className="text-xs text-slate-500">Precio de contado</p>

            <div className="mt-5 space-y-2.5">
              <a
                href={whatsappLink(`Hola! Me interesa el ${titulo} ${auto.anio} que vi en la web. ¿Sigue disponible?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full"
              >
                <WhatsAppIcon className="size-5" /> Consultar por WhatsApp
              </a>
              <a
                href={whatsappLink(`Hola! Quiero coordinar una visita y prueba de manejo del ${titulo} ${auto.anio}. ¿Qué días tienen disponible?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secundario w-full"
              >
                <Icon name="calendar" className="size-5" /> Agendar visita y test drive
              </a>
              <Link href="/vender" className="btn-secundario w-full">
                <Icon name="swap" className="size-5" /> Entregar mi usado
              </Link>
            </div>

            <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-600">
              {site.beneficios.map((b) => (
                <li key={b.titulo} className="flex items-center gap-2">
                  <Icon name={b.icono} className="size-4 text-marca-600" /> {b.titulo}
                </li>
              ))}
            </ul>
          </div>

          <FinancingCalculator precio={auto.precio} tituloAuto={`${titulo} ${auto.anio}`} />
        </aside>
      </div>

      {similares.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">También te puede interesar</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similares.map((a) => <CarCard key={a.slug} auto={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}
