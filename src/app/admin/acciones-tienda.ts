"use server";

import { actualizarPedido } from "@/lib/pedidos";
import {
  actualizarProducto, ajustarStock, borrarProducto, borrarProductosEjemplo, cambiarEstadoProducto, crearProducto,
} from "@/lib/productos";
import { ESTADOS_PEDIDO, ESTADO_PEDIDO_TEXTO, type ConfigTienda, type DatosProducto, type EstadoPedido, type Pedido } from "@/lib/productos-tipos";
import { esTienda } from "@/lib/rubro";
import { guardarConfigTienda } from "@/lib/tienda";
import { requerirUsuario } from "@/lib/usuarios";

type Resultado = { ok: true; mensaje: string; id?: string } | { ok: false; error: string };

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pesos = (v: unknown) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 && n < 1e12 ? n : 0;
};

function msgError(e: unknown) {
  const m = e instanceof Error ? e.message : "";
  if (/^(Tu sesión|No tenés permiso|No encontramos)/.test(m)) return m;
  console.error(e);
  return "No se pudo guardar. Probá de nuevo.";
}

async function permitir(rol?: "admin") {
  if (!esTienda) throw new Error("No encontramos esa sección.");
  return requerirUsuario(rol);
}

/* ───────────── Productos ───────────── */

function validar(d: Record<string, unknown>): DatosProducto | string {
  const nombre = texto(d.nombre, 120);
  const precio = pesos(d.precio);
  if (!nombre) return "Falta el nombre del producto.";
  if (!(precio > 0)) return "Falta el precio.";
  const variantes = Array.from(new Set((Array.isArray(d.variantes) ? d.variantes : []).map((v) => texto(v, 40)).filter(Boolean))).slice(0, 40);
  const fotos = (Array.isArray(d.fotos) ? d.fotos : [])
    .filter((f): f is string => typeof f === "string" && (f.startsWith("/api/fotos/") || f.startsWith("https://")))
    .slice(0, 20);
  const stock = d.stock === null ? null : Math.max(0, Math.round(Number(d.stock) || 0));
  return {
    nombre,
    descripcion: texto(d.descripcion, 4000),
    categoria: texto(d.categoria, 50) || "General",
    precio,
    precioAnterior: pesos(d.precioAnterior) > precio ? pesos(d.precioAnterior) : 0,
    fotos,
    stock,
    variantes,
    nombreVariante: variantes.length ? texto(d.nombreVariante, 30) || "Opción" : "",
    destacado: d.destacado === true,
    estado: d.estado === "oculto" ? "oculto" : "publicado",
  };
}

export async function guardarProductoAccion(id: string | null, d: Record<string, unknown>): Promise<Resultado> {
  try {
    await permitir();
    const v = validar(d);
    if (typeof v === "string") return { ok: false, error: v };
    const p = id ? await actualizarProducto(id, v) : await crearProducto(v);
    return {
      ok: true,
      id: p.id,
      mensaje: id ? `Listo, se guardaron los cambios de “${p.nombre}”.` : p.estado === "publicado" ? `Listo, “${p.nombre}” ya está a la venta.` : `Listo, “${p.nombre}” quedó guardado sin publicar.`,
    };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

export async function estadoProductoAccion(id: string, estado: "publicado" | "oculto"): Promise<Resultado> {
  try {
    await permitir();
    const p = await cambiarEstadoProducto(id, estado);
    return { ok: true, mensaje: estado === "publicado" ? `“${p.nombre}” está a la venta.` : `“${p.nombre}” quedó oculto.` };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

export async function stockAccion(id: string, nuevo: number | null): Promise<Resultado> {
  try {
    await permitir();
    const p = await ajustarStock(id, nuevo === null ? null : Number(nuevo));
    return { ok: true, mensaje: p.stock === null ? `“${p.nombre}”: sin control de stock.` : `“${p.nombre}”: quedan ${p.stock}.` };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

export async function borrarProductoAccion(id: string): Promise<Resultado> {
  try {
    await permitir("admin");
    await borrarProducto(id);
    return { ok: true, mensaje: "Se borró el producto." };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

export async function borrarEjemplosTiendaAccion(): Promise<Resultado> {
  try {
    await permitir("admin");
    const n = await borrarProductosEjemplo();
    return { ok: true, mensaje: `Listo, se borraron ${n} productos de ejemplo.` };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

/* ───────────── Pedidos ───────────── */

export async function actualizarPedidoAccion(
  id: string,
  d: { estado?: EstadoPedido; estadoPago?: Pedido["estadoPago"]; notas?: string },
): Promise<Resultado> {
  try {
    const u = await permitir();
    if (d.estado && !ESTADOS_PEDIDO.includes(d.estado)) return { ok: false, error: "Estado no válido." };
    if (d.estado === "cancelado" && u.rol !== "admin") return { ok: false, error: "Solo un administrador puede cancelar pedidos." };
    const cambios: Parameters<typeof actualizarPedido>[1] = {};
    if (d.estado) cambios.estado = d.estado;
    if (d.estadoPago === "pagado" || d.estadoPago === "pendiente") cambios.estadoPago = d.estadoPago;
    if (typeof d.notas === "string") cambios.notas = texto(d.notas, 2000);
    const p = await actualizarPedido(id, cambios, u.nombre);
    return {
      ok: true,
      mensaje:
        d.estado === "cancelado"
          ? `Pedido #${p.numero} cancelado. El stock volvió a estar disponible.`
          : d.estadoPago === "pagado"
            ? `Pedido #${p.numero} marcado como pagado.`
            : `Pedido #${p.numero}: ${ESTADO_PEDIDO_TEXTO[p.estado]}.`,
    };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}

/* ───────────── Envíos y pagos ───────────── */

export async function guardarConfigTiendaAccion(d: ConfigTienda): Promise<Resultado> {
  try {
    await permitir("admin");
    const c: ConfigTienda = {
      retiro: { activo: d.retiro?.activo === true, texto: texto(d.retiro?.texto, 300) },
      domicilio: {
        activo: d.domicilio?.activo === true,
        costo: pesos(d.domicilio?.costo),
        gratisDesde: pesos(d.domicilio?.gratisDesde),
        texto: texto(d.domicilio?.texto, 300),
      },
      pagos: {
        mercadoPago: d.pagos?.mercadoPago === true,
        transferencia: {
          activo: d.pagos?.transferencia?.activo === true,
          alias: texto(d.pagos?.transferencia?.alias, 60),
          cbu: texto(d.pagos?.transferencia?.cbu, 30).replace(/\s/g, ""),
          titular: texto(d.pagos?.transferencia?.titular, 100),
        },
        efectivo: d.pagos?.efectivo === true,
      },
      compraMinima: pesos(d.compraMinima),
    };
    if (!c.retiro.activo && !c.domicilio.activo) return { ok: false, error: "Tiene que haber al menos una forma de entrega." };
    if (!c.pagos.mercadoPago && !c.pagos.transferencia.activo && !c.pagos.efectivo) return { ok: false, error: "Tiene que haber al menos una forma de pago." };
    if (c.pagos.transferencia.activo && !c.pagos.transferencia.alias && !c.pagos.transferencia.cbu) {
      return { ok: false, error: "Para cobrar por transferencia, cargá el alias o el CBU." };
    }
    await guardarConfigTienda(c);
    return { ok: true, mensaje: "Listo, se guardaron los envíos y pagos." };
  } catch (e) {
    return { ok: false, error: msgError(e) };
  }
}
