import { PanelNav } from "@/components/admin/PanelNav";
import { requerirPagina } from "@/lib/usuarios";
import { contarNuevas } from "@/lib/consultas";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const u = await requerirPagina();
  const nuevas = await contarNuevas();
  return (
    <>
      <PanelNav nombreUsuario={u.nombre} esAdmin={u.rol === "admin"} consultasNuevas={nuevas} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
    </>
  );
}
