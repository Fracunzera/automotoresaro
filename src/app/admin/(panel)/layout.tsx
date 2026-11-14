import { PanelNav } from "@/components/admin/PanelNav";
import { requerirPagina } from "@/lib/usuarios";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const u = await requerirPagina();
  return (
    <>
      <PanelNav nombreUsuario={u.nombre} esAdmin={u.rol === "admin"} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
    </>
  );
}
