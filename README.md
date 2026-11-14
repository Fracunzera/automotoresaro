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
cp .env.example .env.local   # y poné una contraseña en ADMIN_PASSWORD
npm run dev
```

Abrí http://localhost:3000 (sitio) y http://localhost:3000/admin (panel).

## Panel de administración (`/admin`)

Pensado para usarse desde el celular, con letra y botones grandes.

- **Inicio (tablero):** autos en venta y reservados, valor del stock, ganancia si se vende todo, ventas y ganancia del mes, y avisos (autos con muchos días a la venta, sin fotos o sin datos de compra). Tiene accesos directos para cargar un auto o cambiar comisiones.
- **Mis autos:** pestañas En venta / Vendidos / Ocultos, con botones para **Lo vendí** (pide el precio final), **Reservar**, **Ocultar**, **Publicar**, **Editar** y **Borrar** (siempre con confirmación).
- **Cargar auto:** fotos desde la cámara o la galería (se achican solas antes de subir), con botones para elegir la principal y ordenarlas. Marca, modelo, año, km, tipo, color y equipamiento se eligen con botones grandes.
- **Datos del negocio (privados):** en cada auto se indica si es **propio** (cuánto se pagó y gastos de preparación) o **de un cliente / consignación** (nombre y teléfono del dueño, y comisión). La ganancia se calcula en vivo.
- **Comisiones:** comisión por defecto para autos de clientes, con tres formas de cobrar (porcentaje del precio, monto fijo, o precio acordado para el dueño) y comisión mínima opcional. También se cambian la tasa, el anticipo y las cuotas del simulador de la página.

### Dónde se guardan los datos

- **En Vercel:** crear un almacenamiento **Blob** en el proyecto (Storage → Create → Blob). Vercel agrega solo `BLOB_READ_WRITE_TOKEN`. Agregar también `ADMIN_PASSWORD` en Settings → Environment Variables.
- **En la compu / servidor propio:** sin `BLOB_READ_WRITE_TOKEN`, todo se guarda en `data/` (autos, datos del negocio y fotos).
- Cada cambio guarda una copia nueva y se conservan las **últimas 30 como respaldo**.
- Los datos privados del negocio (costos, comisiones, dueños) se guardan **separados** de los autos y, en la nube, **cifrados**. Nunca se envían a la página pública.
- Mientras no se cargue nada, la página muestra **autos de ejemplo**. Se borran desde el Inicio del panel con un botón.

## Lo primero que hay que cambiar

1. **`src/config/site.ts`**: número de WhatsApp, teléfono, dirección, horarios, el texto sobre traslados a otras ciudades y los beneficios (dejá solo los que realmente se ofrecen).
2. Los autos se cargan desde el **panel** (`/admin`). La tasa, las cuotas y las comisiones también se cambian ahí.
3. **`src/app/nosotros/page.tsx`**: la historia de la agencia.


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

- **Registro de consultas** (leads) además de WhatsApp, para hacer seguimiento.
- **Tasador automático** del usado según marca, modelo, año y km (referencia de precios de mercado).
- **Reserva online con seña** con Mercado Pago.
- **Publicación automática** del stock en Mercado Libre, Instagram y Facebook Marketplace.
- **Precalificación crediticia** online integrada con la financiera.
- SEO: sitemap, datos estructurados de vehículos y Google Business Profile.
