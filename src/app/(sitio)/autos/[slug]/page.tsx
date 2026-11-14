import type { Metadata } from "next";
import { getAgencia } from "@/lib/agencia";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { getPorSlug, getPublicos, tituloAuto } from "@/lib/autos";
import { getFinanciacion } from "@/lib/negocio";
import { cuotaMensual, formatKm, formatNumero, formatPrecio, whatsappLink } from "@/lib/utils";
import { CarCard, Precio } from "@/components/CarCard";
import { FinancingCalculator } from "@/components/FinancingCalculator";
import { Gallery } from "@/components/Gallery";
import { Icon, WhatsAppIcon } from "@/components/Icon";
import { BotonFavorito } from "@/components/cuenta/ClienteContext";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const auto = await getPorSlug((await params).slug);
  if (!auto) return {};
  return {
    title: `${tituloAuto(auto)} ${auto.anio}`,
    description: `${auto.marca} ${auto.modelo} ${auto.anio}, ${formatKm(auto.km)}, ${auto.transmision}. ${formatPrecio(auto.precio)}. ${auto.descripcion}`,
  };
}

const inspeccion: [string, string[]][] = [
  ["Motor y transmisión", ["Pérdidas de aceite y refrigerante", "Arranque y ralentí", "Embrague / caja"]],
  ["Frenos y suspensión", ["Pastillas y discos", "Amortiguadores", "Tren delantero y cubiertas"]],
  ["Electricidad y confort", ["Batería y alternador", "Luces y tablero", "Aire acondicionado"]],
  ["Carrocería e interior", ["Pintura y chapa", "Cristales y espejos", "Tapizados y comandos"]],
  ["Documentación", ["Informe de dominio", "Verificación policial", "Patentes y multas"]],
];

