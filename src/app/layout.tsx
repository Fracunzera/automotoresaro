import type { Metadata } from "next";
import { site } from "@/config/site";
import { getAgencia } from "@/lib/agencia";
import { AgenciaProvider } from "@/components/AgenciaContext";
import { barlow, barlowCondensed } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const ag = await getAgencia();
  return {
    title: { default: `${ag.nombre} | Autos usados en ${ag.ciudad}`, template: `%s | ${ag.nombre}` },
    description: site.descripcion,
    openGraph: { title: ag.nombre, description: site.descripcion, locale: "es_AR", type: "website" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const agencia = await getAgencia();
  return (
    <html lang="es-AR" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <AgenciaProvider agencia={agencia}>{children}</AgenciaProvider>
      </body>
    </html>
  );
}
