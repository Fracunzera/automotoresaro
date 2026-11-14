# Automotores Aro: agencia de autos online

Sitio web para comprar y vender autos usados, inspirado en el modelo de Kavak y Carone:
catálogo con filtros, ficha de cada auto con informe de revisión, simulador de financiación,
cotización de tu usado y contacto directo por WhatsApp.

Hecho con **Next.js 15 + React 19 + Tailwind CSS 4**. No necesita base de datos para arrancar.

Tipografía: **Barlow** y **Barlow Condensed** (inspiradas en patentes y carteles viales), alojadas en el propio sitio (`src/fonts`), sin depender de Google Fonts. Licencia libre SIL OFL (`src/fonts/OFL.txt`).

## Páginas

| Ruta | Qué tiene |
|---|---|
| `/` | Portada con buscador, autos destacados, beneficios, "cómo funciona" y CTA para vender |
| `/autos` | Catálogo con filtros (marca, tipo, precio, año, km, transmisión, combustible), buscador y orden |
| `/autos/[slug]` | Ficha del auto: galería, datos, equipamiento, ficha técnica, informe de revisión, simulador de cuotas, botones de WhatsApp (consulta / test drive) y autos similares |
| `/vender` | Formulario para cotizar tu auto (venta o parte de pago); arma el mensaje y abre WhatsApp |
| `/financiacion` | Simulador de cuotas libre y requisitos |
| `/nosotros` | Historia, dirección, horarios y preguntas frecuentes |

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

## Lo primero que hay que cambiar

1. **`src/config/site.ts`**: número de WhatsApp, teléfono, dirección, horarios, tasa y plazos de financiación, y los beneficios (dejá solo los que realmente se ofrecen).
2. **`src/data/autos.ts`**: los autos actuales son **de ejemplo**. Reemplazalos por el stock real.
3. **`src/app/nosotros/page.tsx`**: la historia de la agencia.

## Cómo cargar un auto

1. Abrí `src/data/autos.ts`, copiá un bloque `{ ... }` y cambiá los datos.
2. El `slug` es la dirección web del auto (ej. `toyota-corolla-xei-2021`): sin espacios ni tildes, y único.
3. Fotos: crealas en `public/autos/<slug>/1.jpg`, `2.jpg`, … y listalas así:
   `fotos: ["/autos/toyota-corolla-xei-2021/1.jpg", "/autos/toyota-corolla-xei-2021/2.jpg"]`.
   Sin fotos se muestra una ilustración del color del auto.
4. `reservado: true` lo marca como reservado; `destacado: true` lo muestra en la portada.

### Fotos: lo que más cambia cómo se ve el sitio

Kavak y Carone se ven profesionales sobre todo por las fotos: **todos los autos sacados en el mismo lugar, con el mismo fondo y los mismos ángulos**. Recomendación:

- Elegir una pared lisa (gris o blanca) o un lugar sin cosas atrás, y sacar siempre ahí.
- Siempre la misma secuencia: frente 3/4, lateral, trasera 3/4, interior delantero, tablero (con km), asientos traseros, baúl, motor.
- Celular en horizontal, de día con luz pareja (sin sol directo), auto limpio.
- La primera foto de la lista es la que aparece en el catálogo.

Para la portada se puede poner una foto de la agencia o el playón en `public/portada.jpg` y escribir `"/portada.jpg"` en `fotoPortada` dentro de `src/config/site.ts`.

## Publicarlo en internet

La forma más simple y gratuita es **Vercel**: conectás este repositorio de GitHub y cada cambio se publica solo.
Después se conecta el dominio (ej. `automotoresaro.com.ar`, que se compra en NIC Argentina).

## Hoja de ruta (próximas etapas)

- **Panel de administración** para que se carguen autos y fotos desde el celular, sin tocar código (Supabase o similar).
- **Registro de consultas** (leads) además de WhatsApp, para hacer seguimiento.
- **Tasador automático** del usado según marca, modelo, año y km (referencia de precios de mercado).
- **Reserva online con seña** con Mercado Pago.
- **Publicación automática** del stock en Mercado Libre, Instagram y Facebook Marketplace.
- **Precalificación crediticia** online integrada con la financiera.
- SEO: sitemap, datos estructurados de vehículos y Google Business Profile.
