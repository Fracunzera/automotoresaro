import { site } from "@/config/site";

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("es-AR");

export const formatPrecio = (n: number) => ars.format(n);
export const formatKm = (n: number) => `${num.format(n)} km`;
export const formatNumero = (n: number) => num.format(Math.round(n));

/** Link de WhatsApp con mensaje precargado. */
export function whatsappLink(mensaje: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Cuota mensual con sistema francés (cuota fija).
 * @param capital monto a financiar
 * @param meses cantidad de cuotas
 * @param tna tasa nominal anual (0.55 = 55%)
 */
export function cuotaMensual(capital: number, meses: number, tna: number): number {
  if (capital <= 0 || meses <= 0) return 0;
  const i = tna / 12;
  if (i === 0) return capital / meses;
  return (capital * i) / (1 - Math.pow(1 + i, -meses));
}
