import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductoPorId, getProductosTodos } from "@/lib/productos";
import { esTienda } from "@/lib/rubro";
import { usuarioActual } from "@/lib/usuarios";
import { ProductoForm } from "@/components/admin/ProductoForm";

export default async function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  if (!esTienda) notFound();
  const { id } = await params;
  const [p, todos, yo] = await Promise.all([getProductoPorId(id), getProductosTodos(), usuarioActual()]);
  if (!p) notFound();
  const categorias = Array.from(new Set(todos.map((x) => x.categoria).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  return (
    <div>
      <Link href="/admin/productos" className="text-lg font-semibold text-stone-600 hover:text-tinta">← Volver a Productos</Link>
      <h1 className="mt-3 mb-6 text-3xl font-bold">{p.nombre}</h1>
      <ProductoForm producto={p} categorias={categorias} esAdmin={yo?.rol === "admin"} />
    </div>
  );
}
