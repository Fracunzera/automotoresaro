/**
 * Datos de la agencia que se editan desde el panel (Panel → Datos de la agencia).
 * Los valores iniciales salen de src/config/site.ts; lo que se guarde en el panel tiene prioridad.
 */
import { site } from "@/config/site";

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
}

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
