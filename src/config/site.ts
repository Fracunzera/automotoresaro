/**
 * Configuración general de la agencia.
 * Todo lo que el negocio quiera cambiar (teléfono, dirección, tasas, beneficios)
 * se edita acá, sin tocar el resto del código.
 */
export const site = {
  nombre: "Automotores Aro",
  eslogan: "Autos usados revisados, financiación y tomamos tu usado.",
  descripcion:
    "Comprá o vendé tu auto usado con confianza. Unidades revisadas, financiación a tu medida y tasación de tu usado en el día.",

  // WhatsApp en formato internacional, sin "+", espacios ni guiones.
  // Ejemplo Argentina: 54 + 9 + código de área sin 0 + número sin 15.
  whatsapp: "5491100000000", // TODO: reemplazar por el número real
  telefono: "+54 9 11 0000-0000", // TODO
  email: "ventas@automotoresaro.com.ar", // TODO
  direccion: "Av. Siempreviva 742", // TODO
  ciudad: "Río Gallegos",
  provincia: "Santa Cruz",
  // Link a Google Maps (buscá la agencia en Maps > Compartir > Copiar link)
  mapa: "https://maps.google.com/?q=R%C3%ADo+Gallegos+Santa+Cruz", // TODO: link exacto de la agencia

  // Aviso para compradores de otras ciudades (se muestra en cada auto y en preguntas frecuentes)
  traslado:
    "Si sos de otra ciudad, podés venir a buscarlo o coordinar el traslado en camión (el costo corre por cuenta del comprador). Escribinos y lo vemos juntos.",
  // Foto de portada (opcional). Poné una foto de la agencia o del playón en /public/portada.jpg
  // y escribí acá "/portada.jpg". Vacío = fondo negro.
  fotoPortada: "" as string,
  horarios: "Lunes a viernes 9 a 19 h · Sábados 9 a 13 h",
  instagram: "https://instagram.com/", // TODO

  // Datos que aparecen en el contrato de consignación
  legal: {
    titular: "", // TODO: nombre y apellido (o razón social) del titular de la agencia
    cuit: "", // TODO
  },

  // La financiación (tasa, anticipo, cuotas) y las comisiones se cambian desde el panel: /admin/ajustes

  // Beneficios que se muestran en la home y en cada ficha.
  // Dejar solo los que el negocio realmente ofrece.
  beneficios: [
    {
      titulo: "Revisión mecánica completa",
      texto: "Cada auto pasa por una inspección de más de 100 puntos antes de publicarse.",
      icono: "check",
    },
    {
      titulo: "Financiación a tu medida",
      texto: "Llevate tu auto con un anticipo y el resto en cuotas fijas.",
      icono: "card",
    },
    {
      titulo: "Tomamos tu usado",
      texto: "Te lo cotizamos en el día y lo usamos como parte de pago.",
      icono: "swap",
    },
    {
      titulo: "Papeles en regla",
      texto: "Informe de dominio, verificación policial y libre de deudas. Nosotros gestionamos la transferencia.",
      icono: "doc",
    },
  ],
} as const;

export type Site = typeof site;
