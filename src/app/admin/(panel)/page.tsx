import { esTienda } from "@/lib/rubro";
import { TableroTienda } from "@/components/admin/TableroTienda";
import Link from "next/link";
import { getTodos } from "@/lib/autos";
import { leerNegocio } from "@/lib/negocio";
import { leerClientes } from "@/lib/clientes";
import { usuarioActual } from "@/lib/usuarios";
import { contarNuevas } from "@/lib/consultas";
import { MODO_COMISION_TEXTO, calcularGanancia, completarNegocio, diasParaVencer } from "@/lib/negocio-tipos";
import { formatNumero } from "@/lib/utils";
import { BotonBorrarEjemplos } from "@/components/admin/BotonBorrarEjemplos";

const pesos = (n: number) => `$ ${formatNumero(n)}`;
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function Dato({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="tarjeta-g p-5">
      <p className="text-base font-semibold text-stone-600">{titulo}</p>
      <p className="mt-1 break-words font-display text-[36px] font-bold leading-none tracking-tight sm:text-[40px]">{valor}</p>
      {detalle && <p className="mt-2 text-base text-stone-600">{detalle}</p>}
    </div>
  );
}

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Tablero({ searchParams }: { searchParams: SP }) {
  if (esTienda) {
    const [yo, sp] = await Promise.all([usuarioActual(), searchParams]);
    return <TableroTienda esAdmin={yo?.rol === "admin"} sinPermiso={!!sp.sinPermiso} />;
  }
  const [autos, negocio, clientes, yo, sp, consultasNuevas] = await Promise.all([getTodos(), leerNegocio(), leerClientes(), usuarioActual(), searchParams, contarNuevas()]);
  const esAdmin = yo?.rol === "admin";
  const { ajustes } = negocio;
  const n = (id: string) => negocio.autos[id];

  const enVenta = autos.filter((a) => a.estado === "publicado");
  const reservados = autos.filter((a) => a.estado === "reservado");
  const ocultos = autos.filter((a) => a.estado === "oculto");
  const stock = [...enVenta, ...reservados];

  const valorStock = stock.reduce((s, a) => s + a.precio, 0);
  let gananciaStock = 0;
  const sinDatos: typeof autos = [];
  for (const a of stock) {
    const g = n(a.id) ? calcularGanancia(n(a.id), a.precio, ajustes.comisionMinima) : null;
    if (g === null) sinDatos.push(a);
    else gananciaStock += g;
  }
  const deClientes = stock.filter((a) => n(a.id)?.tipo === "consignacion").length;

  // Ventas por mes
  const hoy = new Date();
  const vendidos = autos
    .filter((a) => a.estado === "vendido" && n(a.id)?.fechaVenta)
    .map((a) => {
      const neg = n(a.id)!;
      const precio = neg.precioVenta ?? a.precio;
      return { auto: a, precio, fecha: new Date(neg.fechaVenta!), vendidoPor: neg.vendidoPor, ganancia: calcularGanancia(neg, precio, ajustes.comisionMinima) };
    })
    .sort((x, y) => +y.fecha - +x.fecha);
  const delMes = (offset: number) => {
    const ref = new Date(hoy.getFullYear(), hoy.getMonth() - offset, 1);
    return vendidos.filter((v) => v.fecha.getFullYear() === ref.getFullYear() && v.fecha.getMonth() === ref.getMonth());
  };
  const esteMes = delMes(0);
  const mesPasado = delMes(1);
  const porVendedor = Object.entries(
    esteMes.reduce<Record<string, number>>((acc, v) => {
      const k = v.vendidoPor || "Sin registrar";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const retirosMes = autos.filter((a) => {
    const r = a.estado === "retirado" ? n(a.id)?.retiro : undefined;
    if (!r) return false;
    const f = new Date(r.fecha);
    return f.getFullYear() === hoy.getFullYear() && f.getMonth() === hoy.getMonth();
  });
  const cobradoRetiros = retirosMes.reduce((s, a) => s + (n(a.id)?.retiro?.cobrado ?? 0), 0);
  const gananciaMes = esteMes.reduce((s, v) => s + (v.ganancia ?? 0), 0) + cobradoRetiros;
  const facturadoMes = esteMes.reduce((s, v) => s + v.precio, 0);

  // Alertas
  const dias = (iso: string) => Math.floor((+hoy - +new Date(iso)) / 86_400_000);
  const viejos = stock.filter((a) => !a.ejemplo && dias(a.creado) >= ajustes.diasAlerta);
  const sinFotos = stock.filter((a) => a.fotos.length === 0 && !a.ejemplo);
  const hayEjemplos = autos.some((a) => a.ejemplo);
  const porVencer = autos
    .filter((a) => (a.estado === "publicado" || a.estado === "reservado" || a.estado === "oculto") && n(a.id)?.tipo === "consignacion")
    .map((a) => ({ a, dias: diasParaVencer(completarNegocio(n(a.id), ajustes)) }))
    .filter((x): x is { a: (typeof autos)[number]; dias: number } => x.dias !== null && x.dias <= ajustes.consignacion.diasAvisoVencimiento)
    .sort((x, y) => x.dias - y.dias);

  const comisionTexto =
    ajustes.comisionModo === "porcentaje"
      ? `${ajustes.comisionValor}% del precio de venta`
      : ajustes.comisionModo === "fijo"
        ? `${pesos(ajustes.comisionValor)} fijos por auto`
        : "Se acuerda un precio para el dueño en cada auto";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Resumen</h1>
        <p className="mt-1 text-lg text-stone-600">Así está la agencia hoy, {hoy.getDate()} de {MESES[hoy.getMonth()]}.</p>
      </div>

      {esAdmin && hayEjemplos && (
        <div className="rounded-lg border-2 border-[#e6c35c] bg-[#fff8e1] p-5">
          <p className="text-lg font-bold">La página todavía muestra autos de ejemplo</p>
          <p className="mt-1 text-lg text-stone-700">
            Son autos inventados para que se vea cómo queda. Cuando cargues tus autos, borralos con este botón.
          </p>
          <BotonBorrarEjemplos />
        </div>
      )}

      {sp.sinPermiso && (
        <p role="alert" className="rounded-lg border-2 border-rojo bg-rojo-claro p-4 text-lg font-semibold text-rojo-oscuro">
          Esa sección es solo para administradores.
        </p>
      )}

      {consultasNuevas > 0 && (
        <Link href="/admin/consultas" className="block rounded-lg bg-rojo p-5 text-white transition-colors hover:bg-rojo-oscuro">
          <p className="text-2xl font-bold">
            {consultasNuevas === 1 ? "Hay 1 auto nuevo para revisar y publicar" : `Hay ${consultasNuevas} autos nuevos para revisar y publicar`}
          </p>
          <p className="mt-1 text-lg">Los cargaron sus dueños en “Vendé tu auto”. Tocá acá para verlos →</p>
        </Link>
      )}

      {/* Accesos directos */}
      <section>
        <h2 className="text-xl font-bold">¿Qué querés hacer?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/autos/nuevo" className="btn-g justify-start bg-rojo text-white hover:bg-rojo-oscuro">+ Cargar un auto nuevo</Link>
          <Link href="/admin/autos" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Ver y cambiar mis autos</Link>
          {esAdmin ? (
            <>
              <Link href="/admin/ajustes#comisiones" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Cambiar comisiones</Link>
              <Link href="/admin/agencia" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Cambiar datos de la agencia</Link>
              <Link href="/admin/empleados" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Empleados</Link>
              <Link href="/admin/ajustes#financiacion" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Cambiar tasa y cuotas</Link>
            </>
          ) : (
            <Link href="/admin/clientes" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Ver clientes</Link>
          )}
        </div>
      </section>

      {/* Stock */}
      <section>
        <h2 className="text-xl font-bold">Autos</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Dato titulo="En venta" valor={String(enVenta.length)} detalle={ocultos.length ? `Y ${ocultos.length} oculto${ocultos.length > 1 ? "s" : ""}` : undefined} />
          <Dato titulo="Reservados" valor={String(reservados.length)} />
          <div className="col-span-2 sm:col-span-1"><Dato titulo="De clientes (consignación)" valor={String(deClientes)} detalle={`de ${stock.length} en total`} /></div>
        </div>
        {esAdmin && <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Dato titulo="Valor de todo el stock" valor={pesos(valorStock)} detalle="Suma de los precios publicados" />
          <Dato
            titulo="Ganancia si se vende todo"
            valor={pesos(gananciaStock)}
            detalle={sinDatos.length ? `Faltan datos de ${sinDatos.length} auto${sinDatos.length > 1 ? "s" : ""} (ver abajo)` : "Con los precios actuales"}
          />
        </div>}
      </section>

      {/* Ventas */}
      <section>
        <h2 className="text-xl font-bold">Ventas de {MESES[hoy.getMonth()]}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Dato titulo="Autos vendidos" valor={String(esteMes.length)} detalle={`El mes pasado: ${mesPasado.length}`} />
          {esAdmin && <Dato titulo="Total vendido" valor={pesos(facturadoMes)} />}
          {esAdmin && <Dato titulo="Ganancia del mes" valor={pesos(gananciaMes)} detalle={cobradoRetiros > 0 ? `Incluye ${pesos(cobradoRetiros)} cobrados por retiros` : undefined} />}
        </div>
        {esAdmin && porVendedor.length > 1 && (
          <div className="tarjeta-g mt-3 divide-y-2 divide-linea">
            <p className="px-5 py-3 text-base font-semibold text-stone-600">Ventas del mes por vendedor</p>
            {porVendedor.map(([quien, cant]) => (
              <div key={quien} className="flex justify-between px-5 py-3 text-lg">
                <span className="font-semibold">{quien}</span>
                <span>{cant} {cant === 1 ? "auto" : "autos"}</span>
              </div>
            ))}
          </div>
        )}
        {vendidos.length > 0 ? (
          <div className="tarjeta-g mt-3 divide-y-2 divide-linea">
            <p className="px-5 py-3 text-base font-semibold text-stone-600">Últimas ventas</p>
            {vendidos.slice(0, 5).map((v) => (
              <div key={v.auto.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3 text-lg">
                <span className="font-semibold">{v.auto.marca} {v.auto.modelo} {v.auto.anio}</span>
                <span className="text-stone-600">
                  {v.fecha.getDate()}/{v.fecha.getMonth() + 1}
                  {v.vendidoPor && <> · vendió {v.vendidoPor.split(" ")[0]}</>}
                  {esAdmin && <> · {pesos(v.precio)}</>}
                  {esAdmin && v.ganancia !== null && <> · ganancia <b className="text-tinta">{pesos(v.ganancia)}</b></>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-lg text-stone-600">
            Cuando vendas un auto, tocá <b>“Lo vendí”</b> en Mis autos y acá vas a ver las ventas{esAdmin ? " y la ganancia" : ""}.
          </p>
        )}
      </section>

      {/* Clientes */}
      <section>
        <h2 className="text-xl font-bold">Clientes de la página</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Dato titulo="Registrados" valor={String(clientes.length)} detalle={`${clientes.filter((c) => new Date(c.creado).getMonth() === hoy.getMonth() && new Date(c.creado).getFullYear() === hoy.getFullYear()).length} nuevos este mes`} />
          <Dato titulo="Aceptan mails" valor={String(clientes.filter((c) => c.aceptaMails).length)} />
          <div className="col-span-2 sm:col-span-1">
            <Dato titulo="Autos guardados en favoritos" valor={String(clientes.reduce((s, c) => s + c.favoritos.length, 0))} />
          </div>
        </div>
        {(() => {
          const top = stock
            .map((a) => ({ a, n: clientes.filter((c) => c.favoritos.includes(a.id)).length }))
            .filter((x) => x.n > 0)
            .sort((x, y) => y.n - x.n)
            .slice(0, 5);
          return top.length > 0 ? (
            <div className="tarjeta-g mt-3 divide-y-2 divide-linea">
              <p className="px-5 py-3 text-base font-semibold text-stone-600">Los autos que más gustan</p>
              {top.map(({ a, n }) => (
                <Link key={a.id} href={`/admin/autos/${a.id}`} className="flex justify-between gap-4 px-5 py-3 text-lg hover:bg-papel">
                  <span className="font-semibold">{a.marca} {a.modelo} {a.anio}</span>
                  <span className="text-rojo">♥ {n}</span>
                </Link>
              ))}
            </div>
          ) : null;
        })()}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin/clientes" className="btn-g border-2 border-tinta bg-white hover:bg-papel">Ver clientes</Link>
          {esAdmin && <Link href="/admin/mails" className="btn-g border-2 border-tinta bg-white hover:bg-papel">Mandar un mail</Link>}
        </div>
      </section>

      {/* Avisos */}
      {(porVencer.length > 0 || viejos.length > 0 || sinFotos.length > 0 || (esAdmin && sinDatos.filter((a) => !a.ejemplo).length > 0)) && (
        <section>
          <h2 className="text-xl font-bold">Para revisar</h2>
          <div className="mt-3 space-y-3">
            {porVencer.length > 0 && (
              <Aviso
                titulo={`${porVencer.length === 1 ? "Un acuerdo de consignación vence" : `${porVencer.length} acuerdos de consignación vencen`} pronto`}
                texto="Hablá con el dueño para renovarlo, bajar el precio o que lo retire."
                autos={porVencer.map(({ a, dias }) => ({
                  id: a.id,
                  texto: `${a.marca} ${a.modelo} ${a.anio}${n(a.id)?.duenoNombre ? ` (${n(a.id)!.duenoNombre})` : ""} · ${dias < 0 ? `venció hace ${-dias} días` : dias === 0 ? "vence hoy" : `vence en ${dias} días`}`,
                }))}
              />
            )}
            {viejos.length > 0 && (
              <Aviso
                titulo={`${viejos.length} auto${viejos.length > 1 ? "s llevan" : " lleva"} más de ${ajustes.diasAlerta} días a la venta`}
                texto="Quizás convenga revisar el precio o mejorar las fotos."
                autos={viejos.map((a) => ({ id: a.id, texto: `${a.marca} ${a.modelo} ${a.anio} · ${dias(a.creado)} días` }))}
              />
            )}
            {sinFotos.length > 0 && (
              <Aviso
                titulo={`${sinFotos.length} auto${sinFotos.length > 1 ? "s" : ""} sin fotos`}
                texto="Los autos con fotos reciben muchas más consultas."
                autos={sinFotos.map((a) => ({ id: a.id, texto: `${a.marca} ${a.modelo} ${a.anio}` }))}
              />
            )}
            {esAdmin && sinDatos.filter((a) => !a.ejemplo).length > 0 && (
              <Aviso
                titulo="Autos sin datos de compra o comisión"
                texto="Cargá cuánto pagaste (o la comisión, si es de un cliente) para calcular la ganancia."
                autos={sinDatos.filter((a) => !a.ejemplo).map((a) => ({ id: a.id, texto: `${a.marca} ${a.modelo} ${a.anio}` }))}
              />
            )}
          </div>
        </section>
      )}

      {/* Ajustes actuales */}
      {esAdmin && <section className="tarjeta-g p-5">
        <h2 className="text-xl font-bold">Cómo estás cobrando hoy</h2>
        <dl className="mt-3 space-y-2 text-lg">
          <div>
            <dt className="inline text-stone-600">Autos de clientes: </dt>
            <dd className="inline font-semibold">{comisionTexto}</dd>
            {ajustes.comisionMinima > 0 && <dd className="inline text-stone-600"> (mínimo {pesos(ajustes.comisionMinima)})</dd>}
          </div>
          <div>
            <dt className="inline text-stone-600">Financiación: </dt>
            <dd className="inline font-semibold">
              TNA {ajustes.financiacion.tna}% · anticipo desde {ajustes.financiacion.anticipoMinimo}% · {ajustes.financiacion.plazos.join(", ")} cuotas
            </dd>
          </div>
        </dl>
        <p className="mt-1 text-base text-stone-500">Modo de comisión: {MODO_COMISION_TEXTO[ajustes.comisionModo]}</p>
        <Link href="/admin/ajustes" className="btn-g mt-4 border-2 border-tinta bg-white hover:bg-papel">Cambiar</Link>
      </section>}
    </div>
  );
}

function Aviso({ titulo, texto, autos }: { titulo: string; texto: string; autos: { id: string; texto: string }[] }) {
  return (
    <div className="tarjeta-g p-5">
      <p className="text-lg font-bold">{titulo}</p>
      <p className="text-lg text-stone-600">{texto}</p>
      <ul className="mt-3 space-y-2">
        {autos.slice(0, 6).map((a) => (
          <li key={a.id}>
            <Link href={`/admin/autos/${a.id}`} className="text-lg font-semibold text-rojo underline underline-offset-4">
              {a.texto} → Editar
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
