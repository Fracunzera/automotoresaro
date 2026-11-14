import type { Metadata } from "next";
import Link from "next/link";
import { darDeBajaMails } from "@/lib/clientes";
import { idDesdeTokenBaja } from "@/lib/sesion-cliente";

export const metadata: Metadata = { title: "Dejar de recibir mails", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function BajaPage({ searchParams }: { searchParams: SP }) {
  const t = (await searchParams).t;
  const id = typeof t === "string" ? idDesdeTokenBaja(t) : null;
  const ok = id ? await darDeBajaMails(id) : false;

  return (
    <div className="contenedor py-20">
      <h1 className="titulo text-[40px]">{ok ? "Listo, no vas a recibir más mails" : "El link no es válido"}</h1>
      <p className="mt-3 max-w-lg text-lg text-stone-600">
        {ok
          ? "Te sacamos de la lista de novedades. Si cambiás de idea, lo podés activar de nuevo desde Mi cuenta."
          : "Puede que el link esté incompleto. Si querés dejar de recibir mails, ingresá a Mi cuenta y destildá la opción."}
      </p>
      <Link href="/" className="btn-rojo mt-8">Ir a la página</Link>
    </div>
  );
}
