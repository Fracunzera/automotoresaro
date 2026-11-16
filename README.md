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

**Cómo entra la agencia:** botón **Ingresar** (arriba a la derecha) → pestaña **Soy de la agencia** → usuario y contraseña (`ADMIN_USER` / `ADMIN_PASSWORD`). También desde `tudominio/admin` o el link "Acceso agencia" al pie. Queda conectado 30 días.
**Como app en el celular:** con el panel abierto, en el menú del navegador tocar **"Agregar a pantalla de inicio"** (Android: menú ⋮; iPhone: botón Compartir). Queda un ícono "Panel Aro" que abre directo el panel.

- **Inicio (tablero):** autos en venta y reservados, valor del stock, ganancia si se vende todo, ventas y ganancia del mes, y avisos (autos con muchos días a la venta, sin fotos o sin datos de compra). Tiene accesos directos para cargar un auto o cambiar comisiones.
- **Mis autos:** pestañas En venta / Vendidos / Ocultos, con botones para **Lo vendí** (pide el precio final), **Reservar**, **Ocultar**, **Publicar**, **Editar** y **Borrar** (siempre con confirmación).
- **Cargar auto:** fotos desde la cámara o la galería (se achican solas antes de subir), con botones para elegir la principal y ordenarlas. Marca, modelo, año, km, tipo, color y equipamiento se eligen con botones grandes.
- **Datos del negocio (privados):** en cada auto se indica si es **propio** (cuánto se pagó y gastos de preparación) o **de un cliente / consignación** (nombre y teléfono del dueño, y comisión). La ganancia se calcula en vivo.
- **Consignación (autos de clientes):** en cada auto se cargan patente, DNI y domicilio del dueño, fecha de ingreso, plazo del acuerdo, exclusividad, cargo por retiro anticipado y papeles recibidos. Botón **Contrato** para imprimir el acuerdo ya completo y firmarlo (es un **modelo orientativo: revisarlo con un abogado** antes de usarlo; completar `legal.titular` y `legal.cuit` en `src/config/site.ts`). Si el dueño se lleva el auto, botón **El dueño lo retiró**: se elige qué pasó (lo retiró antes, lo vendió por su cuenta o terminó el plazo) y cuánto se le cobró; ese cobro se suma a la ganancia del mes. El Inicio avisa cuando un acuerdo está por vencer.
- **Comisiones:** comisión por defecto para autos de clientes, con tres formas de cobrar (porcentaje del precio, monto fijo, o precio acordado para el dueño) y comisión mínima opcional. También se cambian la tasa, el anticipo y las cuotas del simulador de la página.

- **Ajustes → Datos de la agencia:** nombre, WhatsApp (se escribe como sea, ej. "2966 15 123456", y se corrige solo), teléfono, email, dirección, horarios, link de Google Maps, redes, el aviso para compradores de otras ciudades y titular/CUIT para el contrato. Se actualiza al instante en la página, los mails y el contrato. Los valores de `src/config/site.ts` son solo los iniciales.
- **Ajustes → Empleados:** dar de alta empleados con su usuario y contraseña, con dos roles:
  - **Administrador:** todo.
  - **Vendedor:** carga y edita autos, los reserva o los marca como vendidos, y atiende clientes. **No ve** costos, comisiones, ganancias, ajustes, empleados ni mails.

  Se los puede dar de baja (no pueden entrar más y se les cierra la sesión al instante) o cambiarles la contraseña. Las contraseñas se guardan cifradas. En el Inicio se ve **quién vendió** cada auto y las ventas del mes por vendedor. Cada empleado puede cambiar su propia contraseña en **Mi contraseña**. La cuenta principal (`ADMIN_USER` / `ADMIN_PASSWORD`) se cambia en el servidor.
