/**
 * Código corto para compartir un auto: tudominio.com.ar/a/k3f9x2
 * Se calcula a partir del id del auto (no hay que guardarlo) y no cambia nunca.
 */
export function codigoCorto(id: string): string {
  // FNV-1a de 32 bits → 6 caracteres en base 36
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(6, "0").slice(-6);
}

export const rutaCorta = (id: string) => `/a/${codigoCorto(id)}`;
