import type { Metadata } from "next";
import { site } from "@/config/site";
import { barlow, barlowCondensed } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${site.nombre} | Autos usados en ${site.ciudad}`, template: `%s | ${site.nombre}` },
  description: site.descripcion,
  openGraph: { title: site.nombre, description: site.descripcion, locale: "es_AR", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
