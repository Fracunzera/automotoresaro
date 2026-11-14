/**
 * Productos de MUESTRA para una tienda recién instalada. Aparecen mientras no haya nada guardado
 * y se borran juntos desde el panel ("Borrar los productos de ejemplo").
 */
import type { Producto } from "@/lib/productos-tipos";

const fecha = "2026-01-01T00:00:00.000Z";

const base: Omit<Producto, "id" | "creado" | "actualizado" | "ejemplo" | "estado">[] = [
  { slug: "remera-algodon-basica", nombre: "Remera de algodón básica", categoria: "Ropa", precio: 14900, precioAnterior: 18900, fotos: [], stock: 25, variantes: ["S", "M", "L", "XL"], nombreVariante: "Talle", destacado: true, descripcion: "Remera 100% algodón peinado, corte clásico. Ideal para todos los días." },
  { slug: "buzo-frisa-capucha", nombre: "Buzo de frisa con capucha", categoria: "Ropa", precio: 32900, precioAnterior: 0, fotos: [], stock: 12, variantes: ["S", "M", "L", "XL"], nombreVariante: "Talle", destacado: true, descripcion: "Buzo de frisa invisible, abrigado y suave. Bolsillo canguro." },
  { slug: "zapatillas-urbanas", nombre: "Zapatillas urbanas", categoria: "Calzado", precio: 54900, precioAnterior: 64900, fotos: [], stock: 8, variantes: ["38", "39", "40", "41", "42", "43"], nombreVariante: "Número", destacado: true, descripcion: "Zapatillas livianas con suela de goma antideslizante." },
  { slug: "mochila-urbana-20l", nombre: "Mochila urbana 20 L", categoria: "Accesorios", precio: 27500, precioAnterior: 0, fotos: [], stock: 15, variantes: ["Negra", "Gris", "Azul"], nombreVariante: "Color", destacado: true, descripcion: "Mochila con compartimento para notebook de 15\" y bolsillo antirrobo." },
  { slug: "gorra-ajustable", nombre: "Gorra ajustable", categoria: "Accesorios", precio: 9900, precioAnterior: 0, fotos: [], stock: 30, variantes: ["Negra", "Blanca"], nombreVariante: "Color", destacado: false, descripcion: "Gorra de gabardina con regulador metálico." },
  { slug: "medias-pack-x3", nombre: "Medias pack x3", categoria: "Ropa", precio: 6900, precioAnterior: 0, fotos: [], stock: 0, variantes: [], nombreVariante: "", destacado: false, descripcion: "Pack de tres pares de medias de algodón. Talle único." },
];

export const productosEjemplo: Producto[] = base.map((p, i) => ({
  ...p,
  id: `ejemplo-p${i + 1}`,
  estado: "publicado",
  ejemplo: true,
  creado: fecha,
  actualizado: fecha,
}));
