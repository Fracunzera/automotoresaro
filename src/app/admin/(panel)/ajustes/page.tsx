import { esTienda } from "@/lib/rubro";
import { notFound } from "next/navigation";
import { requerirPagina } from "@/lib/usuarios";
import { AjustesForm } from "@/components/admin/AjustesForm";
import { leerNegocio } from "@/lib/negocio";
import { usaNube } from "@/lib/almacen";

export default async function AjustesPage() {
  if (esTienda) notFound();
  await requerirPagina("admin");
  const { ajustes } = await leerNegocio();
  return (
    <div>
      <a href="/admin/configuracion" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Ajustes</a>
      <h1 className="mt-3 text-3xl font-bold">Comisiones y financiación</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">Lo que cambies acá se aplica enseguida.</p>
      <AjustesForm inicial={ajustes} />
      <p className="mt-10 text-base text-stone-500">
        Datos guardados {usaNube() ? "en la nube (Vercel Blob), con copias de respaldo automáticas" : "en esta computadora (carpeta data/), con copias de respaldo"}.
      </p>
    </div>
  );
}
