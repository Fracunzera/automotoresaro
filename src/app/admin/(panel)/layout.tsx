import { PanelNav } from "@/components/admin/PanelNav";
import { requerirPagina } from "@/lib/usuarios";
import { contarNuevas } from "@/lib/consultas";
import { contarPedidosNuevos } from "@/lib/pedidos";
import { esTienda } from "@/lib/rubro";
import { contarTurnosPendientes } from "@/lib/turnos";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const u = await requerirPagina();
  const [nuevas, visitas] = await Promise.all([esTienda ? contarPedidosNuevos() : contarNuevas(), esTienda ? Promise.resolve(0) : contarTurnosPendientes()]);
  return (
    <>
      <PanelNav nombreUsuario={u.nombre} esAdmin={u.rol === "admin"} consultasNuevas={nuevas} visitasPendientes={visitas} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
    </>
  );
}
