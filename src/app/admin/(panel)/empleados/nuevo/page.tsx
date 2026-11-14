import Link from "next/link";
import { EmpleadoNuevoForm } from "@/components/admin/EmpleadoForms";
import { requerirPagina } from "@/lib/usuarios";

export default async function NuevoEmpleado() {
  await requerirPagina("admin");
  return (
    <div>
      <Link href="/admin/empleados" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Empleados</Link>
      <h1 className="mt-3 mb-6 text-3xl font-bold">Dar de alta un empleado</h1>
      <EmpleadoNuevoForm />
    </div>
  );
}
