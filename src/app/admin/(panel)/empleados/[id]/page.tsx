import Link from "next/link";
import { notFound } from "next/navigation";
import { EmpleadoEditarForm } from "@/components/admin/EmpleadoForms";
import { leerEmpleados, requerirPagina } from "@/lib/usuarios";

export default async function EditarEmpleado({ params }: { params: Promise<{ id: string }> }) {
  const yo = await requerirPagina("admin");
  const { id } = await params;
  const e = (await leerEmpleados()).find((x) => x.id === id);
  if (!e) notFound();
  return (
    <div>
      <Link href="/admin/empleados" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Empleados</Link>
      <h1 className="mt-3 mb-6 text-3xl font-bold">{e.nombre}</h1>
      <EmpleadoEditarForm id={e.id} usuario={e.usuario} inicial={{ nombre: e.nombre, rol: e.rol, activo: e.activo }} esYo={yo.id === e.id} />
    </div>
  );
}