- **Para publicar (consignación):** el modelo es vender autos de terceros, sin comprarlos. El dueño carga su auto en **"Vendé tu auto"** con datos, **fotos** y el precio que pretende (si tiene cuenta, sus datos se completan solos). Queda en **Para publicar** con aviso en el Inicio y mail a `ADMIN_EMAIL`. Tu papá lo revisa, habla con el dueño y toca **"Revisar y publicar"**: se abre el formulario ya completo (fotos, precio, dueño y consignación) y al guardar queda publicado y vinculado. El dueño sigue el estado en **Mi cuenta** (En revisión, Publicado, Vendido).
- **Compartir autos:** cada auto tiene un **link corto** (`tudominio/a/k3f9x2`) que lleva a su ficha. En la página, el botón **Compartir** permite copiar el link, mandarlo por WhatsApp o Facebook, o usar el menú del celular (Instagram, Telegram…). En el panel aparece un recuadro para compartirlo apenas se publica, y cada auto en venta tiene su botón. Al pegar el link en WhatsApp o Facebook se ve la vista previa con foto, modelo y precio (requiere `SITE_URL`).
- **Agenda de visitas:** en cada auto publicado, el comprador toca **"Agendar visita y prueba de manejo"**, elige día y horario libre y deja nombre y teléfono. El horario se bloquea para ese auto, y hay un máximo de visitas a la vez. Los turnos aparecen en **Agenda** (con el número de visitas sin confirmar en el menú y las "Visitas de hoy" en el Inicio), con botones de WhatsApp (mensaje de confirmación ya escrito) y Llamar, "Ya le confirmé", "Vino", "No vino", "Cancelar" y **quién lo atiende**. Días y horarios de atención, duración, visitas a la vez y anticipación se configuran en **Ajustes → Comisiones y financiación → Agenda de visitas**. Si están configurados, llegan mails a la agencia y al comprador.
- **Pago al dueño:** la agencia cobra al comprador y le transfiere al dueño su parte. Al vender un auto en consignación, en **Vendidos** aparece cuánto le corresponde al dueño y el botón **"Ya le pagué al dueño"**. El Inicio avisa cuánto falta pagar y a quién.
- **Clientes:** lista de clientes registrados (con los autos que guardaron en favoritos y lo que compraron), buscador y botón de WhatsApp. Se pueden agregar a mano; al marcar un auto como vendido se pueden guardar los datos del comprador.
- **Mails:** escribir un mail (con autos del stock incluidos), mandarse una prueba, y enviarlo a todos los clientes que aceptaron recibir novedades o a uno solo. Cada mail lleva un link para darse de baja.

## Cuentas de clientes

Los clientes tocan **Ingresar** o el **corazón** de un auto, ponen su email y reciben un **código de 6 números** por mail (sin contraseñas). Sirve para **guardar favoritos** y verlos en **Mi cuenta** desde cualquier dispositivo. Al registrarse eligen si quieren recibir novedades por mail (desmarcado por defecto, como pide la Ley 25.326). La política de privacidad está en `/privacidad` (revisarla antes de publicar).

### Dónde se guardan los datos

- **En el VPS (recomendado):** todo se guarda en la carpeta `DATA_DIR` (autos, fotos, clientes y datos del negocio). Ver "Publicarlo en el VPS".
- **En Vercel (alternativa):** crear un almacenamiento **Blob** (Storage → Create → Blob); Vercel agrega `BLOB_READ_WRITE_TOKEN`.
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

## Publicarlo en el VPS

Requisitos: Ubuntu/Debian con **Node.js 22**, **nginx** y **PM2** (`npm i -g pm2`), y el dominio apuntando a la IP del VPS (registro A).

```bash
git clone https://github.com/Fracunzera/automotoresaro.git && cd automotoresaro
npm ci
cp .env.example .env.local     # completar: ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET, SITE_URL, DATA_DIR, SMTP_*
npm run build
pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup
sudo cp deploy/nginx.conf /etc/nginx/sites-available/automotoresaro   # cambiar TUDOMINIO
sudo ln -s /etc/nginx/sites-available/automotoresaro /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d TUDOMINIO.com.ar -d www.TUDOMINIO.com.ar   # HTTPS gratis
```

- **Una sola instancia** de la app (ya configurado en PM2): los datos se guardan en archivos.
- `DATA_DIR` conviene que esté **fuera** de la carpeta del proyecto (ej. `/var/lib/automotoresaro`), así una actualización nunca la toca.
- **Respaldos:** `deploy/respaldo.sh` comprime `DATA_DIR` todos los días y guarda 30 días. Programarlo con `crontab -e`. Ideal: copiar esos archivos también fuera del VPS.
- **Actualizar** a una versión nueva: `git pull && npm ci && npm run build && pm2 restart automotoresaro`.

### Mails (para que lleguen y no vayan a spam)

Mandar mails directo desde un VPS casi siempre termina en spam. Conviene un proveedor SMTP (Brevo tiene un plan gratis de 300 mails por día; también Resend o Amazon SES) y **verificar el dominio** ahí: el proveedor te da registros **SPF** y **DKIM** para cargar en el DNS del dominio. Después se completan las variables `SMTP_*` y `MAIL_FROM` (ej. `ventas@tudominio.com.ar`).

## Modo tienda online (`NEXT_PUBLIC_RUBRO=tienda`)

