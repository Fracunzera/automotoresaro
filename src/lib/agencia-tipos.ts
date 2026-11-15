/**
 * Datos de la agencia que se editan desde el panel (Panel → Datos de la agencia).
 * Los valores iniciales salen de src/config/site.ts; lo que se guarde en el panel tiene prioridad.
 */
import { site } from "@/config/site";
import { esTienda } from "./rubro";

export interface Agencia {
  nombre: string;
  /** Solo números, formato internacional (ej. 5492966123456). */
  whatsapp: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  /** Link de Google Maps. Si está vacío se arma solo con la dirección. */
  mapa: string;
  horarios: string;
  instagram: string;
  facebook: string;
  /** Texto para compradores de otras ciudades. */
  traslado: string;
  legal: { titular: string; cuit: string };
  marca: Marca;
}

export interface Beneficio {
  titulo: string;
  texto: string;
  icono: string;
}

/** Identidad visual y textos de la portada. Se editan en Panel → Ajustes → Marca y portada. */
export interface Marca {
  /** Color de botones, precios destacados y detalles (ej. rojo). */
  colorPrincipal: string;
  /** Color oscuro del encabezado de datos, la portada y el pie (ej. negro). */
  colorOscuro: string;
  /** Logo (imagen). Vacío = se muestra el nombre en letras. */
  logo: string;
  eslogan: string;
  descripcion: string;
  portadaTitulo: string;
  portadaFoto: string;
  beneficios: Beneficio[];
  /** Página "Nosotros". Párrafos separados por una línea en blanco. */
  nosotrosTitulo: string;
  nosotrosTexto: string;
}

export const ICONOS_BENEFICIO: { id: string; nombre: string }[] = [
  { id: "check", nombre: "Tilde" },
  { id: "card", nombre: "Tarjeta" },
  { id: "swap", nombre: "Intercambio" },
  { id: "doc", nombre: "Documento" },
  { id: "shield", nombre: "Escudo" },
  { id: "clock", nombre: "Reloj" },
  { id: "pin", nombre: "Ubicación" },
  { id: "star", nombre: "Estrella" },
  { id: "phone", nombre: "Teléfono" },
];

export const MARCA_INICIAL: Marca = esTienda
  ? {
      colorPrincipal: "#d12b1f",
      colorOscuro: "#15171a",
      logo: "",
      eslogan: "Comprá online y recibilo en tu casa.",
      descripcion: "Tienda online con envíos y retiro en el local. Pagá como prefieras.",
      portadaTitulo: "Todo lo que buscás, en un solo lugar",
      portadaFoto: "",
      beneficios: [
        { titulo: "Envíos a domicilio", texto: "Te lo llevamos a tu casa o lo retirás en el local.", icono: "pin" },
        { titulo: "Pagá como quieras", texto: "Mercado Pago, transferencia o efectivo al retirar.", icono: "card" },
        { titulo: "Compra segura", texto: "Te avisamos cada paso de tu pedido.", icono: "shield" },
        { titulo: "Atención por WhatsApp", texto: "Escribinos y te respondemos rápido.", icono: "phone" },
      ],
      nosotrosTitulo: "Quiénes somos",
      nosotrosTexto: "Somos una tienda local que ahora también vende online. Elegimos cada producto y te atendemos como siempre, ahora desde tu casa.\n\nComprá en la web y recibilo en tu casa o retiralo en el local.",
    }
  : {
      colorPrincipal: "#d12b1f",
      colorOscuro: "#15171a",
      logo: "",
      eslogan: site.eslogan,
      descripcion: site.descripcion,
      portadaTitulo: "Comprá, vendé o cambiá tu auto",
      portadaFoto: site.fotoPortada,
      beneficios: site.beneficios.map((b) => ({ ...b })),
      nosotrosTitulo: "Atención de agencia de barrio, stock a un click",
      nosotrosTexto: "Vendemos autos usados en consignación: los dueños nos confían su auto y nosotros nos ocupamos de todo, desde la publicación hasta que el comprador tiene la cédula a su nombre.\n\nSi buscás auto, en la web ves el stock actualizado y simulás la cuota. Si querés vender el tuyo, lo cargás en la página y nosotros hacemos el resto.",
    };

export const AGENCIA_INICIAL: Agencia = {
  nombre: site.nombre,
  whatsapp: site.whatsapp,
  telefono: site.telefono,
  email: site.email,
  direccion: site.direccion,
  ciudad: site.ciudad,
  provincia: site.provincia,
  mapa: site.mapa,
  horarios: site.horarios,
  instagram: site.instagram,
  facebook: "",
  traslado: site.traslado,
  legal: { ...site.legal },
  marca: MARCA_INICIAL,
};

/**
 * Convierte lo que escribe la persona en un número de WhatsApp válido para Argentina.
 * Acepta "2966 15 123456", "02966-123456", "+54 9 2966 123456", etc.
 * Los números de otros países se escriben con + adelante.
 */
export function normalizarWhatsapp(texto: string): string {
  const internacional = texto.trim().startsWith("+");
  let d = texto.replace(/\D/g, "");
  if (!d) return "";
  if (internacional && !d.startsWith("54")) return d;
  if (d.startsWith("54")) d = d.slice(2);
  if (d.startsWith("9")) d = d.slice(1);
  if (d.startsWith("0")) d = d.slice(1);
  // Sacar el "15" que va después del código de área (de 2 a 4 dígitos)
  for (const largo of [4, 3, 2]) {
    if (d.length === 12 && d.slice(largo, largo + 2) === "15") {
      d = d.slice(0, largo) + d.slice(largo + 2);
      break;
    }
  }
  return `549${d}`;
}

export const linkMapa = (a: Pick<Agencia, "mapa" | "direccion" | "ciudad" | "provincia">) =>
  a.mapa || `https://maps.google.com/?q=${encodeURIComponent(`${a.direccion}, ${a.ciudad}, ${a.provincia}`)}`;

export const telLink = (telefono: string) => `tel:${telefono.replace(/[^+\d]/g, "")}`;

/* ───────────── Colores ───────────── */

const aRGB = (hex: string) => {
  const h = /^#?([0-9a-f]{6})$/i.exec(hex.trim())?.[1] ?? "000000";
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const aHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;
/** Mezcla un color con otro (t = 0 → a, t = 1 → b). */
const mezclar = (a: string, b: string, t: number) => {
  const x = aRGB(a);
  const y = aRGB(b);
  return aHex(x.map((v, i) => v + (y[i] - v) * t));
};

export const colorValido = (c: string) => /^#[0-9a-f]{6}$/i.test(c);

/** Luminancia relativa (0 = negro, 1 = blanco). */
export function luminancia(hex: string) {
  const [r, g, b] = aRGB(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** ¿Se lee bien texto blanco sobre este color? (contraste mínimo 3:1 para botones). */
export const blancoSeLee = (hex: string) => 1.05 / (luminancia(hex) + 0.05) >= 3;

/** Variables CSS del tema, a partir de los dos colores de la marca. */
export function cssTema(m: Pick<Marca, "colorPrincipal" | "colorOscuro">): string {
  const p = colorValido(m.colorPrincipal) ? m.colorPrincipal : MARCA_INICIAL.colorPrincipal;
  const o = colorValido(m.colorOscuro) ? m.colorOscuro : MARCA_INICIAL.colorOscuro;
  return `:root{--color-rojo:${p};--color-rojo-oscuro:${mezclar(p, "#000000", 0.18)};--color-rojo-claro:${mezclar(p, "#ffffff", 0.9)};--color-tinta:${o};--color-tinta-2:${mezclar(o, "#ffffff", 0.12)}}`;
}
