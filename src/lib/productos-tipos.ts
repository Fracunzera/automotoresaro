/** Tipos de la tienda online (productos, configuración de envíos y pagos, pedidos). */

export interface Producto {
  id: string;
  /** Dirección web del producto. No cambia, para que los links compartidos sigan andando. */
  slug: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  /** Precio final en pesos. */
  precio: number;
  /** Precio "antes" para mostrar tachado (0 = sin oferta). */
  precioAnterior: number;
  fotos: string[];
  /** Unidades disponibles. null = no se controla stock (siempre disponible). */
  stock: number | null;
  /** Opciones para elegir al comprar (ej. talles o colores). Vacío = sin opciones. */
  variantes: string[];
  /** Nombre de las opciones (ej. "Talle", "Color"). */
  nombreVariante: string;
  destacado: boolean;
  estado: "publicado" | "oculto";
  ejemplo?: boolean;
  creado: string;
  actualizado: string;
}

export type DatosProducto = Omit<Producto, "id" | "slug" | "creado" | "actualizado" | "ejemplo">;

export const hayStock = (p: Pick<Producto, "stock">, cantidad = 1) => p.stock === null || p.stock >= cantidad;

export interface ConfigTienda {
  retiro: { activo: boolean; texto: string };
  domicilio: { activo: boolean; costo: number; gratisDesde: number; texto: string };
  pagos: {
    mercadoPago: boolean;
    transferencia: { activo: boolean; alias: string; cbu: string; titular: string };
    efectivo: boolean;
  };
  /** Monto mínimo de compra (0 = sin mínimo). */
  compraMinima: number;
}

export const CONFIG_TIENDA_INICIAL: ConfigTienda = {
  retiro: { activo: true, texto: "Retirás en el local en el horario de atención." },
  domicilio: { activo: true, costo: 3000, gratisDesde: 0, texto: "Envíos dentro de la ciudad en 24 a 48 h hábiles." },
  pagos: {
    mercadoPago: true,
    transferencia: { activo: true, alias: "", cbu: "", titular: "" },
    efectivo: true,
  },
  compraMinima: 0,
};

/* ───────────── Pedidos ───────────── */

export type FormaEntrega = "retiro" | "domicilio";
export type FormaPago = "mercadopago" | "transferencia" | "efectivo";

export const FORMA_PAGO_TEXTO: Record<FormaPago, string> = {
  mercadopago: "Mercado Pago",
  transferencia: "Transferencia bancaria",
  efectivo: "Efectivo al retirar o recibir",
};

export const ESTADOS_PEDIDO = ["nuevo", "preparando", "listo", "enviado", "entregado", "cancelado"] as const;
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

export const ESTADO_PEDIDO_TEXTO: Record<EstadoPedido, string> = {
  nuevo: "Nuevo",
  preparando: "Preparando",
  listo: "Listo para retirar",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export interface ItemPedido {
  productoId: string;
  nombre: string;
  variante: string;
  precio: number;
  cantidad: number;
  foto: string;
}

export interface Pedido {
  id: string;
  numero: number;
  /** Clave para que el comprador vea su pedido sin tener cuenta. */
  token: string;
  fecha: string;
  items: ItemPedido[];
  subtotal: number;
  envio: number;
  total: number;
  entrega: FormaEntrega;
  direccion: string;
  cliente: { nombre: string; telefono: string; email: string };
  pago: FormaPago;
  estadoPago: "pendiente" | "pagado" | "rechazado";
  estado: EstadoPedido;
  notasCliente: string;
  notas: string;
  mpPagoId?: string;
  atendidoPor?: string;
  actualizado: string;
}

/** Costo de envío según la configuración. */
export function costoEnvio(c: ConfigTienda, entrega: FormaEntrega, subtotal: number) {
  if (entrega !== "domicilio") return 0;
  if (c.domicilio.gratisDesde > 0 && subtotal >= c.domicilio.gratisDesde) return 0;
  return c.domicilio.costo;
}