export default async function AutoPage({ params }: { params: Params }) {
  const auto = await getPorSlug((await params).slug);
  if (!auto) notFound();
  const [autos, fin, ag] = await Promise.all([getPublicos(), getFinanciacion(), getAgencia()]);

  const titulo = `${tituloAuto(auto)} ${auto.anio}`;
  const { tna, anticipoMinimo, plazos } = fin;
  const plazoMax = Math.max(...plazos);
  const cuota = cuotaMensual(auto.precio * (1 - anticipoMinimo), plazoMax, tna);

  const similares = autos
    .filter((a) => a.slug !== auto.slug && (a.carroceria === auto.carroceria || a.marca === auto.marca))
    .slice(0, 4);

  const resumen: [string, string, string][] = [
    ["calendar", "Año", String(auto.anio)],
    ["gauge", "Kilometraje", formatKm(auto.km)],
    ["gear", "Transmisión", auto.transmision],
    ["fuel", "Combustible", auto.combustible],
    ["doc", "Motor", auto.motor],
    ["check", "Carrocería", `${auto.carroceria}, ${auto.puertas} puertas`],
    ["star", "Color", auto.color],
    ["shield", "Dueños", auto.unicoDueno ? "Único dueño" : "Consultar"],
  ].filter(([, , v]) => v.trim() !== "") as [string, string, string][];

  const secciones = [
    ["resumen", "Resumen"],
    ["equipamiento", "Equipamiento"],
    ["inspeccion", "Revisión"],
    ["financiacion", "Financiación"],
  ];

  return (
    <div className="contenedor pt-6">
      <nav className="mb-4 flex flex-wrap gap-1.5 text-sm text-stone-500" aria-label="Migas de pan">
        <Link href="/autos" className="hover:text-tinta">Autos</Link>
        <span aria-hidden>›</span>
        <Link href={`/autos?marca=${encodeURIComponent(auto.marca)}`} className="hover:text-tinta">{auto.marca}</Link>
        <span aria-hidden>›</span>
        <span className="text-tinta">{auto.modelo} {auto.anio}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_372px]">
        <div className="min-w-0">
          <Gallery auto={auto} />

          {/* Subnavegación */}
          <nav className="sticky top-16 z-10 -mx-4 mt-6 flex gap-1 overflow-x-auto border-b border-linea bg-white px-4 md:top-[100px] sm:mx-0 sm:px-0">
            {secciones.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 border-b-2 border-transparent px-3 py-3 text-[15px] font-semibold text-stone-600 hover:border-rojo hover:text-tinta">
                {label}
              </a>
            ))}
          </nav>

          <section id="resumen" className="scroll-mt-40 pt-8">
            <h2 className="titulo text-[28px]">Resumen</h2>
            <dl className="mt-4 grid grid-cols-2 border-l border-t border-linea sm:grid-cols-4">
              {resumen.map(([icono, k, v]) => (
                <div key={k} className="border-b border-r border-linea p-4">
                  <Icon name={icono} className="size-5 text-stone-400" />
                  <dt className="mt-2 text-[13px] text-stone-500">{k}</dt>
                  <dd className="font-semibold leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-stone-700">{auto.descripcion}</p>
          </section>

          <section id="equipamiento" className="scroll-mt-40 pt-12">
            <h2 className="titulo text-[28px]">Equipamiento</h2>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {auto.equipamiento.map((e) => (
                <li key={e} className="flex items-center gap-2.5 border-b border-linea py-3 text-[15px]">
                  <Icon name="check" className="size-5 shrink-0 text-rojo" /> {e}
                </li>
              ))}
            </ul>
          </section>

          <section id="inspeccion" className="scroll-mt-40 pt-12">
            <h2 className="titulo text-[28px]">Revisión antes de la venta</h2>
            <p className="mt-1 text-stone-600">Puntos que controlamos en cada auto antes de publicarlo.</p>
            <div className="mt-5 overflow-hidden rounded-lg border border-linea">
              {inspeccion.map(([area, items]) => (
                <details key={area} className="group border-b border-linea last:border-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                    <span className="font-semibold">{area}</span>
                    <span className="flex items-center gap-3 text-sm text-stone-500">
                      <span className="rounded-sm bg-[#e7f4ec] px-2 py-0.5 text-xs font-semibold text-[#17733c]">Aprobado</span>
                      <Icon name="chevron" className="size-4 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>
                  <ul className="space-y-2 px-5 pb-4">
                    {items.map((i) => (
                      <li key={i} className="flex items-center gap-2 text-[15px] text-stone-700">
                        <Icon name="check" className="size-4 text-[#17733c]" /> {i}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>

          <section id="financiacion" className="scroll-mt-40 pt-12">
            <h2 className="titulo text-[28px]">Simulá tu cuota</h2>
            <div className="mt-5 rounded-lg border border-linea p-5 sm:p-6">
              <FinancingCalculator fin={fin} precio={auto.precio} tituloAuto={titulo} variante="ancho" />
            </div>
          </section>
        </div>

        {/* Panel de compra */}
        <aside className="lg:sticky lg:top-[120px] lg:self-start">
          <div className="rounded-lg border border-linea p-5 sm:p-6">
            {auto.estado === "reservado" && (
              <p className="mb-3 rounded-sm bg-tinta px-3 py-2 text-sm font-semibold text-white">
                Reservado. Consultanos por autos similares.
              </p>
            )}
            <h1 className="text-2xl font-semibold leading-tight">
              {auto.marca} {auto.modelo}
            </h1>
            <p className="mt-1 text-stone-600">{auto.version}</p>
            <p className="mt-1 text-sm text-stone-500">{auto.anio} · {formatKm(auto.km)} · {auto.transmision}</p>

            <div className="mt-5 border-t border-linea pt-4">
              <p className="text-[13px] text-stone-500">Precio de contado</p>
              <Precio valor={auto.precio} className="text-[40px] leading-none" />
              <p className="mt-2 text-sm text-stone-600">
                o desde <span className="font-semibold text-tinta">${formatNumero(cuota)}/mes*</span> con {Math.round(anticipoMinimo * 100)}% de anticipo
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <a
                href={whatsappLink(ag.whatsapp, `Hola, me interesa el ${titulo} (${formatKm(auto.km)}) que vi en la web. ¿Sigue disponible?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-rojo w-full"
              >
                <WhatsAppIcon className="size-5" /> Me interesa este auto
              </a>
              <a
                href={whatsappLink(ag.whatsapp, `Hola, quiero coordinar una visita y prueba de manejo del ${titulo}. ¿Qué días y horarios tienen?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-borde w-full"
              >
                <Icon name="calendar" className="size-5" /> Agendar visita y prueba de manejo
              </a>
              <Link href="/vender?modo=cambio" className="btn-borde w-full">
                <Icon name="swap" className="size-5" /> Entregar mi usado
              </Link>
              <BotonFavorito autoId={auto.id} conTexto className="btn-borde w-full" />
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-linea pt-4 text-sm text-stone-700">
              {site.beneficios.map((b) => (
                <li key={b.titulo} className="flex items-start gap-2.5">
                  <Icon name={b.icono} className="mt-px size-5 shrink-0 text-stone-400" /> {b.titulo}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 rounded-lg bg-papel p-5">
            <p className="flex items-start gap-2 font-semibold">
              <Icon name="pin" className="mt-0.5 size-5 shrink-0 text-rojo" />
              Este auto está en {ag.ciudad}, {ag.provincia}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-stone-700">{ag.traslado}</p>
            <a
              href={whatsappLink(ag.whatsapp, `Hola, me interesa el ${titulo} pero no soy de ${ag.ciudad}. Soy de ______. ¿Cómo podemos hacer con el traslado?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-borde mt-4 w-full"
            >
              Soy de otra ciudad: consultar traslado
            </a>
          </div>
        </aside>
      </div>

      {similares.length > 0 && (
        <section className="mt-20">
          <h2 className="titulo text-[32px]">Autos similares</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similares.map((a) => <CarCard key={a.slug} auto={a} fin={fin} />)}
          </div>
        </section>
      )}
    </div>
  );
}
