import type { Metadata } from "next";
import Link from "next/link";
import { FormIngreso } from "@/components/admin/FormIngreso";
import { Ingreso } from "@/components/cuenta/Ingreso";
import { passwordConfigurada } from "@/lib/sesion";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function IngresarPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const agencia = s("agencia") === "1";
  const volverPedido = s("volver") ?? "";
  const volver = volverPedido.startsWith("/") && !volverPedido.startsWith("//") ? volverPedido : agencia ? "/admin" : "/cuenta";
  const fav = s("fav");

  const pestaña = (activa: boolean) =>
    `flex-1 border-b-[3px] py-3.5 text-center font-display text-lg font-bold uppercase tracking-wide ${
      activa ? "border-rojo text-tinta" : "border-transparent text-stone-400 hover:text-tinta"
    }`;

  return (
    <div className="contenedor flex justify-center py-10 sm:py-16">
      <div className="w-full max-w-md">
        <nav className="mb-6 flex border-b border-linea">
          <Link href={`/ingresar${fav ? `?fav=${fav}&volver=${encodeURIComponent(volver)}` : ""}`} replace className={pestaña(!agencia)}>Soy cliente</Link>
          <Link href="/ingresar?agencia=1" replace className={pestaña(agencia)}>Soy de la agencia</Link>
        </nav>
        {agencia ? (
          <div className="rounded-lg border border-linea p-6 sm:p-8">
            <h1 className="titulo text-[34px]">Panel de la agencia</h1>
            <p className="mt-2 mb-6 text-lg text-stone-600">Para cargar y administrar los autos.</p>
            {passwordConfigurada() ? (
              <FormIngreso volver={volver.startsWith("/admin") ? volver : "/admin"} />
            ) : (
              <p className="rounded-md bg-rojo-claro p-4 text-lg text-rojo-oscuro">Falta configurar el usuario y la contraseña del panel (ADMIN_USER y ADMIN_PASSWORD).</p>
            )}
          </div>
        ) : (
          <Ingreso volver={volver} fav={fav} />
        )}
      </div>
    </div>
  );
}
