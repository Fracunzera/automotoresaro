import type { Metadata } from "next";
import { getAgencia } from "@/lib/agencia";
import { cssTema } from "@/lib/agencia-tipos";
import { esTienda } from "@/lib/rubro";
import { AgenciaProvider } from "@/components/AgenciaContext";
import { barlow, barlowCondensed } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const ag = await getAgencia();
  return {
    // Base para las direcciones completas de las vistas previas (WhatsApp, Facebook)
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
    title: { default: `${ag.nombre} | ${esTienda ? "Tienda online" : "Autos usados"} en ${ag.ciudad}`, template: `%s | ${ag.nombre}` },
    description: ag.marca.descripcion,
    openGraph: { title: ag.nombre, description: ag.marca.descripcion, locale: "es_AR", type: "website" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const agencia = await getAgencia();
  return (
    <html lang="es-AR" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <head>
        {/* Colores de la marca (se eligen en Panel → Ajustes → Marca y portada) */}
        <style dangerouslySetInnerHTML={{ __html: cssTema(agencia.marca) }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <AgenciaProvider agencia={agencia}>{children}</AgenciaProvider>
      </body>
    </html>
  );
}