El mismo sistema funciona como **tienda online** para cualquier comercio. Comparte todo lo común (panel, ingreso, empleados, clientes con favoritos, mails, marca y portada, datos del negocio) y cambia lo específico:

- **Para el comprador:** portada con buscador, categorías, destacados y ofertas; catálogo con búsqueda, categorías y orden; página de producto con fotos, opciones (talle, color…), cantidad y aviso de "quedan pocos"; **carrito** (queda guardado en su celular); **finalizar compra** con retiro en el local o envío a domicilio (costo y envío gratis desde cierto monto) y pago con **Mercado Pago**, **transferencia** (muestra alias/CBU y botón para mandar el comprobante por WhatsApp) o **efectivo**; **página del pedido** para seguir el estado; en Mi cuenta, sus favoritos y sus pedidos.
- **En el panel:**
  - **Productos:** fotos, categoría, precio y precio anterior (oferta), stock con botones + y −, opciones, destacado, ocultar o publicar.
  - **Pedidos:** Nuevos, En curso, Entregados y Cancelados. Un botón grande con el siguiente paso ("Empezar a prepararlo", "Ya lo envié", "Ya lo entregué"), "Ya me pagó", WhatsApp con el aviso ya escrito y notas internas. Al cancelar, el stock vuelve solo.
  - **Ajustes → Envíos y pagos.**
  - **Inicio:** pedidos nuevos, lo que falta cobrar, ventas del mes, ticket promedio, los más vendidos y productos para reponer.
- **Seguridad:** el servidor recalcula precios, stock y envío al confirmar (no confía en el navegador). El stock se descuenta de a una compra por vez, así dos personas no pueden comprar la última unidad. El pedido solo lo ve quien tiene su link.
- **Mails:** si el SMTP está configurado, llega un aviso a `ADMIN_EMAIL` por cada pedido y el comprador recibe la confirmación.

**Mercado Pago:** cargar `MP_ACCESS_TOKEN` (Mercado Pago → Tus integraciones → Credenciales de producción) y activarlo en **Envíos y pagos**. El comprador paga en Mercado Pago y vuelve a la página de su pedido. El aviso de pago llega a `/api/mp/webhook` y el sistema lo verifica consultando a Mercado Pago antes de marcarlo como pagado. Hace falta que el sitio esté publicado con HTTPS para que lleguen los avisos.

Una tienda nueva arranca con productos de ejemplo, que se borran con un botón desde el Inicio del panel.

## Vender el sistema a otras agencias (o tiendas)

Cada cliente tiene **su propia página**: su dominio, su marca y sus datos, totalmente separados de los demás. Todas corren en tu VPS, cada una en su carpeta y en su puerto.

**Dar de alta un cliente nuevo** (el dominio ya tiene que apuntar a la IP del VPS):

```bash
sudo CERTBOT_EMAIL=vos@mail.com deploy/nueva-agencia.sh lopez autoslopez.com.ar 3001 autos
```

- Para una **tienda online** en vez de agencia: último parámetro `tienda`.
- Agregá `--simular` al final para ver todos los pasos sin cambiar nada.
- Crea `/opt/agencias/<nombre>` (copia del sistema) y `/var/lib/agencias/<nombre>` (sus datos), genera una contraseña inicial, lo deja prendido con PM2, lo publica en nginx y saca el certificado HTTPS. Al final muestra usuario y contraseña para pasarle al cliente.
- Si el repositorio es privado, el VPS necesita acceso (una *deploy key* de GitHub de solo lectura).
- Cada cliente personaliza todo desde **su** panel: **Ajustes → Marca y portada** (colores, logo, foto y textos de la portada, beneficios), **Datos del negocio**, **Empleados**, **Comisiones**.

**Actualizar a todos** cuando mejorás el sistema (`git push` a la rama y después):

```bash
sudo deploy/actualizar-todas.sh
```

Compila cada una en una carpeta aparte y recién si sale bien la reemplaza, así la página no se corta. Si una falla, queda como estaba.

Cada instalación usa unos 400 MB de disco y 150–250 MB de memoria: un VPS de 4 GB alcanza para unas 10 a 15.

## Hoja de ruta (próximas etapas)

- **Registro de consultas** (leads) además de WhatsApp, para hacer seguimiento.
- **Tasador automático** del usado según marca, modelo, año y km (referencia de precios de mercado).
- **Reserva online con seña** con Mercado Pago.
- **Publicación automática** del stock en Mercado Libre, Instagram y Facebook Marketplace.
- **Precalificación crediticia** online integrada con la financiera.
- SEO: sitemap, datos estructurados de vehículos y Google Business Profile.
