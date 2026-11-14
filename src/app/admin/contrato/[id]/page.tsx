import { esTienda } from "@/lib/rubro";
import { requerirPagina } from "@/lib/usuarios";
import { notFound } from "next/navigation";
import { getAgencia } from "@/lib/agencia";
import { getPorId } from "@/lib/autos";
import { leerNegocio } from "@/lib/negocio";
import { completarNegocio, fechaVencimiento, PAPELES } from "@/lib/negocio-tipos";
import { formatKm, formatNumero } from "@/lib/utils";
import { BotonImprimir } from "@/components/admin/BotonImprimir";

export const dynamic = "force-dynamic";

const pesos = (n: number) => `$ ${formatNumero(n)}`;
const fechaLarga = (d: Date) => d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
const blanco = (v: string, largo = 24) => (v ? v : "_".repeat(largo));

/**
 * Contrato de consignación listo para imprimir y firmar.
 * MODELO ORIENTATIVO: revisarlo con un abogado antes de usarlo.
 */
export default async function Contrato({ params }: { params: Promise<{ id: string }> }) {
  if (esTienda) notFound();
  await requerirPagina("admin");
  const { id } = await params;
  const [auto, negocio, ag] = await Promise.all([getPorId(id), leerNegocio(), getAgencia()]);
  if (!auto) notFound();
  const n = completarNegocio(negocio.autos[id], negocio.ajustes);
  if (!n.fechaIngreso) n.fechaIngreso = auto.creado.slice(0, 10);
  const [a, m, d] = n.fechaIngreso.split("-").map(Number);
  const ingreso = new Date(a, m - 1, d);
  const vence = fechaVencimiento(n);

  const comision =
    n.comisionModo === "porcentaje"
      ? `el ${n.comisionValor}% del precio final de venta${negocio.ajustes.comisionMinima > 0 ? `, con un mínimo de ${pesos(negocio.ajustes.comisionMinima)}` : ""}`
      : n.comisionModo === "fijo"
        ? `la suma fija de ${pesos(n.comisionValor)}`
        : `la diferencia entre el precio final de venta y el precio neto acordado para EL CONSIGNANTE de ${pesos(n.comisionValor)}`;

  let clausula = 0;
  // Se numeran en orden de aparición (la de exclusividad es opcional)
  const c = (titulo: string, children: React.ReactNode) => {
    clausula++;
    return (
      <p key={titulo} className="mt-3">
        <b>{["", "PRIMERA", "SEGUNDA", "TERCERA", "CUARTA", "QUINTA", "SEXTA", "SÉPTIMA", "OCTAVA", "NOVENA", "DÉCIMA", "UNDÉCIMA"][clausula]} – {titulo}.</b>{" "}
        {children}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-papel py-6 print:bg-white print:py-0">
      <div className="mx-auto max-w-[800px] px-4 print:hidden">
        <div className="mb-4 rounded-lg border-2 border-[#e6c35c] bg-[#fff8e1] p-4 text-lg">
          <b>Modelo orientativo.</b> Antes de usarlo por primera vez, pedile a un abogado que lo revise y lo adapte. Completá a mano lo que esté en blanco.
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          <BotonImprimir />
          <a href={`/admin/autos/${id}`} className="btn-g border-2 border-tinta bg-white hover:bg-papel">Volver al auto</a>
        </div>
      </div>

      <article className="mx-auto max-w-[800px] bg-white px-8 py-10 font-serif text-[15px] leading-relaxed text-black shadow-sm print:max-w-none print:px-0 print:py-0 print:text-[12pt] print:shadow-none" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <h1 className="text-center text-xl font-bold uppercase tracking-wide">Contrato de consignación de automotor</h1>

        <p className="mt-6">
          En la ciudad de {ag.ciudad}, provincia de {ag.provincia}, a los {ingreso.getDate()} días del mes de{" "}
          {ingreso.toLocaleDateString("es-AR", { month: "long" })} de {ingreso.getFullYear()}, entre{" "}
          <b>{blanco(n.duenoNombre, 30)}</b>, DNI {blanco(n.duenoDni, 12)}, con domicilio en {blanco(n.duenoDomicilio, 34)}, teléfono{" "}
          {blanco(n.duenoTelefono, 14)}, en adelante <b>EL CONSIGNANTE</b>; y <b>{blanco(ag.legal.titular, 30)}</b>, CUIT{" "}
          {blanco(ag.legal.cuit, 14)}, en su carácter de titular de <b>{ag.nombre}</b>, con domicilio en {ag.direccion}, {ag.ciudad},
          en adelante <b>LA AGENCIA</b>, acuerdan lo siguiente:
        </p>

        {c("Objeto", <>
          EL CONSIGNANTE entrega a LA AGENCIA, para su venta por cuenta y orden del CONSIGNANTE, el siguiente vehículo de su propiedad:
          marca <b>{auto.marca}</b>, modelo <b>{`${auto.modelo} ${auto.version}`.trim()}</b>, año <b>{auto.anio}</b>, dominio{" "}
          <b>{blanco(n.dominio, 10)}</b>, color {auto.color.toLowerCase()}, con {formatKm(auto.km)} al momento de la entrega.
        </>)}
        {c("Precio", <>
          El precio de venta al público se fija en <b>{pesos(auto.precio)}</b>. LA AGENCIA no podrá venderlo por un valor menor sin
          autorización previa del CONSIGNANTE, que podrá darse por escrito o por mensaje.
        </>)}
        {c("Comisión", <>
          Por su intermediación, LA AGENCIA percibirá {comision}. Concretada la venta, LA AGENCIA entregará al CONSIGNANTE el importe
          cobrado, descontada la comisión, contra la firma de la documentación de transferencia.
        </>)}
        {c("Plazo", <>
          El presente acuerdo tiene una duración de <b>{n.plazoDias} días</b> desde la fecha de firma
          {vence ? <>, venciendo el <b>{fechaLarga(vence)}</b></> : null}. Podrá renovarse de común acuerdo.
        </>)}
        {n.exclusividad &&
          c("Exclusividad", <>
            Durante la vigencia de este acuerdo, LA AGENCIA tendrá la exclusividad para la venta del vehículo. Si EL CONSIGNANTE lo
            vendiera por su cuenta o por medio de terceros durante ese plazo, deberá abonar a LA AGENCIA la comisión prevista en la
            cláusula de comisión, calculada sobre el precio de venta fijado en este contrato.
          </>)}
        {c("Retiro anticipado", <>
          Si EL CONSIGNANTE decidiera retirar el vehículo antes del vencimiento del plazo,
          {n.cargoRetiro > 0 ? <> deberá abonar a LA AGENCIA la suma de <b>{pesos(n.cargoRetiro)}</b> en concepto de gastos de preparación, exhibición y publicidad.</> : " podrá hacerlo sin cargo, avisando con al menos 48 horas de anticipación."}
        </>)}
        {c("Custodia y exhibición", <>
          El vehículo quedará en el local de LA AGENCIA para su exhibición. EL CONSIGNANTE autoriza a LA AGENCIA a publicarlo en su página
          web y redes sociales, a mostrarlo a interesados y a realizar pruebas de manejo acompañadas por personal de LA AGENCIA.
        </>)}
        {c("Documentación", <>
          EL CONSIGNANTE declara que el vehículo es de su propiedad, que se encuentra libre de deudas, prendas, embargos e inhibiciones, y
          entrega en este acto la siguiente documentación:{" "}
          {PAPELES.map((p) => `${n.papeles.includes(p) ? "[X]" : "[  ]"} ${p}`).join("; ")}.
        </>)}
        {c("Gastos", <>
          Los gastos de transferencia, informes y verificaciones se distribuirán según lo acordado entre las partes al momento de la
          venta. Los impuestos y multas devengados hasta la fecha de venta son a cargo del CONSIGNANTE.
        </>)}
        {c("Jurisdicción", <>
          Para cualquier diferencia, las partes se someten a los tribunales ordinarios de la ciudad de {ag.ciudad}, {ag.provincia}.
        </>)}

        <p className="mt-4">En prueba de conformidad, se firman dos ejemplares de un mismo tenor y a un solo efecto.</p>

        <div className="mt-20 grid grid-cols-2 gap-12 text-center text-[13px] print:mt-24">
          <div className="border-t border-black pt-2">
            Firma EL CONSIGNANTE<br />Aclaración: {n.duenoNombre || ""}<br />DNI: {n.duenoDni || ""}
          </div>
          <div className="border-t border-black pt-2">
            Firma LA AGENCIA<br />{ag.legal.titular || ag.nombre}
          </div>
        </div>
      </article>
    </div>
  );
}
