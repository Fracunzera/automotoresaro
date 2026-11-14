/** Tipos y listas compartidas entre el sitio y el panel. */

export const COMBUSTIBLES = ["Nafta", "Diésel", "GNC", "Híbrido", "Eléctrico"] as const;
export const TRANSMISIONES = ["Manual", "Automática"] as const;
export const CARROCERIAS = ["Sedán", "Hatchback", "SUV", "Pick-up", "Utilitario", "Coupé"] as const;

export type Combustible = (typeof COMBUSTIBLES)[number];
export type Transmision = (typeof TRANSMISIONES)[number];
export type Carroceria = (typeof CARROCERIAS)[number];

/**
 * Estado de cada auto:
 * - publicado: se ve en la página
 * - reservado: se ve en la página con la etiqueta "Reservado"
 * - vendido:   no se ve en la página (queda guardado en el panel)
 * - oculto:    no se ve en la página (borrador o pausado)
 * - retirado:  auto de un cliente que el dueño se llevó (lo retiró o lo vendió por su cuenta)
 */
export const ESTADOS = ["publicado", "reservado", "vendido", "oculto", "retirado"] as const;
export type Estado = (typeof ESTADOS)[number];

export const ESTADO_TEXTO: Record<Estado, string> = {
  publicado: "En venta",
  reservado: "Reservado",
  vendido: "Vendido",
  oculto: "Oculto",
  retirado: "Retirado por el dueño",
};

export interface Auto {
  id: string;
  /** Dirección web del auto. Se genera sola y no cambia, para que los links compartidos sigan andando. */
  slug: string;
  estado: Estado;
  marca: string;
  modelo: string;
  version: string;
  anio: number;
  km: number;
  /** Precio de contado en pesos. */
  precio: number;
  combustible: Combustible;
  transmision: Transmision;
  carroceria: Carroceria;
  color: string;
  colorHex: string;
  puertas: number;
  motor: string;
  fotos: string[];
  equipamiento: string[];
  descripcion: string;
  unicoDueno: boolean;
  serviceOficial: boolean;
  destacado: boolean;
  /** Autos de muestra que vienen con el sitio. */
  ejemplo?: boolean;
  creado: string;
  actualizado: string;
}

/** Lo que se completa en el formulario del panel. */
export type DatosAuto = Omit<Auto, "id" | "slug" | "estado" | "creado" | "actualizado" | "ejemplo">;

export const MARCAS_COMUNES = [
  "Audi", "BAIC", "BMW", "Chery", "Chevrolet", "Citroën", "DS", "Fiat", "Ford", "Honda", "Hyundai",
  "Jeep", "Kia", "Mercedes-Benz", "Mitsubishi", "Nissan", "Peugeot", "RAM", "Renault", "Suzuki",
  "Toyota", "Volkswagen",
];

export const COLORES: { nombre: string; hex: string }[] = [
  { nombre: "Blanco", hex: "#f5f5f4" },
  { nombre: "Negro", hex: "#141414" },
  { nombre: "Gris plata", hex: "#c4c4c4" },
  { nombre: "Gris", hex: "#8b8f96" },
  { nombre: "Gris oscuro", hex: "#43474e" },
  { nombre: "Rojo", hex: "#b91c1c" },
  { nombre: "Bordó", hex: "#6d1a1f" },
  { nombre: "Azul", hex: "#1d4ed8" },
  { nombre: "Azul oscuro", hex: "#1e2f6b" },
  { nombre: "Celeste", hex: "#7cc4ec" },
  { nombre: "Verde", hex: "#1f5b33" },
  { nombre: "Beige", hex: "#d9c9a3" },
  { nombre: "Marrón", hex: "#6b4423" },
  { nombre: "Naranja", hex: "#e8620c" },
  { nombre: "Amarillo", hex: "#e8b90c" },
];

export const EQUIPAMIENTO_COMUN = [
  "Aire acondicionado", "Climatizador", "Dirección asistida", "Levantavidrios eléctricos",
  "Cierre centralizado", "Airbags", "Frenos ABS", "Control de estabilidad", "Bluetooth",
  "Pantalla táctil", "Apple CarPlay / Android Auto", "Cámara de retroceso",
  "Sensores de estacionamiento", "Control de crucero", "Llantas de aleación", "Tapizado de cuero",
  "Techo solar", "Tracción 4x4", "Equipo de GNC", "Gancho de arrastre",
];
