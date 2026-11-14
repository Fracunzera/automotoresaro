import { MiPasswordForm } from "@/components/admin/EmpleadoForms";
import { ROL_TEXTO, requerirPagina } from "@/lib/usuarios";

export default async function MiCuenta() {
  const u = await requerirPagina();
  return (
    <div>
      <h1 className="text-3xl font-bold">Mi contraseña</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">
        Entrás como <b className="text-tinta">{u.nombre}</b> (usuario “{u.usuario}”, {ROL_TEXTO[u.rol]}).
      </p>
      {u.principal ? (
        <p className="tarjeta-g p-5 text-lg">
          Esta es la cuenta principal: su usuario y contraseña se cambian en la configuración del servidor (ADMIN_USER y ADMIN_PASSWORD).
          Pedíselo a quien administra la página.
        </p>
      ) : (
        <MiPasswordForm />
      )}
    </div>
  );
}
