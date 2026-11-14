/**
 * Inventario de autos.
 *
 * Para publicar un auto nuevo: copiá uno de los bloques de abajo, cambiá los datos
 * y guardá. Las fotos van en /public/autos/<slug>/ (por ejemplo 1.jpg, 2.jpg...)
 * y se listan en `fotos`. Si un auto no tiene fotos se muestra una ilustración.
 *
 * IMPORTANTE: los autos y precios de este archivo son de EJEMPLO.
 */

export type Combustible = "Nafta" | "Diésel" | "GNC" | "Híbrido" | "Eléctrico";
export type Transmision = "Manual" | "Automática";
export type Carroceria = "Sedán" | "Hatchback" | "SUV" | "Pick-up" | "Utilitario" | "Coupé";

export interface Auto {
  /** Identificador para la URL, sin espacios ni tildes. Debe ser único. */
  slug: string;
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
  /** Color aproximado en hexadecimal, para la ilustración cuando no hay fotos. */
  colorHex: string;
  puertas: number;
  motor: string;
  fotos: string[];
  equipamiento: string[];
  descripcion: string;
  unicoDueno?: boolean;
  serviceOficial?: boolean;
  destacado?: boolean;
  reservado?: boolean;
}

export const autos: Auto[] = [
  {
    slug: "toyota-corolla-xei-2021",
    marca: "Toyota",
    modelo: "Corolla",
    version: "2.0 XEi CVT",
    anio: 2021,
    km: 48000,
    precio: 32500000,
    combustible: "Nafta",
    transmision: "Automática",
    carroceria: "Sedán",
    color: "Gris plata",
    colorHex: "#9ca3af",
    puertas: 4,
    motor: "2.0 L 170 CV",
    fotos: [],
    equipamiento: ["Climatizador", "Cámara de retroceso", "Apple CarPlay / Android Auto", "Control de crucero", "7 airbags", "Llantas de aleación"],
    descripcion: "Impecable, único dueño y todos los services en concesionario oficial. Cubiertas nuevas.",
    unicoDueno: true,
    serviceOficial: true,
    destacado: true,
  },
  {
    slug: "volkswagen-amarok-highline-2019",
    marca: "Volkswagen",
    modelo: "Amarok",
    version: "2.0 TDI Highline 4x2 AT",
    anio: 2019,
    km: 92000,
    precio: 36900000,
    combustible: "Diésel",
    transmision: "Automática",
    carroceria: "Pick-up",
    color: "Blanco",
    colorHex: "#f3f4f6",
    puertas: 4,
    motor: "2.0 TDI 180 CV",
    fotos: [],
    equipamiento: ["Cuero", "Navegador", "Sensores de estacionamiento", "Barras antivuelco", "Cobertor de caja"],
    descripcion: "Muy cuidada, uso particular. Lista para transferir.",
    serviceOficial: true,
    destacado: true,
  },
  {
    slug: "peugeot-208-allure-2022",
    marca: "Peugeot",
    modelo: "208",
    version: "1.6 Allure Pack",
    anio: 2022,
    km: 31000,
    precio: 21800000,
    combustible: "Nafta",
    transmision: "Manual",
    carroceria: "Hatchback",
    color: "Azul",
    colorHex: "#1d4ed8",
    puertas: 5,
    motor: "1.6 L 115 CV",
    fotos: [],
    equipamiento: ["Pantalla táctil 7\"", "Climatizador", "Sensores traseros", "Luces LED"],
    descripcion: "Como nuevo, con garantía de fábrica vigente.",
    unicoDueno: true,
    destacado: true,
  },
  {
    slug: "jeep-renegade-sport-2020",
    marca: "Jeep",
    modelo: "Renegade",
    version: "1.8 Sport AT",
    anio: 2020,
    km: 64000,
    precio: 24900000,
    combustible: "Nafta",
    transmision: "Automática",
    carroceria: "SUV",
    color: "Rojo",
    colorHex: "#b91c1c",
    puertas: 5,
    motor: "1.8 L 139 CV",
    fotos: [],
    equipamiento: ["Control de estabilidad", "Bluetooth", "Volante multifunción", "Llantas 16\""],
    descripcion: "SUV cómoda y económica. Service recién hecho.",
    destacado: true,
  },
  {
    slug: "ford-ranger-xlt-2018",
    marca: "Ford",
    modelo: "Ranger",
    version: "3.2 XLT 4x4 MT",
    anio: 2018,
    km: 118000,
    precio: 29500000,
    combustible: "Diésel",
    transmision: "Manual",
    carroceria: "Pick-up",
    color: "Gris oscuro",
    colorHex: "#374151",
    puertas: 4,
    motor: "3.2 TDCi 200 CV",
    fotos: [],
    equipamiento: ["4x4", "Climatizador bizona", "Sync 3", "Gancho de arrastre"],
    descripcion: "Fuerte y lista para trabajar o viajar.",
  },
  {
    slug: "chevrolet-onix-premier-2021",
    marca: "Chevrolet",
    modelo: "Onix",
    version: "1.0 Turbo Premier AT",
    anio: 2021,
    km: 42000,
    precio: 19900000,
    combustible: "Nafta",
    transmision: "Automática",
    carroceria: "Hatchback",
    color: "Negro",
    colorHex: "#111827",
    puertas: 5,
    motor: "1.0 Turbo 116 CV",
    fotos: [],
    equipamiento: ["Wi-Fi a bordo", "Cámara de retroceso", "Arranque sin llave", "6 airbags"],
    descripcion: "Excelente consumo, ideal ciudad.",
    unicoDueno: true,
  },
  {
    slug: "fiat-cronos-drive-2023",
    marca: "Fiat",
    modelo: "Cronos",
    version: "1.3 Drive",
    anio: 2023,
    km: 15000,
    precio: 18700000,
    combustible: "Nafta",
    transmision: "Manual",
    carroceria: "Sedán",
    color: "Blanco",
    colorHex: "#f9fafb",
    puertas: 4,
    motor: "1.3 L 99 CV",
    fotos: [],
    equipamiento: ["Pantalla táctil", "Aire acondicionado", "Sensores traseros"],
    descripcion: "Casi 0 km, con garantía oficial.",
    reservado: true,
  },
  {
    slug: "renault-kangoo-confort-2019",
    marca: "Renault",
    modelo: "Kangoo",
    version: "1.6 Confort 5 asientos",
    anio: 2019,
    km: 87000,
    precio: 14900000,
    combustible: "GNC",
    transmision: "Manual",
    carroceria: "Utilitario",
    color: "Gris",
    colorHex: "#6b7280",
    puertas: 5,
    motor: "1.6 L + GNC 5ta gen.",
    fotos: [],
    equipamiento: ["Equipo de GNC", "Doble puerta lateral", "Aire acondicionado"],
    descripcion: "Con GNC homologado. Muy económica para trabajo.",
  },
  {
    slug: "toyota-hilux-srv-2020",
    marca: "Toyota",
    modelo: "Hilux",
    version: "2.8 SRV 4x4 AT",
    anio: 2020,
    km: 76000,
    precio: 41500000,
    combustible: "Diésel",
    transmision: "Automática",
    carroceria: "Pick-up",
    color: "Plata",
    colorHex: "#d1d5db",
    puertas: 4,
    motor: "2.8 TDI 177 CV",
    fotos: [],
    equipamiento: ["Cuero", "4x4 con reductora", "Control de descenso", "Cámara de retroceso"],
    descripcion: "Services oficiales, nunca chocada.",
    serviceOficial: true,
  },
  {
    slug: "volkswagen-taos-highline-2022",
    marca: "Volkswagen",
    modelo: "Taos",
    version: "1.4 TSI Highline",
    anio: 2022,
    km: 28000,
    precio: 38900000,
    combustible: "Nafta",
    transmision: "Automática",
    carroceria: "SUV",
    color: "Azul oscuro",
    colorHex: "#1e3a8a",
    puertas: 5,
    motor: "1.4 TSI 150 CV",
    fotos: [],
    equipamiento: ["Techo panorámico", "Tablero digital", "Asistente de carril", "Carga inalámbrica"],
    descripcion: "Full equipo, impecable.",
    unicoDueno: true,
    serviceOficial: true,
  },
];

export function getAuto(slug: string): Auto | undefined {
  return autos.find((a) => a.slug === slug);
}

export function tituloAuto(a: Auto): string {
  return `${a.marca} ${a.modelo} ${a.version}`;
}
