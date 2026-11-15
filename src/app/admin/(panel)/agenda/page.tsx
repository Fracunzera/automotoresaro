import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgencia } from "@/lib/agencia";
import { getTodos } from "@/lib/autos";
import { esTienda } from "@/lib/rubro";
import { fechaISO, leerTurnos } from "@/lib/turnos";
import { leerEmpleados } from "@/lib/usuarios";
import { ListaTurnos } from "@/components/admin/ListaTurnos";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AgendaPage({ searchParams }: { searchParams: SP }) {
  if (esTienda) notFound();
  const sp = await searchParams;
  const [turnos, autos, empleados, ag] = await Promise.all([leerTurnos(), getTodos(), leerEmpleados(), getAgencia()]);
  const hoy = fechaISO(new Date());
  const vista = sp.ver === "pasadas" ? "pasadas" : "proximas";
  const lista = turnos
    .filter((t) => (vista === "proximas" ? t.fecha >= hoy && t.estado !== "cancelado" : t.fecha < hoy || t.estado === "cancelado"))
    .sort((a, b) => (vista === "proximas" ? 1 : -1) * `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  const vendedores = [process.env.ADMIN_NOMBRE || "Administrador", ...empleados.filter((e) => e.activo).map((e) => e.nombre)];
  const slugs = Object.fromEntries(autos.map((a) => [a.id, a.estado === "publicado" || a.estado === "reservado" ? a.slug : ""]));

  return (
    <div>
      <h1 className="text-3xl font-bold">Agenda de visitas</h1>
      <p className="mt-1 text-lg text-stone-600">Visitas y pruebas de manejo que reservaron los compradores desde la página.</p>
      <nav className="mt-6 grid grid-cols-2 gap-2">
        {[["proximas", "Próximas"], ["pasadas", "Pasadas y canceladas"]].map(([id, label]) => (
          <Link key={id} href={id === "proximas" ? "/admin/agenda" : "/admin/agenda?ver=pasadas"} className={`rounded-md border-2 px-2 py-3 text-center text-lg font-semibold ${vista === id ? "border-tinta bg-tinta text-white" : "border-linea bg-white text-stone-700 hover:border-tinta"}`}>
            {label}
          </Link>
        ))}
      </nav>
      <ListaTurnos turnos={lista} hoy={hoy} vendedores={vendedores} slugs={slugs} agencia={{ nombre: ag.nombre, direccion: `${ag.direccion}, ${ag.ciudad}` }} />
      {lista.length === 0 && (
        <p className="tarjeta-g mt-4 p-8 text-center text-xl">
          {vista === "proximas" ? "No hay visitas agendadas. Cuando alguien reserve desde la página, aparece acá." : "No hay visitas pasadas."}
        </p>
      )}
      <p className="mt-8 text-base text-stone-500">Los días y horarios de atención se cambian en Ajustes → Comisiones y financiación → Agenda de visitas.</p>
    </div>
  );
}
