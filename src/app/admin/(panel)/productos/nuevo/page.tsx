import { notFound } from "next/navigation";
import { getProductosTodos } from "@/lib/productos";
import { esTienda } from "@/lib/rubro";
import { usuarioActual } from "@/lib/usuarios";
import { ProductoForm } from "@/components/admin/ProductoForm";

export default async function NuevoProducto() {
  if (!esTienda) notFound();
  const [productos, yo] = await Promise.all([getProductosTodos(), usuarioActual()]);
  const categorias = Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  return (
    <div>
      <h1 className="text-3xl font-bold">Cargar un producto</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">Completá de arriba hacia abajo. Al final tocá “Guardar y publicar”.</p>
      <ProductoForm categorias={categorias} esAdmin={yo?.rol === "admin"} />
    </div>
  );
}
