import { AjustesForm } from "@/components/admin/AjustesForm";
import { leerNegocio } from "@/lib/negocio";
import { usaNube } from "@/lib/almacen";

export default async function AjustesPage() {
  const { ajustes } = await leerNegocio();
  return (
    <div>
      <h1 className="text-3xl font-bold">Comisiones y ajustes</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">Lo que cambies acá se aplica enseguida.</p>
      <AjustesForm inicial={ajustes} />
      <p className="mt-10 text-base text-stone-500">
        Datos guardados {usaNube() ? "en la nube (Vercel Blob), con copias de respaldo automáticas" : "en esta computadora (carpeta data/), con copias de respaldo"}.
      </p>
    </div>
  );
}
