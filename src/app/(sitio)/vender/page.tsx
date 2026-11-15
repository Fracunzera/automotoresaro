import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esTienda } from "@/lib/rubro";
import { getCliente } from "@/lib/clientes";
import { leerNegocio } from "@/lib/negocio";
import { idClienteActual } from "@/lib/sesion-cliente";
import { formatNumero } from "@/lib/utils";
import { SellForm } from "@/components/SellForm";

export const metadata: Metadata = {
  title: "Vendé tu auto",
  description: "Publicá tu auto con nosotros: lo mostramos, atendemos a los interesados y nos ocupamos de los papeles y el cobro. Cobramos solo si se vende.",
};
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;

const pasos = [
  ["Vos ponés el precio", "Con nuestro asesoramiento según el mercado."],
  ["Lo publicamos", "En la página y las redes, con buenas fotos."],
  ["Atendemos a los interesados", "Consultas, visitas y pruebas de manejo."],
  ["Papeles y cobro", "Gestionamos la transferencia y el pago del comprador."],
];

export default async function VenderPage({ searchParams }: { searchParams: SP }) {
  if (esTienda) notFound();
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const [{ ajustes }, idCliente] = await Promise.all([leerNegocio(), idClienteActual()]);
  const cliente = idCliente ? await getCliente(idCliente) : undefined;

  const comision =
    ajustes.comisionModo === "porcentaje"
      ? `el ${ajustes.comisionValor}% del precio de venta${ajustes.comisionMinima > 0 ? ` (mínimo $ ${formatNumero(ajustes.comisionMinima)})` : ""}`
      : ajustes.comisionModo === "fijo"
        ? `$ ${formatNumero(ajustes.comisionValor)}`
        : "una diferencia que acordamos con vos antes de publicarlo";

  return (
    <div className="contenedor pt-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div>
          <p className="sobretitulo">Vendé tu auto</p>
          <h1 className="titulo mt-2 text-[44px] sm:text-[56px]">Vendemos tu auto por vos</h1>
          <p className="mt-4 max-w-md text-lg text-stone-600">
            Olvidate de publicar en mil lados, atender llamados y recibir desconocidos en tu casa. Nosotros nos ocupamos de todo.
          </p>

          <ol className="mt-8 grid max-w-md gap-px overflow-hidden rounded-lg border border-linea bg-linea">
            {pasos.map(([t, d], i) => (
              <li key={t} className="flex gap-4 bg-white p-4">
                <span className="font-display text-2xl font-extrabold leading-none text-rojo">0{i + 1}</span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-[15px] text-stone-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 max-w-md rounded-lg bg-papel p-5">
            <p className="text-lg font-semibold">Cobramos solo si se vende</p>
            <p className="mt-1 text-[15px] text-stone-700">
              Nuestra comisión es {comision}. Cuando el comprador paga, te transferimos lo tuyo.
            </p>
          </div>

          <div className="mt-8 max-w-md">
            <h2 className="text-lg font-semibold">Qué vas a necesitar</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-stone-700">
              <li className="border-b border-linea pb-2">Título y cédula del auto</li>
              <li className="border-b border-linea pb-2">DNI del titular</li>
              <li className="border-b border-linea pb-2">Formulario 08 (lo podemos gestionar nosotros)</li>
              <li>Libre deuda de patentes</li>
            </ul>
          </div>
        </div>

        <SellForm
          key={JSON.stringify(sp)}
          conCuenta={!!cliente}
          inicial={{
            marca: s("marca") ?? "", modelo: s("modelo") ?? "", anio: s("anio") ?? "",
            ...(cliente ? { nombre: cliente.nombre, telefono: cliente.telefono, email: cliente.email, zona: cliente.ciudad } : {}),
          }}
        />
      </div>
    </div>
  );
}
