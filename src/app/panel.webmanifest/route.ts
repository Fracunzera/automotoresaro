import { getAgencia } from "@/lib/agencia";

/** Manifiesto para instalar el panel como app en el celular, con el nombre y colores de la agencia. */
export async function GET() {
  const ag = await getAgencia();
  const corto = ag.nombre.split(/\s+/).pop() ?? ag.nombre;
  return Response.json(
    {
      name: `Panel ${ag.nombre}`,
      short_name: `Panel ${corto}`.slice(0, 20),
      start_url: "/admin",
      scope: "/",
      display: "standalone",
      background_color: "#f3f2ef",
      theme_color: ag.marca.colorOscuro,
      icons: [
        { src: "/api/icono/192", sizes: "192x192", type: "image/png" },
        { src: "/api/icono/512", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
