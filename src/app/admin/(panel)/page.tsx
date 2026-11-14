import Link from "next/link";
import { getTodos } from "@/lib/autos";
import { leerNegocio } from "@/lib/negocio";
import { MODO_COMISION_TEXTO, calcularGanancia } from "@/lib/negocio-tipos";
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

export default async function Tablero() {
  const [autos, negocio] = await Promise.all([getTodos(), leerNegocio()]);
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
      return { auto: a, precio, fecha: new Date(neg.fechaVenta!), ganancia: calcularGanancia(neg, precio, ajustes.comisionMinima) };
    })
    .sort((x, y) => +y.fecha - +x.fecha);
  const delMes = (offset: number) => {
    const ref = new Date(hoy.getFullYear(), hoy.getMonth() - offset, 1);
    return vendidos.filter((v) => v.fecha.getFullYear() === ref.getFullYear() && v.fecha.getMonth() === ref.getMonth());
  };
  const esteMes = delMes(0);
  const mesPasado = delMes(1);
  const gananciaMes = esteMes.reduce((s, v) => s + (v.ganancia ?? 0), 0);
  const facturadoMes = esteMes.reduce((s, v) => s + v.precio, 0);

  // Alertas
  const dias = (iso: string) => Math.floor((+hoy - +new Date(iso)) / 86_400_000);
  const viejos = stock.filter((a) => !a.ejemplo && dias(a.creado) >= ajustes.diasAlerta);
  const sinFotos = stock.filter((a) => a.fotos.length === 0 && !a.ejemplo);
  const hayEjemplos = autos.some((a) => a.ejemplo);

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

      {hayEjemplos && (
        <div className="rounded-lg border-2 border-[#e6c35c] bg-[#fff8e1] p-5">
          <p className="text-lg font-bold">La página todavía muestra autos de ejemplo</p>
          <p className="mt-1 text-lg text-stone-700">
            Son autos inventados para que se vea cómo queda. Cuando cargues tus autos, borralos con este botón.
          </p>
          <BotonBorrarEjemplos />
        </div>
      )}

      {/* Accesos directos */}
      <section>
        <h2 className="text-xl font-bold">¿Qué querés hacer?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/autos/nuevo" className="btn-g justify-start bg-rojo text-white hover:bg-rojo-oscuro">+ Cargar un auto nuevo</Link>
          <Link href="/admin/autos" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Ver y cambiar mis autos</Link>
          <Link href="/admin/ajustes#comisiones" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Cambiar comisiones</Link>
          <Link href="/admin/ajustes#financiacion" className="btn-g justify-start border-2 border-tinta bg-white hover:bg-papel">Cambiar tasa y cuotas</Link>
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
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Dato titulo="Valor de todo el stock" valor={pesos(valorStock)} detalle="Suma de los precios publicados" />
          <Dato
            titulo="Ganancia si se vende todo"
            valor={pesos(gananciaStock)}
            detalle={sinDatos.length ? `Faltan datos de ${sinDatos.length} auto${sinDatos.length > 1 ? "s" : ""} (ver abajo)` : "Con los precios actuales"}
          />
        </div>
      </section>

      {/* Ventas */}
      <section>
        <h2 className="text-xl font-bold">Ventas de {MESES[hoy.getMonth()]}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Dato titulo="Autos vendidos" valor={String(esteMes.length)} detalle={`El mes pasado: ${mesPasado.length}`} />
          <Dato titulo="Total vendido" valor={pesos(facturadoMes)} />
          <Dato titulo="Ganancia del mes" valor={pesos(gananciaMes)} />
        </div>
        {vendidos.length > 0 ? (
          <div className="tarjeta-g mt-3 divide-y-2 divide-linea">
            <p className="px-5 py-3 text-base font-semibold text-stone-600">Últimas ventas</p>
            {vendidos.slice(0, 5).map((v) => (
              <div key={v.auto.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3 text-lg">
                <span className="font-semibold">{v.auto.marca} {v.auto.modelo} {v.auto.anio}</span>
                <span className="text-stone-600">
                  {v.fecha.getDate()}/{v.fecha.getMonth() + 1} · {pesos(v.precio)}
                  {v.ganancia !== null && <> · ganancia <b className="text-tinta">{pesos(v.ganancia)}</b></>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-lg text-stone-600">
            Cuando vendas un auto, tocá <b>“Lo vendí”</b> en Mis autos y acá vas a ver las ventas y la ganancia.
          </p>
        )}
      </section>

      {/* Avisos */}
      {(viejos.length > 0 || sinFotos.length > 0 || sinDatos.filter((a) => !a.ejemplo).length > 0) && (
        <section>
          <h2 className="text-xl font-bold">Para revisar</h2>
          <div className="mt-3 space-y-3">
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
            {sinDatos.filter((a) => !a.ejemplo).length > 0 && (
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
      <section className="tarjeta-g p-5">
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
      </section>
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
