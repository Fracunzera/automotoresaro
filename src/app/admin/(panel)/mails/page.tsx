import { requerirPagina } from "@/lib/usuarios";
import { leerEnvios } from "@/app/admin/acciones-clientes";
import { RedactarMail } from "@/components/admin/RedactarMail";
import { getPublicos } from "@/lib/autos";
import { getProductosPublicos } from "@/lib/productos";
import { esTienda } from "@/lib/rubro";
import { leerClientes } from "@/lib/clientes";
import { mailConfigurado } from "@/lib/mail";

type SP = Promise<Record<string, string | string[] | undefined>>;

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function MailsPage({ searchParams }: { searchParams: SP }) {
  await requerirPagina("admin");
  const sp = await searchParams;
  const [clientes, autos, productos, envios] = await Promise.all([
    leerClientes(),
    esTienda ? Promise.resolve([]) : getPublicos(),
    esTienda ? getProductosPublicos() : Promise.resolve([]),
    leerEnvios(),
  ]);
  const clienteInicial = typeof sp.cliente === "string" ? sp.cliente : undefined;

  return (
    <div>
      <h1 className="text-3xl font-bold">Mandar un mail</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">Escribí el mensaje, sumá {esTienda ? "productos" : "autos"} si querés, y mandá una prueba a tu mail antes de enviarlo.</p>
      {!mailConfigurado() && (
        <p className="mb-6 rounded-lg border-2 border-[#e6c35c] bg-[#fff8e1] p-4 text-lg">
          Todavía no está configurado el envío de mails (SMTP). Podés escribir y probar, pero los mails no van a salir. Avisale a quien armó la página.
        </p>
      )}
      <RedactarMail
        clientes={clientes.map((c) => ({ id: c.id, nombre: c.nombre || c.email, email: c.email, aceptaMails: c.aceptaMails }))}
        autos={esTienda ? productos.map((p) => ({ id: p.id, titulo: p.nombre, precio: p.precio })) : autos.map((a) => ({ id: a.id, titulo: `${a.marca} ${a.modelo} ${a.anio}`, precio: a.precio }))}
        clienteInicial={clienteInicial}
        emailPrueba={process.env.ADMIN_EMAIL ?? ""}
      />

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Mails enviados</h2>
        {envios.length === 0 ? (
          <p className="mt-2 text-lg text-stone-600">Todavía no mandaste ninguno.</p>
        ) : (
          <ul className="tarjeta-g mt-3 divide-y-2 divide-linea">
            {envios.map((e) => (
              <li key={e.id} className="px-5 py-4 text-lg">
                <p className="font-semibold">{e.asunto}</p>
                <p className="text-stone-600">
                  {fecha(e.fecha)} ·{" "}
                  {e.estado === "enviando" ? `Enviando… ${e.enviados} de ${e.destinatarios}` : `Enviado a ${e.enviados} de ${e.destinatarios}`}
                  {e.fallidos > 0 && <span className="text-rojo-oscuro"> · {e.fallidos} no se pudieron mandar</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
