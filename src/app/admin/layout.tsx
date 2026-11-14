import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
  // Para poder "Agregar a pantalla de inicio" y abrirlo como una app
  manifest: "/panel.webmanifest",
  appleWebApp: { capable: true, title: "Panel Aro", statusBarStyle: "black" },
};

export const viewport: Viewport = { themeColor: "#15171a" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-papel text-[18px]">{children}</div>;
}
