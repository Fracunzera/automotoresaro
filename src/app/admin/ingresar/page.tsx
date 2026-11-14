import { FormIngreso } from "@/components/admin/FormIngreso";
import { site } from "@/config/site";
import { passwordConfigurada } from "@/lib/sesion";

export const dynamic = "force-dynamic";

export default function IngresarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <p className="text-center font-display text-3xl font-extrabold uppercase tracking-tight">
          {site.nombre.split(" ").slice(0, -1).join(" ")} <span className="text-rojo">{site.nombre.split(" ").pop()}</span>
        </p>
        <div className="tarjeta-g mt-6 p-6 sm:p-8">
          <h1 className="text-2xl font-bold">Entrar al panel</h1>
          <p className="mt-1 text-lg text-stone-600">Escribí la contraseña para cargar y administrar los autos.</p>
          {passwordConfigurada() ? (
            <FormIngreso />
          ) : (
            <p className="mt-6 rounded-md bg-rojo-claro p-4 text-lg text-rojo-oscuro">
              Falta configurar la contraseña del panel (variable ADMIN_PASSWORD). Avisale a quien armó la página.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
