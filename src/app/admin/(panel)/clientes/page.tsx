import Link from "next/link";
import { getTodos } from "@/lib/autos";
import { leerClientes } from "@/lib/clientes";
import { usuarioActual } from "@/lib/usuarios";
import { ListaClientes, type FilaCliente } from "@/components/admin/ListaClientes";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ClientesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? sp.ok.slice(0, 300) : undefined;
  const [clientes, autos, yo] = await Promise.all([leerClientes(), getTodos(), usuarioActual()]);
  const esAdmin = yo?.rol === "admin";
  const nombreAuto = (id: string) => {
    const a = autos.find((x) => x.id === id);
    return a ? `${a.marca} ${a.modelo} ${a.anio}` : null;
  };

  const filas: FilaCliente[] = clientes
    .sort((a, b) => +new Date(b.creado) - +new Date(a.creado))
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      email: c.email,
      telefono: c.telefono,
      ciudad: c.ciudad,
      aceptaMails: c.aceptaMails,
      origen: c.origen,
      creado: c.creado,
      favoritos: c.favoritos.map(nombreAuto).filter((x): x is string => !!x),
      compras: c.compras.map((x) => x.titulo),
    }));
  const aceptan = clientes.filter((c) => c.aceptaMails).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <div className="flex flex-wrap gap-2">
          {esAdmin && <Link href="/admin/mails" className="btn-g border-2 border-tinta bg-white hover:bg-papel">Mandar un mail</Link>}
          <Link href="/admin/clientes/nuevo" className="btn-g bg-rojo text-white hover:bg-rojo-oscuro">+ Agregar cliente</Link>
        </div>
      </div>
      <p className="mt-2 text-lg text-stone-600">
        {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"} · {aceptan} {aceptan === 1 ? "acepta" : "aceptan"} recibir mails.
        Se registran solos desde la página para guardar favoritos, o los agregás vos.
      </p>
      {ok && (
        <p role="status" className="mt-5 rounded-lg border-2 border-[#9fd3b2] bg-[#e7f4ec] p-4 text-lg font-semibold text-[#17733c]">✓ {ok}</p>
      )}
      <ListaClientes filas={filas} esAdmin={esAdmin} />
    </div>
  );
}
