import Link from "next/link";
import { ROL_TEXTO, leerEmpleados, requerirPagina } from "@/lib/usuarios";

type SP = Promise<Record<string, string | string[] | undefined>>;
const fecha = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) : "Nunca";

export default async function EmpleadosPage({ searchParams }: { searchParams: SP }) {
  await requerirPagina("admin");
  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? sp.ok.slice(0, 300) : undefined;
  const empleados = (await leerEmpleados()).sort((a, b) => Number(b.activo) - Number(a.activo) || a.nombre.localeCompare(b.nombre, "es"));

  return (
    <div>
      <Link href="/admin/configuracion" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Ajustes</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Empleados</h1>
        <Link href="/admin/empleados/nuevo" className="btn-g bg-rojo text-white hover:bg-rojo-oscuro">+ Dar de alta un empleado</Link>
      </div>
      {ok && <p role="status" className="mt-5 rounded-lg border-2 border-[#9fd3b2] bg-[#e7f4ec] p-4 text-lg font-semibold text-[#17733c]">✓ {ok}</p>}

      <div className="tarjeta-g mt-6 p-5 text-lg">
        <p className="font-bold">Qué puede hacer cada uno</p>
        <p className="mt-2"><b>Administrador:</b> todo. Ve costos, comisiones y ganancias, cambia ajustes, manda mails y da de alta empleados.</p>
        <p className="mt-1"><b>Vendedor:</b> carga y edita autos, los reserva o los marca como vendidos, y atiende a los clientes. No ve plata del negocio.</p>
      </div>

      <ul className="mt-4 space-y-3">
        <li className="tarjeta-g p-4">
          <p className="text-xl font-bold">Cuenta principal</p>
          <p className="text-lg text-stone-600">Usuario “{(process.env.ADMIN_USER || "admin").toLowerCase()}” · Administrador</p>
          <p className="mt-1 text-base text-stone-500">Su usuario y contraseña se cambian en la configuración del servidor (ADMIN_USER y ADMIN_PASSWORD).</p>
        </li>
        {empleados.map((e) => (
          <li key={e.id} className={`tarjeta-g p-4 ${e.activo ? "" : "opacity-70"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xl font-bold">{e.nombre}</p>
                <p className="text-lg text-stone-600">Usuario “{e.usuario}” · {ROL_TEXTO[e.rol]}</p>
                <p className="text-base text-stone-500">Último ingreso: {fecha(e.ultimoIngreso)}</p>
              </div>
              <span className={`rounded-sm px-2.5 py-1 text-base font-bold ${e.activo ? "bg-[#e7f4ec] text-[#17733c]" : "bg-stone-200 text-stone-700"}`}>
                {e.activo ? "Activo" : "Dado de baja"}
              </span>
            </div>
            <Link href={`/admin/empleados/${e.id}`} className="btn-g mt-3 border-2 border-tinta bg-white hover:bg-papel">Editar</Link>
          </li>
        ))}
      </ul>
      {empleados.length === 0 && <p className="mt-4 text-lg text-stone-600">Todavía no diste de alta a ningún empleado.</p>}
    </div>
  );
}
