import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPublicos } from "@/lib/autos";
import { getCliente } from "@/lib/clientes";
import { getFinanciacion } from "@/lib/negocio";
import { idClienteActual } from "@/lib/sesion-cliente";
import { CarCard } from "@/components/CarCard";
import { PerfilForm } from "@/components/cuenta/PerfilForm";
import { salirCliente } from "./acciones";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const id = await idClienteActual();
  const cliente = id ? await getCliente(id) : undefined;
  if (!cliente) redirect("/ingresar?volver=/cuenta");

  const [publicos, fin] = await Promise.all([getPublicos(), getFinanciacion()]);
  const favoritos = cliente.favoritos.map((f) => publicos.find((a) => a.id === f)).filter((a) => !!a);
  const noDisponibles = cliente.favoritos.length - favoritos.length;

  return (
    <div className="contenedor pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="sobretitulo">Mi cuenta</p>
          <h1 className="titulo mt-1 text-[40px]">Hola{cliente.nombre ? `, ${cliente.nombre.split(" ")[0]}` : ""}</h1>
        </div>
        <form action={salirCliente}>
          <button className="btn-borde">Salir</button>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="titulo text-[30px]">Mis favoritos</h2>
        {favoritos.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {favoritos.map((a) => <CarCard key={a.id} auto={a} fin={fin} />)}
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-papel p-8">
            <p className="text-lg font-semibold">Todavía no guardaste autos.</p>
            <p className="mt-1 text-stone-600">Tocá el corazón en cualquier auto para guardarlo acá.</p>
            <Link href="/autos" className="btn-rojo mt-5">Ver autos</Link>
          </div>
        )}
        {noDisponibles > 0 && (
          <p className="mt-4 text-[15px] text-stone-500">
            {noDisponibles === 1 ? "Un auto que guardaste ya se vendió" : `${noDisponibles} autos que guardaste ya se vendieron`} o no está disponible.
          </p>
        )}
      </section>

      <section className="mt-14 max-w-xl">
        <h2 className="titulo text-[30px]">Mis datos</h2>
        <p className="mt-1 text-stone-600">Ingresás con <b className="text-tinta">{cliente.email}</b>.</p>
        <PerfilForm inicial={{ nombre: cliente.nombre, telefono: cliente.telefono, ciudad: cliente.ciudad, aceptaMails: cliente.aceptaMails }} />
      </section>
    </div>
  );
}
