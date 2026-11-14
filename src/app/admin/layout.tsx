import type { Metadata, Viewport } from "next";
import { getAgencia } from "@/lib/agencia";

export async function generateMetadata(): Promise<Metadata> {
  const ag = await getAgencia();
  return {
    title: "Panel",
    robots: { index: false, follow: false },
    // Para poder "Agregar a pantalla de inicio" y abrirlo como una app
    manifest: "/panel.webmanifest",
    appleWebApp: { capable: true, title: `Panel ${ag.nombre.split(/\s+/).pop()}`, statusBarStyle: "black" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  return { themeColor: (await getAgencia()).marca.colorOscuro };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-papel text-[18px]">{children}</div>;
}
