import { AutoForm } from "@/components/admin/AutoForm";
import { leerNegocio } from "@/lib/negocio";
import { negocioVacio } from "@/lib/negocio-tipos";
import { usuarioActual } from "@/lib/usuarios";

export default async function NuevoAuto() {
  const [{ ajustes }, yo] = await Promise.all([leerNegocio(), usuarioActual()]);
  return (
    <div>
      <h1 className="text-3xl font-bold">Cargar un auto nuevo</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">Completá de arriba hacia abajo. Al final tocá “Guardar y publicar”.</p>
      <AutoForm negocioInicial={negocioVacio(ajustes)} ajustes={ajustes} esAdmin={yo?.rol === "admin"} />
    </div>
  );
}
