/**
 * Datos PRIVADOS del negocio (nunca se muestran en la página pública):
 * cuánto se pagó cada auto, comisiones de autos de terceros, datos del dueño, etc.
 * Las funciones de cálculo se usan en el panel para mostrar la ganancia en vivo.
 */

/**
 * Cómo se cobra un auto de un cliente (consignación):
 * - porcentaje: un % del precio de venta (ej. 5%)
 * - fijo:       un monto fijo en pesos (ej. $500.000)
 * - neto:       se acuerda cuánto recibe el dueño; la agencia se queda con la diferencia
 */
export type ModoComision = "porcentaje" | "fijo" | "neto";

export const MODO_COMISION_TEXTO: Record<ModoComision, string> = {
  porcentaje: "Porcentaje del precio",
  fijo: "Monto fijo",
  neto: "Precio acordado para el dueño",
};

/** Papeles que se reciben al ingresar un auto en consignación. */
export const PAPELES = [
  "Título del automotor",
  "Cédula verde",
  "Informe de dominio",
  "Verificación policial",
  "Formulario 08 firmado",
  "Libre deuda de patentes",
  "Autorización para manejarlo (pruebas de manejo)",
] as const;

export type MotivoRetiro = "antes" | "vendioAfuera" | "vencio";
export const MOTIVO_RETIRO_TEXTO: Record<MotivoRetiro, string> = {
  antes: "Lo retiró antes de que termine el plazo",
  vendioAfuera: "Lo vendió por su cuenta",
  vencio: "Terminó el plazo sin venderse",
};

export interface NegocioAuto {
  /** propio: lo compró la agencia. consignacion: es de un cliente y se cobra comisión. */
  tipo: "propio" | "consignacion";
  /** Auto propio: lo que se pagó. */
  costo: number;
  /** Auto propio: gastos de preparación (mecánica, chapa, papeles, lavado...). */
  gastos: number;
  /** Consignación: datos del dueño. */
  duenoNombre: string;
  duenoTelefono: string;
  comisionModo: ModoComision;
  /** % si es porcentaje, $ si es fijo, $ para el dueño si es neto. */
  comisionValor: number;
  /** Se completa al marcarlo como vendido. */
  precioVenta?: number;
  fechaVenta?: string;
  /** Quién lo vendió (nombre del usuario del panel). */
  vendidoPor?: string;
  notas: string;

  /** Patente (privada: no se muestra en la página). */
  dominio: string;

  /* ── Acuerdo de consignación ── */
  duenoDni: string;
  duenoDomicilio: string;
  /** Fecha en que el auto entró a la agencia (AAAA-MM-DD). */
  fechaIngreso: string;
  /** Duración del acuerdo, en días. */
  plazoDias: number;
  /** Si lo vende por su cuenta mientras dura el acuerdo, igual paga la comisión. */
  exclusividad: boolean;
  /** Lo que paga si lo retira antes de que termine el plazo. */
  cargoRetiro: number;
  papeles: string[];

  /** Se completa si el dueño lo retiró. */
  retiro?: { motivo: MotivoRetiro; cobrado: number; fecha: string };
}

export interface Ajustes {
  /** Comisión que se propone por defecto al cargar un auto de un cliente. */
  comisionModo: ModoComision;
  comisionValor: number;
  /** Lo mínimo que se cobra por un auto en consignación, en pesos (0 = sin mínimo). */
  comisionMinima: number;
  financiacion: {
    /** Tasa Nominal Anual, en % (ej. 55). */
    tna: number;
    /** Anticipo mínimo, en % (ej. 30). */
    anticipoMinimo: number;
    plazos: number[];
  };
  /** A partir de cuántos días en venta se avisa en el tablero. */
  diasAlerta: number;
  /** Valores por defecto para los acuerdos de consignación. */
  consignacion: {
    plazoDias: number;
    cargoRetiro: number;
    exclusividad: boolean;
    /** Cuántos días antes del vencimiento se avisa en el tablero. */
    diasAvisoVencimiento: number;
  };
}

export const AJUSTES_INICIALES: Ajustes = {
  comisionModo: "porcentaje",
  comisionValor: 5,
  comisionMinima: 0,
  financiacion: { tna: 55, anticipoMinimo: 30, plazos: [12, 18, 24, 36, 48] },
  diasAlerta: 60,
  consignacion: { plazoDias: 60, cargoRetiro: 0, exclusividad: true, diasAvisoVencimiento: 7 },
};

/** Financiación tal como la usa la página pública (tasas en fracción: 0.55 = 55%). */
export type Financiacion = { tna: number; anticipoMinimo: number; plazos: number[] };

export const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function negocioVacio(ajustes: Ajustes): NegocioAuto {
  const c = { ...AJUSTES_INICIALES.consignacion, ...ajustes.consignacion };
  return {
    tipo: "propio",
    costo: 0,
    gastos: 0,
    duenoNombre: "",
    duenoTelefono: "",
    comisionModo: ajustes.comisionModo,
    comisionValor: ajustes.comisionValor,
    notas: "",
    dominio: "",
    duenoDni: "",
    duenoDomicilio: "",
    fechaIngreso: hoyISO(),
    plazoDias: c.plazoDias,
    exclusividad: c.exclusividad,
    cargoRetiro: c.cargoRetiro,
    papeles: [],
  };
}

/** Completa los campos que no existían en datos guardados con versiones anteriores. */
export const completarNegocio = (n: Partial<NegocioAuto> | undefined, ajustes: Ajustes): NegocioAuto => ({
  ...negocioVacio(ajustes),
  ...(n?.fechaIngreso ? {} : { fechaIngreso: "" }),
  ...n,
});

/** Días que faltan para que venza el acuerdo de consignación (negativo si ya venció). null si no aplica. */
export function diasParaVencer(n: NegocioAuto, hoy = new Date()): number | null {
  if (n.tipo !== "consignacion" || !n.fechaIngreso || !(n.plazoDias > 0)) return null;
  const [a, m, d] = n.fechaIngreso.split("-").map(Number);
  const vence = new Date(a, m - 1, d + n.plazoDias);
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((+vence - +base) / 86_400_000);
}

export function fechaVencimiento(n: NegocioAuto): Date | null {
  if (!n.fechaIngreso || !(n.plazoDias > 0)) return null;
  const [a, m, d] = n.fechaIngreso.split("-").map(Number);
  return new Date(a, m - 1, d + n.plazoDias);
}

/**
 * Ganancia de la agencia si el auto se vende a `precio`.
 * Devuelve null si faltan datos para calcularla (ej. auto propio sin costo cargado).
 */
export function calcularGanancia(n: NegocioAuto, precio: number, comisionMinima = 0): number | null {
  if (!(precio > 0)) return null;
  if (n.tipo === "propio") {
    if (!(n.costo > 0)) return null;
    return precio - n.costo - (n.gastos || 0);
  }
  let comision: number;
  if (n.comisionModo === "porcentaje") comision = (precio * n.comisionValor) / 100;
  else if (n.comisionModo === "fijo") comision = n.comisionValor;
  else {
    if (!(n.comisionValor > 0)) return null;
    return precio - n.comisionValor; // en "neto" la diferencia es la ganancia, sin mínimo
  }
  return Math.max(comision, comisionMinima);
}

/** Cuánto le queda al dueño de un auto en consignación. */
export function paraElDueno(n: NegocioAuto, precio: number, comisionMinima = 0): number | null {
  if (n.tipo !== "consignacion") return null;
  const g = calcularGanancia(n, precio, comisionMinima);
  return g === null ? null : precio - g;
}
